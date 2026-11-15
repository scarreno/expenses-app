import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { z } from "zod";

import { loadLocalEnv } from "@/workers/load-env";
import type { ProcessReceiptWork, ProcessorOptions, WorkerDb } from "@/workers/receipt-processor";

loadLocalEnv();

const databaseUrl = process.env.DATABASE_URL;
const describeWithDb = databaseUrl ? describe : describe.skip;

type ProcessorModule = typeof import("@/workers/receipt-processor");

const extracted = {
  store: "Test market",
  branch: null,
  purchaseDate: "2026-08-14",
  purchaseTime: null,
  paymentMethod: null,
  subtotal: 100,
  tax: 19,
  total: 119,
  items: [],
};

const createdUserIds: string[] = [];

describeWithDb("receipt processor integration", () => {
  let processor: ProcessorModule;
  let db: WorkerDb;

  beforeAll(async () => {
    processor = await import("@/workers/receipt-processor");
    db = processor.createWorkerDb(databaseUrl as string);
  });

  afterAll(async () => {
    if (!db) {
      return;
    }

    for (const userId of createdUserIds) {
      await deleteUser(db, userId);
    }
    await db.end();
  });

  it("persists a successful extraction without creating receipt items", async () => {
    const fixture = await createFixture(db);
    const deleted: string[] = [];

    const claimed = await processor.processNextJob(
      options(db, fixture.userId, {
        deleteFile: async (filePath) => {
          deleted.push(filePath);
        },
        processFile: async () => ({ extractedData: extracted }),
      }),
      null,
    );

    expect(claimed).toBe(true);
    expect(deleted).toEqual([]);
    await expectReceipt(db, fixture.receiptId, {
      status: "READY_FOR_REVIEW",
      items: 0,
    });
    await expectJob(db, fixture.jobId, { status: "SUCCEEDED", attempts: 1 });
    expect(await notificationCount(db, fixture.jobId)).toBe(1);
  });

  it("schedules a retry for invalid model output and does not notify", async () => {
    const fixture = await createFixture(db);
    await processor.processNextJob(
      options(db, fixture.userId, {
        processFile: async () => {
          z.object({ store: z.string() }).parse({ store: 1 });
          return { extractedData: extracted };
        },
      }),
      null,
    );

    const job = await jobRow(db, fixture.jobId);
    expect(job.status).toBe("QUEUED");
    expect(job.attempts).toBe(1);
    expect(job.locked_by).toBeNull();
    expect(new Date(job.available_at).getTime()).toBeGreaterThan(Date.now() + 20_000);
    expect(job.last_error).toContain("ZOD_VALIDATION");
    await expectReceipt(db, fixture.receiptId, { status: "EXTRACTING", items: 0 });
    expect(await notificationCount(db, fixture.jobId)).toBe(0);
  });

  it("fails a missing file on the first attempt", async () => {
    const fixture = await createFixture(db);
    await processor.processNextJob(
      options(db, fixture.userId, {
        processFile: async () => {
          throw new Error("Failed to download uploaded file. Status: 404");
        },
      }),
      null,
    );

    await expectJob(db, fixture.jobId, { status: "FAILED", attempts: 1 });
    await expectReceipt(db, fixture.receiptId, { status: "EXTRACTION_FAILED", items: 0 });
    expect(await notificationCount(db, fixture.jobId)).toBe(1);
  });

  it("fails a retryable error once the attempt budget is spent", async () => {
    const fixture = await createFixture(db, { attempts: 2 });

    await processor.processNextJob(
      options(db, fixture.userId, {
        processFile: async () => {
          throw new SyntaxError("Unexpected token");
        },
      }),
      null,
    );

    await expectJob(db, fixture.jobId, { status: "FAILED", attempts: 3 });
    await expectReceipt(db, fixture.receiptId, { status: "EXTRACTION_FAILED", items: 0 });
    expect(await notificationCount(db, fixture.jobId)).toBe(1);

    await processor.runOnce(
      options(db, fixture.userId, {
        processFile: async () => ({ extractedData: extracted }),
      }),
    );
    expect(await notificationCount(db, fixture.jobId)).toBe(1);
  });

  it("does not claim a retry scheduled after the once batch started", async () => {
    const fixture = await createFixture(db, {
      availableAtSql: "now() + interval '1 day'",
    });
    let calls = 0;

    await processor.runOnce(
      options(db, fixture.userId, {
        processFile: async () => {
          calls += 1;
          return { extractedData: extracted };
        },
      }),
    );

    expect(calls).toBe(0);
    await expectJob(db, fixture.jobId, { status: "QUEUED", attempts: 0 });
  });

  it("reclaims an expired lease and recovers an exhausted one", async () => {
    const recoverable = await createFixture(db, {
      status: "PROCESSING",
      attempts: 1,
      lockedBy: "crashed-worker",
      lockedUntilSql: "now() - interval '1 minute'",
    });
    const exhausted = await createFixture(db, {
      status: "PROCESSING",
      attempts: 3,
      lockedBy: "crashed-worker",
      lockedUntilSql: "now() - interval '1 minute'",
      userId: recoverable.userId,
    });
    await processor.runOnce(
      options(db, recoverable.userId, {
        processFile: async () => ({ extractedData: extracted }),
      }),
    );

    await expectJob(db, recoverable.jobId, { status: "SUCCEEDED", attempts: 2 });
    await expectReceipt(db, recoverable.receiptId, { status: "READY_FOR_REVIEW", items: 0 });
    await expectJob(db, exhausted.jobId, { status: "FAILED", attempts: 3 });
    await expectReceipt(db, exhausted.receiptId, { status: "EXTRACTION_FAILED", items: 0 });
    expect(await notificationCount(db, exhausted.jobId)).toBe(1);
  });

  it("claims different jobs for two workers", async () => {
    const first = await createFixture(db);
    await createFixture(db, { userId: first.userId });
    const other = processor.createWorkerDb(databaseUrl as string);
    const seen: string[] = [];
    const processFile: ProcessReceiptWork = async () => {
      await new Promise((resolve) => setTimeout(resolve, 150));
      return { extractedData: extracted };
    };

    try {
      await Promise.all([
        processor.processNextJob(
          options(db, first.userId, { workerId: "worker-a", processFile }),
          null,
        ),
        processor.processNextJob(
          options(other, first.userId, { workerId: "worker-b", processFile }),
          null,
        ),
      ]);

      const jobs = await db.query<{ id: string; locked_by: string | null; status: string }>(
        `SELECT id, "lockedBy" AS locked_by, status FROM "ProcessingJob" WHERE "userId" = $1 ORDER BY id`,
        [first.userId],
      );
      for (const job of jobs.rows) {
        seen.push(`${job.id}:${job.status}`);
      }
      expect(jobs.rows.every((job) => job.status === "SUCCEEDED")).toBe(true);
      expect(new Set(jobs.rows.map((job) => job.id)).size).toBe(2);
    } finally {
      await other.end();
    }

    expect(seen).toHaveLength(2);
  });

  it("does not delete a file while the worker lease is active", async () => {
    const fixture = await createFixture(db);
    const deleted: string[] = [];
    const deleteFile = async (filePath: string) => {
      deleted.push(filePath);
    };

    let release: () => void = () => undefined;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });

    const running = processor.processNextJob(
      options(db, fixture.userId, {
        deleteFile,
        processFile: async () => {
          const decision = await processor.discardReceiptWork(db, {
            receiptId: fixture.receiptId,
            userId: fixture.userId,
            deleteFile,
          });
          expect(decision).toBe("deferred");
          release();
          return { extractedData: extracted };
        },
      }),
      null,
    );

    await gate;
    expect(deleted).toEqual([]);
    await running;
    expect(deleted).toEqual(["receipts/phase2-test.pdf"]);
    await expectJob(db, fixture.jobId, { status: "CANCELLED", attempts: 1 });
    await expectReceipt(db, fixture.receiptId, { status: "DISCARDED", items: 0 });
    const file = await db.query<{ file_path: string | null }>(
      `SELECT "filePath" AS file_path FROM "Receipt" WHERE id = $1`,
      [fixture.receiptId],
    );
    expect(file.rows[0]?.file_path).toBeNull();
  });

  it("cleans a discarded file after the lease expires", async () => {
    const fixture = await createFixture(db, {
      receiptStatus: "DISCARDED",
      status: "PROCESSING",
      attempts: 1,
      lockedBy: "crashed-worker",
      lockedUntilSql: "now() - interval '1 minute'",
    });
    const deleted: string[] = [];

    await processor.runOnce(
      options(db, fixture.userId, {
        deleteFile: async (filePath) => {
          deleted.push(filePath);
        },
        processFile: async () => ({ extractedData: extracted }),
      }),
    );

    expect(deleted).toEqual(["receipts/phase2-test.pdf"]);
    await expectJob(db, fixture.jobId, { status: "CANCELLED", attempts: 1 });
    const file = await db.query<{ file_path: string | null }>(
      `SELECT "filePath" AS file_path FROM "Receipt" WHERE id = $1`,
      [fixture.receiptId],
    );
    expect(file.rows[0]?.file_path).toBeNull();
  });

  it("reads a supported extension from the stored path when the display name has none", async () => {
    const fixture = await createFixture(db);
    await db.query(
      `UPDATE "Receipt" SET "fileName" = $2, "filePath" = $3 WHERE id = $1`,
      [fixture.receiptId, "boleta", "/tmp/receipts/boleta.pdf"],
    );
    let generatedFileName = "";

    await processor.processNextJob(
      options(db, fixture.userId, {
        processFile: async (input) => {
          generatedFileName = input.generatedFileName;
          return { extractedData: extracted };
        },
      }),
      null,
    );

    expect(generatedFileName).toBe("boleta.pdf");
    await expectReceipt(db, fixture.receiptId, { status: "READY_FOR_REVIEW", items: 0 });
  });
});

function options(
  db: WorkerDb,
  userId: string,
  overrides: Partial<ProcessorOptions> = {},
): ProcessorOptions {
  return {
    db,
    workerId: "phase2-test-worker",
    scopeUserId: userId,
    heartbeatMs: 60_000,
    logger: () => undefined,
    deleteFile: async () => undefined,
    processFile: async () => ({ extractedData: extracted }),
    ...overrides,
  };
}

async function createFixture(
  db: WorkerDb,
  input: {
    userId?: string;
    receiptStatus?: string;
    status?: string;
    attempts?: number;
    availableAtSql?: string;
    lockedUntilSql?: string;
    lockedBy?: string;
  } = {},
) {
  const userId = input.userId ?? `phase2-${crypto.randomUUID()}`;
  const receiptId = crypto.randomUUID();
  const jobId = crypto.randomUUID();

  if (!input.userId) {
    createdUserIds.push(userId);
    await db.query(`INSERT INTO "User" (id) VALUES ($1)`, [userId]);
  }

  await db.query(
    `
      INSERT INTO "Receipt" (
        id, "userId", status, "receiptType", "fileName", "filePath", "publicFileUrl"
      )
      VALUES ($1, $2, $3, 'SUPERMARKET', 'phase2-test.pdf', 'receipts/phase2-test.pdf', 'https://example.test/phase2-test.pdf')
    `,
    [receiptId, userId, input.receiptStatus ?? "EXTRACTING"],
  );

  await db.query(
    `
      INSERT INTO "ProcessingJob" (
        id, "receiptId", "userId", status, attempts, "maxAttempts",
        "availableAt", "lockedUntil", "lockedBy", "updatedAt"
      )
      VALUES (
        $1, $2, $3, $4, $5, 3,
        ${input.availableAtSql ?? "now()"},
        ${input.lockedUntilSql ?? "NULL"},
        $6,
        now()
      )
    `,
    [jobId, receiptId, userId, input.status ?? "QUEUED", input.attempts ?? 0, input.lockedBy ?? null],
  );

  return { userId, receiptId, jobId };
}

async function deleteUser(db: WorkerDb, userId: string) {
  await db.query(`DELETE FROM "Receipt" WHERE "userId" = $1`, [userId]);
  await db.query(`DELETE FROM "User" WHERE id = $1`, [userId]);
}

async function expectReceipt(
  db: WorkerDb,
  receiptId: string,
  expected: { status: string; items: number },
) {
  const receipt = await db.query<{ status: string; items: number }>(
    `
      SELECT status, (
        SELECT COUNT(*)::int FROM "ReceiptItem" AS item WHERE item."receiptId" = receipt.id
      ) AS items
      FROM "Receipt" AS receipt
      WHERE id = $1
    `,
    [receiptId],
  );
  expect(receipt.rows[0]).toMatchObject(expected);
}

async function expectJob(
  db: WorkerDb,
  jobId: string,
  expected: { status: string; attempts: number },
) {
  const job = await jobRow(db, jobId);
  expect(job.status).toBe(expected.status);
  expect(Number(job.attempts)).toBe(expected.attempts);
}

async function jobRow(db: WorkerDb, jobId: string) {
  const result = await db.query<{
    status: string;
    attempts: number;
    available_at: Date;
    locked_by: string | null;
    last_error: string | null;
  }>(
    `
      SELECT
        status,
        attempts,
        "availableAt" AS available_at,
        "lockedBy" AS locked_by,
        "lastError" AS last_error
      FROM "ProcessingJob"
      WHERE id = $1
    `,
    [jobId],
  );
  const row = result.rows[0];
  if (!row) {
    throw new Error("Job not found");
  }
  return row;
}

async function notificationCount(db: WorkerDb, jobId: string) {
  const result = await db.query<{ count: number }>(
    `SELECT COUNT(*)::int AS count FROM "Notification" WHERE "jobId" = $1`,
    [jobId],
  );
  return Number(result.rows[0]?.count ?? 0);
}
