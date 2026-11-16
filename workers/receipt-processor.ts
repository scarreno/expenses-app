import { Pool, type PoolClient, type QueryResult, type QueryResultRow } from "pg";

import { processReceiptFile } from "@/app/services/process-receipt-file";
import { deleteReceiptFile } from "@/app/lib/storage/storage";
import {
  NOTIFICATION_TYPE,
  PROCESSING_JOB_STATUS,
  RECEIPT_STATUS,
} from "@/app/lib/receipts/receipt-lifecycle";
import {
  DEFAULT_ATTEMPT_TIMEOUT_MS,
  DEFAULT_HEARTBEAT_MS,
  DEFAULT_LEASE_MS,
  DEFAULT_POLL_INTERVAL_MS,
  DEFAULT_WORKER_CONCURRENCY,
  NOTIFICATION_MESSAGE_KEY,
  ExtractionFailure,
  classifyExtractionError,
  errorRecord,
  fileCleanupDecision,
  isConfirmedReceiptProtected,
  isSupportedReceiptFile,
  retryDelayMs,
  runWorkerLoop,
  sleep,
} from "@/workers/extraction-policy";

export {
  DEFAULT_ATTEMPT_TIMEOUT_MS,
  DEFAULT_HEARTBEAT_MS,
  DEFAULT_LEASE_MS,
  DEFAULT_POLL_INTERVAL_MS,
  DEFAULT_WORKER_CONCURRENCY,
};

type SqlQuery = <T extends QueryResultRow = QueryResultRow>(
  sql: string,
  params?: unknown[],
) => Promise<QueryResult<T>>;

export type WorkerDb = {
  query: SqlQuery;
  transaction<T>(fn: (query: SqlQuery) => Promise<T>): Promise<T>;
  end: () => Promise<void>;
};

export type ProcessReceiptWork = (input: {
  receiptType: string;
  filePath: string;
  generatedFileName: string;
  publicFileUrl: string;
  userId: string;
}) => Promise<{ extractedData: unknown }>;

export type WorkerLogger = (event: Record<string, string | number | boolean | null>) => void;

type ClaimedJob = {
  id: string;
  receiptId: string;
  userId: string;
  attempts: number;
  maxAttempts: number;
};

type ReceiptWorkRow = {
  id: string;
  status: string;
  receiptType: string | null;
  fileName: string | null;
  filePath: string | null;
  publicFileUrl: string | null;
  userId: string | null;
};

export type ProcessorOptions = {
  db: WorkerDb;
  workerId: string;
  concurrency?: number;
  leaseMs?: number;
  heartbeatMs?: number;
  attemptTimeoutMs?: number;
  signal?: AbortSignal;
  processFile?: ProcessReceiptWork;
  deleteFile?: (filePath: string) => Promise<void>;
  logger?: WorkerLogger;
  /**
   * Limits claim and recovery to one user. The worker leaves this empty.
   * Tests set it so they cannot claim another user's jobs.
   */
  scopeUserId?: string;
};

const preparedClients = new WeakSet<PoolClient>();

export function createWorkerDb(connectionString: string, max = 4): WorkerDb {
  const pool = new Pool({
    connectionString,
    max,
  });

  async function prepare(client: PoolClient) {
    if (preparedClients.has(client)) {
      return;
    }

    await client.query("SET TIME ZONE 'UTC'");
    await client.query("SELECT set_config('application_name', 'receipt-worker', false)");
    preparedClients.add(client);
  }

  const query: SqlQuery = async (sql, params) => {
    const client = await pool.connect();
    try {
      await prepare(client);
      return await client.query(sql, params);
    } finally {
      client.release();
    }
  };

  return {
    query,
    async transaction(fn) {
      const client = await pool.connect();
      try {
        await prepare(client);
        await client.query("BEGIN");
        const result = await fn((sql, params) => client.query(sql, params));
        await client.query("COMMIT");
        return result;
      } catch (error) {
        try {
          await client.query("ROLLBACK");
        } catch {
          // The original error is the one that matters.
        }
        throw error;
      } finally {
        client.release();
      }
    },
    end: () => pool.end(),
  };
}

export async function runOnce(options: ProcessorOptions) {
  const cutoff = await readDatabaseNow(options.db);
  await drainJobs(options, cutoff);
}

export async function runDaemon(
  options: ProcessorOptions & { pollIntervalMs?: number },
) {
  const pollIntervalMs = options.pollIntervalMs ?? DEFAULT_POLL_INTERVAL_MS;
  await runWorkerLoop({
    mode: "daemon",
    pollIntervalMs,
    signal: options.signal,
    drain: () => drainJobs(options, null),
    sleep,
  });
}

export async function processNextJob(
  options: ProcessorOptions,
  cutoff: Date | null,
): Promise<boolean> {
  const job = await claimNextJob(options, cutoff);
  if (!job) {
    return false;
  }

  await executeClaimedJob(options, job);
  return true;
}

export async function discardReceiptWork(
  db: WorkerDb,
  input: {
    receiptId: string;
    userId: string;
    deleteFile?: (filePath: string) => Promise<void>;
    logger?: WorkerLogger;
  },
): Promise<"deleted" | "deferred" | "missing"> {
  const deleteFile = input.deleteFile ?? deleteReceiptFile;
  const decision = await db.transaction(async (query) => {
    const locked = await query<{
      jobId: string;
      jobStatus: string;
      leaseActive: boolean;
      receiptStatus: string;
      filePath: string | null;
    }>(
      `
        SELECT
          job.id AS "jobId",
          job.status AS "jobStatus",
          (
            job.status = 'PROCESSING'
            AND job."lockedUntil" IS NOT NULL
            AND job."lockedUntil" > (now() AT TIME ZONE 'UTC')
          ) AS "leaseActive",
          receipt.status AS "receiptStatus",
          receipt."filePath"
        FROM "ProcessingJob" AS job
        JOIN "Receipt" AS receipt ON receipt.id = job."receiptId"
        WHERE receipt.id = $1 AND job."userId" = $2
        FOR UPDATE
      `,
      [input.receiptId, input.userId],
    );

    const row = locked.rows[0];
    if (!row || isConfirmedReceiptProtected(row.receiptStatus)) {
      return { action: "missing" as const };
    }

    if (fileCleanupDecision({ jobStatus: row.jobStatus, leaseActive: row.leaseActive }) === "defer") {
      await query(
        `
          UPDATE "Receipt"
          SET status = $2
          WHERE id = $1
            AND status IN ($3, $4, $5)
        `,
        [
          input.receiptId,
          RECEIPT_STATUS.DISCARDED,
          RECEIPT_STATUS.EXTRACTING,
          RECEIPT_STATUS.READY_FOR_REVIEW,
          RECEIPT_STATUS.EXTRACTION_FAILED,
        ],
      );
      return { action: "deferred" as const };
    }

    if (
      row.jobStatus === PROCESSING_JOB_STATUS.QUEUED ||
      row.jobStatus === PROCESSING_JOB_STATUS.PROCESSING
    ) {
      await query(
        `
          UPDATE "ProcessingJob"
          SET
            status = $2,
            "lockedBy" = NULL,
            "lockedUntil" = NULL,
            "finishedAt" = now(),
            "updatedAt" = now()
          WHERE id = $1
        `,
        [row.jobId, PROCESSING_JOB_STATUS.CANCELLED],
      );
    }

    await query(
      `
        UPDATE "Receipt"
        SET status = $2
        WHERE id = $1
          AND status <> $3
          AND status <> $4
      `,
      [
        input.receiptId,
        RECEIPT_STATUS.DISCARDED,
        RECEIPT_STATUS.PROCESSED,
        RECEIPT_STATUS.PENDING,
      ],
    );

    return { action: "deleted" as const, filePath: row.filePath };
  });

  if (decision.action !== "deleted") {
    return decision.action;
  }

  await removeReceiptFile(db, input.receiptId, decision.filePath, deleteFile, input.logger);
  return "deleted";
}

async function drainJobs(options: ProcessorOptions, cutoff: Date | null) {
  await recoverInterruptedJobs(options);
  if (options.signal?.aborted) {
    return;
  }

  const concurrency = Math.max(1, options.concurrency ?? DEFAULT_WORKER_CONCURRENCY);
  await Promise.all(
    Array.from({ length: concurrency }, async () => {
      while (!options.signal?.aborted) {
        const claimed = await processNextJob(options, cutoff);
        if (!claimed) {
          return;
        }
      }
    }),
  );
}

async function claimNextJob(
  options: ProcessorOptions,
  cutoff: Date | null,
): Promise<ClaimedJob | null> {
  const leaseMs = options.leaseMs ?? DEFAULT_LEASE_MS;
  const result = await options.db.query<ClaimedJob>(
    `
      WITH candidate AS (
        SELECT id
        FROM "ProcessingJob"
        WHERE (
          $4::text IS NULL OR "userId" = $4
        ) AND (
          (
            status = 'QUEUED'
            AND "availableAt" <= CASE
              WHEN $1::timestamptz IS NULL THEN now()
              ELSE $1::timestamptz
            END
          ) OR (
            status = 'PROCESSING'
            AND "lockedUntil" < (now() AT TIME ZONE 'UTC')
            AND attempts < "maxAttempts"
          )
        )
        ORDER BY "availableAt" ASC, "createdAt" ASC
        FOR UPDATE SKIP LOCKED
        LIMIT 1
      )
      UPDATE "ProcessingJob" AS job
      SET
        status = 'PROCESSING',
        "lockedBy" = $2,
        "lockedAt" = now(),
        "lockedUntil" = (now() AT TIME ZONE 'UTC') + ($3::int * interval '1 millisecond'),
        attempts = job.attempts + 1,
        "startedAt" = COALESCE(job."startedAt", now()),
        "updatedAt" = now()
      FROM candidate
      WHERE job.id = candidate.id
      RETURNING
        job.id,
        job."receiptId",
        job."userId",
        job.attempts,
        job."maxAttempts"
    `,
      [cutoff, options.workerId, leaseMs, options.scopeUserId ?? null],
  );

  const row = result.rows[0];
  if (!row) {
    return null;
  }

  const job = {
    ...row,
    attempts: Number(row.attempts),
    maxAttempts: Number(row.maxAttempts),
  };

  log(options, {
    event: "job.claimed",
    jobId: job.id,
    receiptId: job.receiptId,
    attempt: job.attempts,
  });

  return job;
}

async function executeClaimedJob(options: ProcessorOptions, job: ClaimedJob) {
  const started = Date.now();
  const heartbeat = startHeartbeat(options, job.id);
  try {
    const receipt = await loadReceipt(options.db, job.receiptId);
    if (!receipt) {
      await failMissingReceipt(options, job);
      return;
    }

    if (receipt.status === RECEIPT_STATUS.DISCARDED) {
      await cancelOwnedJob(options, job, receipt.filePath);
      return;
    }

    const pathName = fileNameFromPath(receipt.filePath);
    const fileName =
      receipt.fileName && isSupportedReceiptFile(receipt.fileName)
        ? receipt.fileName
        : pathName;
    if (
      !receipt.receiptType ||
      !receipt.filePath ||
      !receipt.publicFileUrl ||
      !fileName ||
      !isSupportedReceiptFile(fileName)
    ) {
      await finishFailure(
        options,
        job,
        new ExtractionFailure(
          "UNSUPPORTED_FILE",
          false,
          "Receipt file is missing or unsupported",
        ),
      );
      return;
    }

    const processFile = options.processFile ?? processReceiptFile;
    const timeoutMs = options.attemptTimeoutMs ?? DEFAULT_ATTEMPT_TIMEOUT_MS;
    const result = await withTimeout(
      processFile({
        receiptType: receipt.receiptType,
        filePath: receipt.filePath,
        generatedFileName: fileName,
        publicFileUrl: receipt.publicFileUrl,
        userId: job.userId,
      }),
      timeoutMs,
    );

    if (!(await ownsJob(options, job.id))) {
      log(options, {
        event: "job.lease_lost",
        jobId: job.id,
        receiptId: job.receiptId,
        attempt: job.attempts,
      });
      return;
    }

    const outcome = await finishSuccess(options, job, result.extractedData);
    if (outcome === "succeeded") {
      log(options, {
        event: "job.succeeded",
        jobId: job.id,
        receiptId: job.receiptId,
        attempt: job.attempts,
        durationMs: Date.now() - started,
      });
    }
  } catch (error) {
    if (!(await ownsJob(options, job.id))) {
      log(options, {
        event: "job.lease_lost",
        jobId: job.id,
        receiptId: job.receiptId,
        attempt: job.attempts,
      });
      return;
    }

    const outcome = await finishFailure(options, job, error);
    log(options, {
      event: outcome === "retry" ? "job.retry" : "job.failed",
      jobId: job.id,
      receiptId: job.receiptId,
      attempt: job.attempts,
      code: classifyExtractionError(error).code,
      durationMs: Date.now() - started,
    });
  } finally {
    heartbeat.stop();
  }
}

function startHeartbeat(options: ProcessorOptions, jobId: string) {
  const intervalMs = options.heartbeatMs ?? DEFAULT_HEARTBEAT_MS;
  const timer = setInterval(() => {
    void extendJobLease(options, jobId).catch((error: unknown) => {
      log(options, {
        event: "job.heartbeat_failed",
        jobId,
        code: error instanceof Error ? error.name : "UNKNOWN",
      });
    });
  }, intervalMs);
  if (typeof timer === "object" && "unref" in timer) {
    timer.unref();
  }

  return {
    stop() {
      clearInterval(timer);
    },
  };
}

async function extendJobLease(options: ProcessorOptions, jobId: string) {
  const leaseMs = options.leaseMs ?? DEFAULT_LEASE_MS;
  await options.db.query(
    `
      UPDATE "ProcessingJob"
      SET "lockedUntil" = (now() AT TIME ZONE 'UTC') + ($3::int * interval '1 millisecond'),
          "updatedAt" = now()
      WHERE id = $1
        AND "lockedBy" = $2
        AND status = 'PROCESSING'
    `,
    [jobId, options.workerId, leaseMs],
  );
}

async function finishSuccess(
  options: ProcessorOptions,
  job: ClaimedJob,
  extractedData: unknown,
) {
  const outcome = await options.db.transaction(async (query) => {
    const claimed = await query(
      `
        UPDATE "ProcessingJob"
        SET
          status = 'SUCCEEDED',
          "lockedBy" = NULL,
          "lockedUntil" = NULL,
          "finishedAt" = now(),
          "lastError" = NULL,
          "updatedAt" = now()
        WHERE id = $1
          AND "lockedBy" = $2
          AND status = 'PROCESSING'
        RETURNING id
      `,
      [job.id, options.workerId],
    );

    if (claimed.rows.length !== 1) {
      return { kind: "lost" as const };
    }

    const reviewed = await query<{ filePath: string | null }>(
      `
        UPDATE "Receipt"
        SET
          status = 'READY_FOR_REVIEW',
          "rawJson" = $2::jsonb,
          "errorMessage" = NULL
        WHERE id = $1
          AND status = 'EXTRACTING'
        RETURNING "filePath"
      `,
      [job.receiptId, JSON.stringify(extractedData)],
    );

    if (reviewed.rows.length !== 1) {
      await query(
        `
          UPDATE "ProcessingJob"
          SET status = 'CANCELLED', "finishedAt" = now(), "updatedAt" = now()
          WHERE id = $1
        `,
        [job.id],
      );
      const file = await query<{ filePath: string | null }>(
        `SELECT "filePath" FROM "Receipt" WHERE id = $1`,
        [job.receiptId],
      );
      return { kind: "discarded" as const, filePath: file.rows[0]?.filePath ?? null };
    }

    await insertNotification(query, {
      userId: job.userId,
      receiptId: job.receiptId,
      jobId: job.id,
      type: NOTIFICATION_TYPE.EXTRACTION_SUCCEEDED,
      messageKey: NOTIFICATION_MESSAGE_KEY.EXTRACTION_SUCCEEDED,
    });

    return { kind: "succeeded" as const };
  });

  if (outcome.kind === "discarded") {
    await removeReceiptFile(
      options.db,
      job.receiptId,
      outcome.filePath,
      options.deleteFile ?? deleteReceiptFile,
      options.logger,
    );
  }

  return outcome.kind;
}

async function finishFailure(options: ProcessorOptions, job: ClaimedJob, error: unknown) {
  const classified = classifyExtractionError(error);
  const delay = retryDelayMs(job.attempts);
  const retry = classified.retryable && delay !== null && job.attempts < job.maxAttempts;
  const record = errorRecord(error);

  const outcome = await options.db.transaction(async (query) => {
    if (retry) {
      const updated = await query(
        `
          UPDATE "ProcessingJob"
          SET
            status = 'QUEUED',
            "availableAt" = now() + ($3::int * interval '1 millisecond'),
            "lockedBy" = NULL,
            "lockedUntil" = NULL,
            "lastError" = $4,
            "updatedAt" = now()
          WHERE id = $1
            AND "lockedBy" = $2
            AND status = 'PROCESSING'
          RETURNING id
        `,
        [job.id, options.workerId, delay, record],
      );
      return updated.rows.length === 1 ? { kind: "retry" as const } : { kind: "lost" as const };
    }

    const failed = await query(
      `
        UPDATE "ProcessingJob"
        SET
          status = 'FAILED',
          "lockedBy" = NULL,
          "lockedUntil" = NULL,
          "finishedAt" = now(),
          "lastError" = $3,
          "updatedAt" = now()
        WHERE id = $1
          AND "lockedBy" = $2
          AND status = 'PROCESSING'
        RETURNING id
      `,
      [job.id, options.workerId, record],
    );

    if (failed.rows.length !== 1) {
      return { kind: "lost" as const };
    }

    const receipt = await query<{ filePath: string | null }>(
      `
        UPDATE "Receipt"
        SET status = 'EXTRACTION_FAILED', "errorMessage" = $2
        WHERE id = $1 AND status = 'EXTRACTING'
        RETURNING "filePath"
      `,
      [job.receiptId, classified.code],
    );

    if (receipt.rows.length !== 1) {
      await query(
        `
          UPDATE "ProcessingJob"
          SET status = 'CANCELLED', "finishedAt" = now(), "updatedAt" = now()
          WHERE id = $1
        `,
        [job.id],
      );
      const file = await query<{ filePath: string | null }>(
        `SELECT "filePath" FROM "Receipt" WHERE id = $1`,
        [job.receiptId],
      );
      return { kind: "discarded" as const, filePath: file.rows[0]?.filePath ?? null };
    }

    await insertNotification(query, {
      userId: job.userId,
      receiptId: job.receiptId,
      jobId: job.id,
      type: NOTIFICATION_TYPE.EXTRACTION_FAILED,
      messageKey: NOTIFICATION_MESSAGE_KEY.EXTRACTION_FAILED,
    });

    return { kind: "failed" as const };
  });

  if (outcome.kind === "discarded") {
    await removeReceiptFile(
      options.db,
      job.receiptId,
      outcome.filePath,
      options.deleteFile ?? deleteReceiptFile,
      options.logger,
    );
  }

  return outcome.kind;
}

async function cancelOwnedJob(
  options: ProcessorOptions,
  job: ClaimedJob,
  filePath: string | null,
) {
  const cancelled = await options.db.query(
    `
      UPDATE "ProcessingJob"
      SET
        status = 'CANCELLED',
        "lockedBy" = NULL,
        "lockedUntil" = NULL,
        "finishedAt" = now(),
        "updatedAt" = now()
      WHERE id = $1
        AND "lockedBy" = $2
        AND status = 'PROCESSING'
      RETURNING id
    `,
    [job.id, options.workerId],
  );

  if (cancelled.rows.length !== 1) {
    return;
  }

  await removeReceiptFile(
    options.db,
    job.receiptId,
    filePath,
    options.deleteFile ?? deleteReceiptFile,
    options.logger,
  );
  log(options, {
    event: "job.discarded",
    jobId: job.id,
    receiptId: job.receiptId,
    attempt: job.attempts,
  });
}

async function failMissingReceipt(options: ProcessorOptions, job: ClaimedJob) {
  await options.db.query(
    `
      UPDATE "ProcessingJob"
      SET
        status = 'FAILED',
        "lockedBy" = NULL,
        "lockedUntil" = NULL,
        "finishedAt" = now(),
        "lastError" = 'RECEIPT_MISSING',
        "updatedAt" = now()
      WHERE id = $1
        AND "lockedBy" = $2
        AND status = 'PROCESSING'
    `,
    [job.id, options.workerId],
  );
}

async function recoverInterruptedJobs(options: ProcessorOptions) {
  await options.db.transaction(async (query) => {
    const expired = await query<{ jobId: string; userId: string; receiptId: string }>(
      `
        WITH expired AS (
          UPDATE "ProcessingJob" AS job
          SET
            status = 'FAILED',
            "lockedBy" = NULL,
            "lockedUntil" = NULL,
            "finishedAt" = now(),
            "updatedAt" = now(),
            "lastError" = COALESCE(job."lastError", 'LEASE_EXPIRED')
          FROM "Receipt" AS receipt
          WHERE job."receiptId" = receipt.id
            AND job.status = 'PROCESSING'
            AND job."lockedUntil" < (now() AT TIME ZONE 'UTC')
            AND job.attempts >= job."maxAttempts"
            AND receipt.status = 'EXTRACTING'
            AND ($1::text IS NULL OR job."userId" = $1)
          RETURNING job.id, job."userId", job."receiptId", job."lastError"
        ),
        marked AS (
          UPDATE "Receipt" AS receipt
          SET status = 'EXTRACTION_FAILED', "errorMessage" = 'LEASE_EXPIRED'
          FROM expired
          WHERE receipt.id = expired."receiptId"
            AND receipt.status = 'EXTRACTING'
          RETURNING expired.id AS "jobId", expired."userId", expired."receiptId"
        )
        SELECT "jobId", "userId", "receiptId" FROM marked
      `,
      [options.scopeUserId ?? null],
    );

    for (const row of expired.rows) {
      await insertNotification(query, {
        userId: row.userId,
        receiptId: row.receiptId,
        jobId: row.jobId,
        type: NOTIFICATION_TYPE.EXTRACTION_FAILED,
        messageKey: NOTIFICATION_MESSAGE_KEY.EXTRACTION_FAILED,
      });
    }

    await backfillNotifications(query, options.scopeUserId ?? null);
  });

  await cleanupDiscardedFiles(options);
}

async function backfillNotifications(query: SqlQuery, scopeUserId: string | null) {
  const missing = await query<{
    jobId: string;
    userId: string;
    receiptId: string;
    type: string;
  }>(
    `
      SELECT
        job.id AS "jobId",
        job."userId",
        job."receiptId",
        CASE
          WHEN job.status = 'SUCCEEDED' THEN 'EXTRACTION_SUCCEEDED'
          ELSE 'EXTRACTION_FAILED'
        END AS type
      FROM "ProcessingJob" AS job
      JOIN "Receipt" AS receipt ON receipt.id = job."receiptId"
      WHERE (
        (
          job.status = 'SUCCEEDED' AND receipt.status = 'READY_FOR_REVIEW'
          AND NOT EXISTS (
            SELECT 1 FROM "Notification" AS notice
            WHERE notice."jobId" = job.id AND notice.type = 'EXTRACTION_SUCCEEDED'
          )
        ) OR (
          job.status = 'FAILED' AND receipt.status = 'EXTRACTION_FAILED'
          AND NOT EXISTS (
            SELECT 1 FROM "Notification" AS notice
            WHERE notice."jobId" = job.id AND notice.type = 'EXTRACTION_FAILED'
          )
        )
      )
      AND ($1::text IS NULL OR job."userId" = $1)
    `,
    [scopeUserId],
  );

  for (const row of missing.rows) {
    const succeeded = row.type === NOTIFICATION_TYPE.EXTRACTION_SUCCEEDED;
    await insertNotification(query, {
      userId: row.userId,
      receiptId: row.receiptId,
      jobId: row.jobId,
      type: succeeded
        ? NOTIFICATION_TYPE.EXTRACTION_SUCCEEDED
        : NOTIFICATION_TYPE.EXTRACTION_FAILED,
      messageKey: succeeded
        ? NOTIFICATION_MESSAGE_KEY.EXTRACTION_SUCCEEDED
        : NOTIFICATION_MESSAGE_KEY.EXTRACTION_FAILED,
    });
  }
}

async function cleanupDiscardedFiles(options: ProcessorOptions) {
  const rows = await options.db.query<{
    receiptId: string;
    filePath: string | null;
    jobId: string;
    jobStatus: string;
  }>(
    `
      SELECT
        receipt.id AS "receiptId",
        receipt."filePath",
        job.id AS "jobId",
        job.status AS "jobStatus"
      FROM "Receipt" AS receipt
      JOIN "ProcessingJob" AS job ON job."receiptId" = receipt.id
      WHERE receipt.status = 'DISCARDED'
        AND receipt."filePath" IS NOT NULL
        AND NOT (
          job.status = 'PROCESSING'
          AND job."lockedUntil" IS NOT NULL
          AND job."lockedUntil" > (now() AT TIME ZONE 'UTC')
        )
        AND ($1::text IS NULL OR job."userId" = $1)
    `,
    [options.scopeUserId ?? null],
  );

  for (const row of rows.rows) {
    if (
      row.jobStatus === PROCESSING_JOB_STATUS.QUEUED ||
      row.jobStatus === PROCESSING_JOB_STATUS.PROCESSING
    ) {
      await options.db.query(
        `
          UPDATE "ProcessingJob"
          SET
            status = 'CANCELLED',
            "lockedBy" = NULL,
            "lockedUntil" = NULL,
            "finishedAt" = COALESCE("finishedAt", now()),
            "updatedAt" = now()
          WHERE id = $1
            AND status IN ('QUEUED', 'PROCESSING')
        `,
        [row.jobId],
      );
    }

    await removeReceiptFile(
      options.db,
      row.receiptId,
      row.filePath,
      options.deleteFile ?? deleteReceiptFile,
      options.logger,
    );
  }
}

async function insertNotification(
  query: SqlQuery,
  input: {
    userId: string;
    receiptId: string;
    jobId: string;
    type: string;
    messageKey: string;
  },
) {
  await query(
    `
      INSERT INTO "Notification" (
        id, "userId", type, "receiptId", "jobId", "messageKey"
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT ("jobId", "type") DO NOTHING
    `,
    [
      crypto.randomUUID(),
      input.userId,
      input.type,
      input.receiptId,
      input.jobId,
      input.messageKey,
    ],
  );
}

async function removeReceiptFile(
  db: WorkerDb,
  receiptId: string,
  filePath: string | null,
  deleteFile: (filePath: string) => Promise<void>,
  logger?: WorkerLogger,
) {
  if (!filePath) {
    return;
  }

  try {
    await deleteFile(filePath);
  } catch {
    logger?.({
      event: "file.delete_failed",
      receiptId,
      code: "FILE_DELETE_FAILED",
    });
    return;
  }

  await db.query(
    `
      UPDATE "Receipt"
      SET "filePath" = NULL, "publicFileUrl" = NULL
      WHERE id = $1 AND status = 'DISCARDED'
    `,
    [receiptId],
  );
  logger?.({ event: "file.deleted", receiptId });
}

async function loadReceipt(db: WorkerDb, receiptId: string) {
  const result = await db.query<ReceiptWorkRow>(
    `
      SELECT
        id,
        status,
        "receiptType",
        "fileName",
        "filePath",
        "publicFileUrl",
        "userId"
      FROM "Receipt"
      WHERE id = $1
    `,
    [receiptId],
  );
  return result.rows[0] ?? null;
}

async function ownsJob(options: ProcessorOptions, jobId: string) {
  const result = await options.db.query(
    `
      SELECT id
      FROM "ProcessingJob"
      WHERE id = $1
        AND "lockedBy" = $2
        AND status = 'PROCESSING'
    `,
    [jobId, options.workerId],
  );
  return result.rows.length === 1;
}

async function readDatabaseNow(db: WorkerDb) {
  const result = await db.query<{ now: Date }>(`SELECT now() AS now`);
  const now = result.rows[0]?.now;
  if (!(now instanceof Date)) {
    throw new Error("Database clock is unavailable");
  }
  return now;
}

function fileNameFromPath(filePath: string | null) {
  if (!filePath) {
    return null;
  }
  const name = filePath.split("/").pop();
  return name && name.length > 0 ? name : null;
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new ExtractionFailure("OPENAI_TIMEOUT", true, "Extraction timed out"));
    }, ms);

    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

function log(options: ProcessorOptions, event: Record<string, string | number | boolean | null>) {
  options.logger?.({ workerId: options.workerId, ...event });
}
