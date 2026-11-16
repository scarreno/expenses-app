import { randomUUID } from "node:crypto";
import path from "node:path";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { loadLocalEnv } from "@/workers/load-env";
import { confirmedReceiptStatusWhere } from "@/app/lib/receipts/receipt-lifecycle";

loadLocalEnv();

const describeWithDb = process.env.DATABASE_URL ? describe : describe.skip;

type ExtractionApi = typeof import("@/app/lib/receipts/extraction-api");
type PrismaClient = typeof import("@/app/lib/database/prisma").prisma;

const extracted = {
  store: "QA Market",
  branch: null,
  purchaseDate: "2026-08-14",
  purchaseTime: null,
  paymentMethod: "CASH",
  subtotal: 1000,
  tax: 190,
  total: 1190,
  items: [
    {
      sku: null,
      description: "Milk",
      quantity: 1,
      unit: "UNIT",
      unitPrice: 1190,
      totalPrice: 1190,
      category: null,
    },
  ],
};

describeWithDb("receipt extraction api", { timeout: 20_000 }, () => {
  let api: ExtractionApi;
  let prisma: PrismaClient;
  const userIds: string[] = [];

  beforeAll(async () => {
    api = await import("@/app/lib/receipts/extraction-api");
    prisma = (await import("@/app/lib/database/prisma")).prisma;
  });

  afterAll(async () => {
    if (!prisma || userIds.length === 0) {
      return;
    }

    await prisma.receipt.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.category.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  });

  it("enqueues a receipt and job without counting it in confirmed totals", async () => {
    const userId = await createUser();
    const created = await api.enqueueExtraction(uploadInput(userId));

    expect(created.replayed).toBe(false);
    expect(created.status).toBe("EXTRACTING");

    const receipt = await prisma.receipt.findUnique({
      where: { id: created.receiptId },
      include: { items: true, processingJob: true },
    });
    expect(receipt?.status).toBe("EXTRACTING");
    expect(receipt?.items).toHaveLength(0);
    expect(receipt?.processingJob?.status).toBe("QUEUED");

    const confirmed = await prisma.receipt.count({
      where: {
        id: created.receiptId,
        ...confirmedReceiptStatusWhere(),
      },
    });
    expect(confirmed).toBe(0);

    const view = await api.getExtraction(userId, created.receiptId);
    expect(view?.status).toBe("EXTRACTING");
    expect(view?.receipt).toBeNull();
    expect(view?.jobStatus).toBe("QUEUED");
  });

  it("returns the existing job for a duplicate idempotency key", async () => {
    const userId = await createUser();
    const input = uploadInput(userId);
    const first = await api.enqueueExtraction(input);
    const second = await api.enqueueExtraction(input);

    expect(second.replayed).toBe(true);
    expect(second.receiptId).toBe(first.receiptId);
    expect(second.jobId).toBe(first.jobId);
    expect(await prisma.receipt.count({ where: { userId } })).toBe(1);
  });

  it("keeps one receipt when the same key is submitted concurrently", async () => {
    const userId = await createUser();
    const input = uploadInput(userId);
    const [first, second] = await Promise.all([
      api.enqueueExtraction(input),
      api.enqueueExtraction(input),
    ]);

    expect(first.receiptId).toBe(second.receiptId);
    expect(await prisma.receipt.count({ where: { userId } })).toBe(1);
  });

  it("hides another user's extraction and refuses their confirmation", async () => {
    const ownerId = await createUser();
    const otherId = await createUser();
    const created = await api.enqueueExtraction(uploadInput(ownerId));

    expect(await api.getExtraction(otherId, created.receiptId)).toBeNull();
    await expect(
      api.confirmExtraction(otherId, created.receiptId, { receipt: extracted }),
    ).rejects.toMatchObject({ status: 404 });
    await expect(
      api.discardExtraction(otherId, created.receiptId, {
        deleteFile: async () => undefined,
      }),
    ).rejects.toMatchObject({ status: 404 });

    const receipt = await prisma.receipt.findUnique({ where: { id: created.receiptId } });
    expect(receipt?.status).toBe("EXTRACTING");
  });

  it("rejects confirmation until the receipt is ready, then confirms once", async () => {
    const userId = await createUser();
    const created = await api.enqueueExtraction(uploadInput(userId));

    await expect(
      api.confirmExtraction(userId, created.receiptId, { receipt: extracted }),
    ).rejects.toMatchObject({ status: 409 });
    expect(await prisma.receiptItem.count({ where: { receiptId: created.receiptId } })).toBe(0);

    await prisma.receipt.update({
      where: { id: created.receiptId },
      data: {
        status: "READY_FOR_REVIEW",
        rawJson: extracted,
      },
    });

    const ready = await api.getExtraction(userId, created.receiptId);
    expect(ready?.status).toBe("READY_FOR_REVIEW");
    expect(ready?.receipt?.store).toBe("QA Market");

    const saved = await api.confirmExtraction(userId, created.receiptId, {
      receiptType: "MARKET",
      receipt: extracted,
    });
    const repeated = await api.confirmExtraction(userId, created.receiptId, {
      receipt: extracted,
    });

    expect(saved.status).toBe("PROCESSED");
    expect(saved.receiptType).toBe("MARKET");
    expect(saved.items).toHaveLength(1);
    expect(repeated.items).toHaveLength(1);
    expect(await prisma.receiptItem.count({ where: { receiptId: created.receiptId } })).toBe(1);

    const confirmed = await prisma.receipt.count({
      where: {
        id: created.receiptId,
        ...confirmedReceiptStatusWhere(),
      },
    });
    expect(confirmed).toBe(1);

    await expect(
      api.discardExtraction(userId, created.receiptId, {
        deleteFile: async () => undefined,
      }),
    ).rejects.toMatchObject({ status: 404 });
    expect(
      (await prisma.receipt.findUnique({ where: { id: created.receiptId } }))?.status,
    ).toBe("PROCESSED");
  });

  it("discards a queued extraction and cancels its job", async () => {
    const userId = await createUser();
    const created = await api.enqueueExtraction(uploadInput(userId));
    const deleted: string[] = [];

    const result = await api.discardExtraction(userId, created.receiptId, {
      deleteFile: async (filePath) => {
        deleted.push(filePath);
      },
    });

    expect(result).toEqual({ status: "DISCARDED", fileCleanup: "deleted" });
    expect(deleted).toHaveLength(1);
    expect(
      (await prisma.receipt.findUnique({ where: { id: created.receiptId } }))?.status,
    ).toBe("DISCARDED");
    expect(
      (await prisma.processingJob.findUnique({ where: { id: created.jobId } }))?.status,
    ).toBe("CANCELLED");
  });

  it("defers file deletion while a processing lease is active", async () => {
    const userId = await createUser();
    const created = await api.enqueueExtraction(uploadInput(userId));
    await prisma.$executeRaw`
      UPDATE "ProcessingJob"
      SET
        status = 'PROCESSING',
        "lockedBy" = 'phase3-test',
        "lockedUntil" = (now() AT TIME ZONE 'UTC') + interval '1 minute',
        "updatedAt" = now()
      WHERE id = ${created.jobId}
    `;
    const deleted: string[] = [];

    const result = await api.discardExtraction(userId, created.receiptId, {
      deleteFile: async (filePath) => {
        deleted.push(filePath);
      },
    });

    expect(result.fileCleanup).toBe("deferred");
    expect(deleted).toEqual([]);
    expect(
      (await prisma.receipt.findUnique({ where: { id: created.receiptId } }))?.status,
    ).toBe("DISCARDED");
    expect(
      (await prisma.processingJob.findUnique({ where: { id: created.jobId } }))?.status,
    ).toBe("PROCESSING");
  });

  it("deletes the file when the processing lease has expired", async () => {
    const userId = await createUser();
    const created = await api.enqueueExtraction(uploadInput(userId));
    await prisma.$executeRaw`
      UPDATE "ProcessingJob"
      SET
        status = 'PROCESSING',
        "lockedBy" = 'phase3-test',
        "lockedUntil" = (now() AT TIME ZONE 'UTC') - interval '1 minute',
        "updatedAt" = now()
      WHERE id = ${created.jobId}
    `;
    const deleted: string[] = [];

    const result = await api.discardExtraction(userId, created.receiptId, {
      deleteFile: async (filePath) => {
        deleted.push(filePath);
      },
    });

    expect(result.fileCleanup).toBe("deleted");
    expect(deleted).toHaveLength(1);
    expect(
      (await prisma.receipt.findUnique({ where: { id: created.receiptId } }))?.status,
    ).toBe("DISCARDED");
    expect(
      (await prisma.processingJob.findUnique({ where: { id: created.jobId } }))?.status,
    ).toBe("CANCELLED");
  });

  it("rejects an upload location outside the configured storage", async () => {
    const userId = await createUser();

    await expect(
      api.enqueueExtraction({
        ...uploadInput(userId),
        filePath: "/etc/passwd",
        publicFileUrl: "https://example.com/receipt.pdf",
      }),
    ).rejects.toMatchObject({ status: 400 });
    expect(await prisma.receipt.count({ where: { userId } })).toBe(0);
  });

  async function createUser() {
    const id = `phase3-${randomUUID()}`;
    await prisma.user.create({ data: { id } });
    userIds.push(id);
    return id;
  }
});

function uploadInput(userId: string) {
  const generatedFileName = `${randomUUID()}.pdf`;
  return {
    userId,
    idempotencyKey: randomUUID(),
    receiptType: "SUPERMARKET",
    originalName: "boleta.pdf",
    generatedFileName,
    publicFileUrl: `/uploads/${generatedFileName}`,
    filePath: path.join(process.cwd(), "public", "uploads", generatedFileName),
  };
}
