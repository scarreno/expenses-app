import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  CONFIRMED_RECEIPT_STATUSES,
  NOTIFICATION_TYPE_VALUES,
  PROCESSING_JOB_STATUS,
  PROCESSING_JOB_STATUS_VALUES,
  RECEIPT_STATUS,
  RECEIPT_STATUS_VALUES,
  canTransitionProcessingJobStatus,
  canTransitionReceiptStatus,
  confirmedReceiptStatusWhere,
  isConfirmedReceiptStatus,
} from "@/app/lib/receipts/receipt-lifecycle";

const migrationSql = readFileSync(
  path.join(
    process.cwd(),
    "prisma/migrations/20261115223000_add_processing_job_and_notification/migration.sql"
  ),
  "utf8"
);

function constraintValues(sql: string, constraintName: string) {
  const match = sql.match(
    new RegExp(`CONSTRAINT "${constraintName}" CHECK \\(\\s*"[A-Za-z]+" IN \\(([\\s\\S]*?)\\)\\s*\\)`)
  );

  if (!match?.[1]) {
    throw new Error(`Missing check constraint ${constraintName}`);
  }

  return [...match[1].matchAll(/'([^']+)'/g)].map((entry) => entry[1]);
}

describe("confirmed receipt statuses", () => {
  it("keeps current saves and legacy PENDING rows in expense queries", () => {
    expect(CONFIRMED_RECEIPT_STATUSES).toEqual([
      RECEIPT_STATUS.PROCESSED,
      RECEIPT_STATUS.PENDING,
    ]);
    expect(isConfirmedReceiptStatus(RECEIPT_STATUS.PROCESSED)).toBe(true);
    expect(isConfirmedReceiptStatus(RECEIPT_STATUS.PENDING)).toBe(true);
  });

  it("excludes in-progress and discarded receipts from expense queries", () => {
    expect(isConfirmedReceiptStatus(RECEIPT_STATUS.EXTRACTING)).toBe(false);
    expect(isConfirmedReceiptStatus(RECEIPT_STATUS.READY_FOR_REVIEW)).toBe(false);
    expect(isConfirmedReceiptStatus(RECEIPT_STATUS.EXTRACTION_FAILED)).toBe(false);
    expect(isConfirmedReceiptStatus(RECEIPT_STATUS.DISCARDED)).toBe(false);
    expect(isConfirmedReceiptStatus("UNKNOWN")).toBe(false);
  });

  it("builds the shared status filter", () => {
    expect(confirmedReceiptStatusWhere()).toEqual({
      status: {
        in: [RECEIPT_STATUS.PROCESSED, RECEIPT_STATUS.PENDING],
      },
    });
  });
});

describe("receipt status transitions", () => {
  it("follows the extraction lifecycle until the user confirms or discards", () => {
    expect(
      canTransitionReceiptStatus(RECEIPT_STATUS.EXTRACTING, RECEIPT_STATUS.READY_FOR_REVIEW)
    ).toBe(true);
    expect(
      canTransitionReceiptStatus(RECEIPT_STATUS.EXTRACTING, RECEIPT_STATUS.EXTRACTION_FAILED)
    ).toBe(true);
    expect(
      canTransitionReceiptStatus(RECEIPT_STATUS.EXTRACTING, RECEIPT_STATUS.DISCARDED)
    ).toBe(true);
    expect(
      canTransitionReceiptStatus(RECEIPT_STATUS.READY_FOR_REVIEW, RECEIPT_STATUS.PROCESSED)
    ).toBe(true);
    expect(
      canTransitionReceiptStatus(RECEIPT_STATUS.READY_FOR_REVIEW, RECEIPT_STATUS.DISCARDED)
    ).toBe(true);
    expect(
      canTransitionReceiptStatus(RECEIPT_STATUS.EXTRACTION_FAILED, RECEIPT_STATUS.DISCARDED)
    ).toBe(true);
  });

  it("leaves confirmed, discarded, and legacy rows unchanged", () => {
    expect(
      canTransitionReceiptStatus(RECEIPT_STATUS.PROCESSED, RECEIPT_STATUS.DISCARDED)
    ).toBe(false);
    expect(
      canTransitionReceiptStatus(RECEIPT_STATUS.PENDING, RECEIPT_STATUS.PROCESSED)
    ).toBe(false);
    expect(
      canTransitionReceiptStatus(RECEIPT_STATUS.DISCARDED, RECEIPT_STATUS.EXTRACTING)
    ).toBe(false);
    expect(
      canTransitionReceiptStatus(RECEIPT_STATUS.READY_FOR_REVIEW, RECEIPT_STATUS.EXTRACTING)
    ).toBe(false);
    expect(canTransitionReceiptStatus("PENDING", "NOT_A_STATUS")).toBe(false);
  });
});

describe("processing job transitions", () => {
  it("allows claim, retry, reclaim, completion, failure, and cancel", () => {
    expect(
      canTransitionProcessingJobStatus(
        PROCESSING_JOB_STATUS.QUEUED,
        PROCESSING_JOB_STATUS.PROCESSING
      )
    ).toBe(true);
    expect(
      canTransitionProcessingJobStatus(
        PROCESSING_JOB_STATUS.QUEUED,
        PROCESSING_JOB_STATUS.CANCELLED
      )
    ).toBe(true);
    expect(
      canTransitionProcessingJobStatus(
        PROCESSING_JOB_STATUS.PROCESSING,
        PROCESSING_JOB_STATUS.QUEUED
      )
    ).toBe(true);
    expect(
      canTransitionProcessingJobStatus(
        PROCESSING_JOB_STATUS.PROCESSING,
        PROCESSING_JOB_STATUS.PROCESSING
      )
    ).toBe(true);
    expect(
      canTransitionProcessingJobStatus(
        PROCESSING_JOB_STATUS.PROCESSING,
        PROCESSING_JOB_STATUS.SUCCEEDED
      )
    ).toBe(true);
    expect(
      canTransitionProcessingJobStatus(
        PROCESSING_JOB_STATUS.PROCESSING,
        PROCESSING_JOB_STATUS.FAILED
      )
    ).toBe(true);
    expect(
      canTransitionProcessingJobStatus(
        PROCESSING_JOB_STATUS.PROCESSING,
        PROCESSING_JOB_STATUS.CANCELLED
      )
    ).toBe(true);
  });

  it("treats succeeded, failed, and cancelled as terminal", () => {
    for (const status of [
      PROCESSING_JOB_STATUS.SUCCEEDED,
      PROCESSING_JOB_STATUS.FAILED,
      PROCESSING_JOB_STATUS.CANCELLED,
    ]) {
      expect(
        canTransitionProcessingJobStatus(status, PROCESSING_JOB_STATUS.QUEUED)
      ).toBe(false);
    }

    expect(
      canTransitionProcessingJobStatus(PROCESSING_JOB_STATUS.QUEUED, PROCESSING_JOB_STATUS.SUCCEEDED)
    ).toBe(false);
  });
});

describe("migration compatibility", () => {
  it("allows every application status, including legacy PENDING, and does not rewrite rows", () => {
    expect(constraintValues(migrationSql, "Receipt_status_check")).toEqual([
      ...RECEIPT_STATUS_VALUES,
    ]);
    expect(constraintValues(migrationSql, "ProcessingJob_status_check")).toEqual([
      ...PROCESSING_JOB_STATUS_VALUES,
    ]);
    expect(constraintValues(migrationSql, "Notification_type_check")).toEqual([
      ...NOTIFICATION_TYPE_VALUES,
    ]);
    expect(migrationSql).toContain(`SET DEFAULT 'EXTRACTING'`);
    expect(migrationSql).not.toMatch(/UPDATE\s+"Receipt"/i);
  });
});
