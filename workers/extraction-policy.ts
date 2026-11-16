import { ZodError } from "zod";

import {
  PROCESSING_JOB_STATUS,
  RECEIPT_STATUS,
} from "@/app/lib/receipts/receipt-lifecycle";

export const DEFAULT_WORKER_CONCURRENCY = 1;
export const DEFAULT_POLL_INTERVAL_MS = 5_000;
export const DEFAULT_LEASE_MS = 4 * 60 * 1000;
export const DEFAULT_HEARTBEAT_MS = 30_000;
export const DEFAULT_ATTEMPT_TIMEOUT_MS = 3 * 60 * 1000;

export const NOTIFICATION_MESSAGE_KEY = {
  EXTRACTION_SUCCEEDED: "notifications.extractionSucceeded",
  EXTRACTION_FAILED: "notifications.extractionFailed",
} as const;

const SUPPORTED_EXTENSIONS = new Set(["pdf", "jpg", "jpeg", "png", "webp"]);

export type ClassifiedExtractionError = {
  code: string;
  retryable: boolean;
  fields?: string;
};

export function retryDelayMs(attempt: number): number | null {
  if (attempt <= 1) {
    return 30_000;
  }

  if (attempt === 2) {
    return 120_000;
  }

  return null;
}

export function isSupportedReceiptFile(fileName: string): boolean {
  const extension = fileName.split(".").pop()?.toLowerCase() ?? "";
  return SUPPORTED_EXTENSIONS.has(extension);
}

export function isJobEligible(input: {
  status: string;
  availableAt: Date;
  lockedUntil: Date | null;
  attempts: number;
  maxAttempts: number;
  cutoff: Date;
  now: Date;
}): boolean {
  if (input.status === PROCESSING_JOB_STATUS.QUEUED) {
    return input.availableAt.getTime() <= input.cutoff.getTime();
  }

  if (input.status === PROCESSING_JOB_STATUS.PROCESSING) {
    return (
      input.lockedUntil !== null &&
      input.lockedUntil.getTime() < input.now.getTime() &&
      input.attempts < input.maxAttempts
    );
  }

  return false;
}

export function fileCleanupDecision(input: {
  jobStatus: string;
  leaseActive: boolean;
}): "delete" | "defer" {
  if (input.jobStatus === PROCESSING_JOB_STATUS.PROCESSING && input.leaseActive) {
    return "defer";
  }

  return "delete";
}

export function classifyExtractionError(error: unknown): ClassifiedExtractionError {
  if (error instanceof ExtractionFailure) {
    return {
      code: error.code,
      retryable: error.retryable,
      fields: error.fields,
    };
  }

  if (error instanceof ZodError) {
    const fields = error.issues
      .map((issue) => issue.path.map(String).join("."))
      .filter((path) => path.length > 0)
      .slice(0, 20)
      .join(",");

    return {
      code: "ZOD_VALIDATION",
      retryable: true,
      fields: fields || undefined,
    };
  }

  if (error instanceof SyntaxError) {
    return { code: "JSON_PARSE", retryable: true };
  }

  const status = readStatus(error) ?? downloadStatus(error);
  const nodeCode = readCode(error);

  if (nodeCode === "ENOENT" || status === 404) {
    return { code: "FILE_NOT_FOUND", retryable: false };
  }

  if (nodeCode === "MISSING_API_KEY") {
    return { code: "MISSING_API_KEY", retryable: false };
  }

  if (nodeCode === "OPENAI_TIMEOUT" || status === 408) {
    return { code: "OPENAI_TIMEOUT", retryable: true };
  }

  if (status === 401 || status === 403) {
    return { code: "OPENAI_AUTH", retryable: false };
  }

  if (status === 400) {
    return { code: "OPENAI_BAD_REQUEST", retryable: false };
  }

  if (status === 429) {
    return { code: "OPENAI_RATE_LIMIT", retryable: true };
  }

  if (status !== null && status >= 500) {
    return { code: "STORAGE_OR_OPENAI_SERVER", retryable: true };
  }

  if (
    nodeCode === "ECONNRESET" ||
    nodeCode === "ETIMEDOUT" ||
    nodeCode === "ENOTFOUND" ||
    nodeCode === "EAI_AGAIN" ||
    nodeCode === "ECONNREFUSED"
  ) {
    return { code: "OPENAI_NETWORK", retryable: true };
  }

  return { code: "UNKNOWN", retryable: true };
}

export function errorRecord(error: unknown): string {
  const classified = classifyExtractionError(error);
  const detail = classified.fields ? `:${classified.fields}` : "";
  return `${classified.code}${detail}`.slice(0, 240);
}

export class ExtractionFailure extends Error {
  readonly code: string;
  readonly retryable: boolean;
  readonly fields?: string;

  constructor(code: string, retryable: boolean, message: string, fields?: string) {
    super(message);
    this.name = "ExtractionFailure";
    this.code = code;
    this.retryable = retryable;
    this.fields = fields;
  }
}

export function isConfirmedReceiptProtected(status: string): boolean {
  return status === RECEIPT_STATUS.PROCESSED || status === RECEIPT_STATUS.PENDING;
}

export async function runWorkerLoop(input: {
  mode: "once" | "daemon";
  pollIntervalMs: number;
  signal?: AbortSignal;
  drain: () => Promise<void>;
  sleep: (ms: number, signal?: AbortSignal) => Promise<void>;
}) {
  if (input.mode === "once") {
    await input.drain();
    return;
  }

  while (!input.signal?.aborted) {
    await input.drain();
    if (input.signal?.aborted) {
      return;
    }
    await input.sleep(input.pollIntervalMs, input.signal);
  }
}

export function sleep(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve) => {
    if (signal?.aborted) {
      resolve();
      return;
    }

    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);

    const onAbort = () => {
      clearTimeout(timer);
      resolve();
    };

    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

function readStatus(error: unknown): number | null {
  if (typeof error !== "object" || error === null || !("status" in error)) {
    return null;
  }

  return typeof error.status === "number" ? error.status : null;
}

function readCode(error: unknown): string | null {
  if (typeof error !== "object" || error === null || !("code" in error)) {
    return null;
  }

  return typeof error.code === "string" ? error.code : null;
}

function downloadStatus(error: unknown): number | null {
  if (!(error instanceof Error)) {
    return null;
  }

  const match = error.message.match(/Failed to download uploaded file\. Status: (\d{3})/);
  if (!match) {
    return null;
  }

  return Number(match[1]);
}
