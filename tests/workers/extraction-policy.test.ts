import { describe, expect, it } from "vitest";
import { z } from "zod";

import {
  DEFAULT_POLL_INTERVAL_MS,
  DEFAULT_WORKER_CONCURRENCY,
  classifyExtractionError,
  fileCleanupDecision,
  isJobEligible,
  retryDelayMs,
  runWorkerLoop,
} from "@/workers/extraction-policy";
import { PROCESSING_JOB_STATUS } from "@/app/lib/receipts/receipt-lifecycle";

const now = new Date("2026-11-15T12:00:00.000Z");

describe("extraction error classification", () => {
  it("retries malformed model output and validation errors", () => {
    expect(classifyExtractionError(new SyntaxError("Unexpected token")).retryable).toBe(true);
    expect(classifyExtractionError(new SyntaxError("Unexpected token")).code).toBe("JSON_PARSE");

    let zodError: unknown;
    try {
      z.object({ store: z.string() }).parse({ store: 1 });
    } catch (error) {
      zodError = error;
    }

    const classified = classifyExtractionError(zodError);
    expect(classified.retryable).toBe(true);
    expect(classified.code).toBe("ZOD_VALIDATION");
    expect(classified.fields).toBe("store");
  });

  it("does not retry auth failures or a missing file", () => {
    expect(classifyExtractionError({ status: 401, message: "no" })).toEqual({
      code: "OPENAI_AUTH",
      retryable: false,
    });
    expect(
      classifyExtractionError(new Error("Failed to download uploaded file. Status: 404")),
    ).toMatchObject({ code: "FILE_NOT_FOUND", retryable: false });
    expect(classifyExtractionError({ status: 400 })).toMatchObject({
      code: "OPENAI_BAD_REQUEST",
      retryable: false,
    });
  });

  it("retries rate limits, server errors, and timeouts", () => {
    expect(classifyExtractionError({ status: 429 }).retryable).toBe(true);
    expect(classifyExtractionError({ status: 503 }).retryable).toBe(true);
    expect(classifyExtractionError({ code: "OPENAI_TIMEOUT" }).retryable).toBe(true);
    expect(
      classifyExtractionError(new Error("Failed to download uploaded file. Status: 502")).retryable,
    ).toBe(true);
  });
});

describe("retry schedule", () => {
  it("waits 30 seconds, then 2 minutes, and then stops", () => {
    expect(retryDelayMs(1)).toBe(30_000);
    expect(retryDelayMs(2)).toBe(120_000);
    expect(retryDelayMs(3)).toBeNull();
  });
});

describe("job eligibility", () => {
  it("hides a future retry from the batch that scheduled it", () => {
    expect(
      isJobEligible({
        status: PROCESSING_JOB_STATUS.QUEUED,
        availableAt: new Date("2026-11-15T12:00:30.000Z"),
        lockedUntil: null,
        attempts: 1,
        maxAttempts: 3,
        cutoff: now,
        now,
      }),
    ).toBe(false);

    expect(
      isJobEligible({
        status: PROCESSING_JOB_STATUS.QUEUED,
        availableAt: new Date("2026-11-15T12:00:30.000Z"),
        lockedUntil: null,
        attempts: 1,
        maxAttempts: 3,
        cutoff: new Date("2026-11-15T12:01:00.000Z"),
        now: new Date("2026-11-15T12:01:00.000Z"),
      }),
    ).toBe(true);
  });

  it("reclaims an expired lease and leaves a live lease alone", () => {
    expect(
      isJobEligible({
        status: PROCESSING_JOB_STATUS.PROCESSING,
        availableAt: now,
        lockedUntil: new Date("2026-11-15T11:59:00.000Z"),
        attempts: 1,
        maxAttempts: 3,
        cutoff: now,
        now,
      }),
    ).toBe(true);

    expect(
      isJobEligible({
        status: PROCESSING_JOB_STATUS.PROCESSING,
        availableAt: now,
        lockedUntil: new Date("2026-11-15T12:04:00.000Z"),
        attempts: 1,
        maxAttempts: 3,
        cutoff: now,
        now,
      }),
    ).toBe(false);
  });
});

describe("discarded file cleanup", () => {
  it("keeps the file while a worker lease is active", () => {
    expect(
      fileCleanupDecision({
        jobStatus: PROCESSING_JOB_STATUS.PROCESSING,
        leaseActive: true,
      }),
    ).toBe("defer");
    expect(
      fileCleanupDecision({
        jobStatus: PROCESSING_JOB_STATUS.QUEUED,
        leaseActive: false,
      }),
    ).toBe("delete");
    expect(
      fileCleanupDecision({
        jobStatus: PROCESSING_JOB_STATUS.SUCCEEDED,
        leaseActive: false,
      }),
    ).toBe("delete");
    expect(
      fileCleanupDecision({
        jobStatus: PROCESSING_JOB_STATUS.PROCESSING,
        leaseActive: false,
      }),
    ).toBe("delete");
  });
});

describe("worker loop", () => {
  it("uses one worker and a 5 second daemon poll by default", () => {
    expect(DEFAULT_WORKER_CONCURRENCY).toBe(1);
    expect(DEFAULT_POLL_INTERVAL_MS).toBe(5_000);
  });

  it("drains once and does not sleep", async () => {
    const sleeps: number[] = [];
    let drains = 0;

    await runWorkerLoop({
      mode: "once",
      pollIntervalMs: DEFAULT_POLL_INTERVAL_MS,
      drain: async () => {
        drains += 1;
      },
      sleep: async (ms) => {
        sleeps.push(ms);
      },
    });

    expect(drains).toBe(1);
    expect(sleeps).toEqual([]);
  });

  it("sleeps for the daemon interval and stops when aborted", async () => {
    const controller = new AbortController();
    const sleeps: number[] = [];

    await runWorkerLoop({
      mode: "daemon",
      pollIntervalMs: DEFAULT_POLL_INTERVAL_MS,
      signal: controller.signal,
      drain: async () => undefined,
      sleep: async (ms) => {
        sleeps.push(ms);
        controller.abort();
      },
    });

    expect(sleeps).toEqual([5_000]);
  });
});
