export const RECEIPT_STATUS = {
  PENDING: "PENDING",
  PROCESSED: "PROCESSED",
  EXTRACTING: "EXTRACTING",
  READY_FOR_REVIEW: "READY_FOR_REVIEW",
  EXTRACTION_FAILED: "EXTRACTION_FAILED",
  DISCARDED: "DISCARDED",
} as const;

export type ReceiptStatus = (typeof RECEIPT_STATUS)[keyof typeof RECEIPT_STATUS];

/**
 * Statuses that stay in history, dashboard, and other expense totals.
 * PROCESSED is what the current save path writes.
 * PENDING is the legacy default from when the column was added. Those rows
 * were never backfilled and remain confirmed receipts.
 */
export const CONFIRMED_RECEIPT_STATUSES = [
  RECEIPT_STATUS.PROCESSED,
  RECEIPT_STATUS.PENDING,
] as const;

/** Receipts shown in the pending review queue. They stay out of financial totals. */
export const REVIEW_QUEUE_STATUSES = [
  RECEIPT_STATUS.EXTRACTING,
  RECEIPT_STATUS.READY_FOR_REVIEW,
  RECEIPT_STATUS.EXTRACTION_FAILED,
] as const;

export const RECEIPT_STATUS_VALUES = [
  RECEIPT_STATUS.PENDING,
  RECEIPT_STATUS.PROCESSED,
  RECEIPT_STATUS.EXTRACTING,
  RECEIPT_STATUS.READY_FOR_REVIEW,
  RECEIPT_STATUS.EXTRACTION_FAILED,
  RECEIPT_STATUS.DISCARDED,
] as const satisfies readonly ReceiptStatus[];

export const PROCESSING_JOB_STATUS = {
  QUEUED: "QUEUED",
  PROCESSING: "PROCESSING",
  SUCCEEDED: "SUCCEEDED",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
} as const;

export type ProcessingJobStatus =
  (typeof PROCESSING_JOB_STATUS)[keyof typeof PROCESSING_JOB_STATUS];

export const PROCESSING_JOB_STATUS_VALUES = [
  PROCESSING_JOB_STATUS.QUEUED,
  PROCESSING_JOB_STATUS.PROCESSING,
  PROCESSING_JOB_STATUS.SUCCEEDED,
  PROCESSING_JOB_STATUS.FAILED,
  PROCESSING_JOB_STATUS.CANCELLED,
] as const satisfies readonly ProcessingJobStatus[];

export const NOTIFICATION_TYPE = {
  EXTRACTION_SUCCEEDED: "EXTRACTION_SUCCEEDED",
  EXTRACTION_FAILED: "EXTRACTION_FAILED",
} as const;

export type NotificationType =
  (typeof NOTIFICATION_TYPE)[keyof typeof NOTIFICATION_TYPE];

export const NOTIFICATION_TYPE_VALUES = [
  NOTIFICATION_TYPE.EXTRACTION_SUCCEEDED,
  NOTIFICATION_TYPE.EXTRACTION_FAILED,
] as const satisfies readonly NotificationType[];

const receiptTransitions: Record<ReceiptStatus, readonly ReceiptStatus[]> = {
  [RECEIPT_STATUS.PENDING]: [],
  [RECEIPT_STATUS.PROCESSED]: [],
  [RECEIPT_STATUS.EXTRACTING]: [
    RECEIPT_STATUS.READY_FOR_REVIEW,
    RECEIPT_STATUS.EXTRACTION_FAILED,
    RECEIPT_STATUS.DISCARDED,
  ],
  [RECEIPT_STATUS.READY_FOR_REVIEW]: [
    RECEIPT_STATUS.PROCESSED,
    RECEIPT_STATUS.DISCARDED,
  ],
  [RECEIPT_STATUS.EXTRACTION_FAILED]: [RECEIPT_STATUS.DISCARDED],
  [RECEIPT_STATUS.DISCARDED]: [],
};

const processingJobTransitions: Record<
  ProcessingJobStatus,
  readonly ProcessingJobStatus[]
> = {
  [PROCESSING_JOB_STATUS.QUEUED]: [
    PROCESSING_JOB_STATUS.PROCESSING,
    PROCESSING_JOB_STATUS.CANCELLED,
  ],
  [PROCESSING_JOB_STATUS.PROCESSING]: [
    PROCESSING_JOB_STATUS.PROCESSING,
    PROCESSING_JOB_STATUS.QUEUED,
    PROCESSING_JOB_STATUS.SUCCEEDED,
    PROCESSING_JOB_STATUS.FAILED,
    PROCESSING_JOB_STATUS.CANCELLED,
  ],
  [PROCESSING_JOB_STATUS.SUCCEEDED]: [],
  [PROCESSING_JOB_STATUS.FAILED]: [],
  [PROCESSING_JOB_STATUS.CANCELLED]: [],
};

export function isReceiptStatus(value: string): value is ReceiptStatus {
  return (RECEIPT_STATUS_VALUES as readonly string[]).includes(value);
}

export function isConfirmedReceiptStatus(value: string): boolean {
  return (CONFIRMED_RECEIPT_STATUSES as readonly string[]).includes(value);
}

export function confirmedReceiptStatusWhere() {
  return {
    status: {
      in: [...CONFIRMED_RECEIPT_STATUSES],
    },
  };
}

export function canTransitionReceiptStatus(from: string, to: string): boolean {
  if (!isReceiptStatus(from) || !isReceiptStatus(to)) {
    return false;
  }

  return receiptTransitions[from].includes(to);
}

export function isProcessingJobStatus(value: string): value is ProcessingJobStatus {
  return (PROCESSING_JOB_STATUS_VALUES as readonly string[]).includes(value);
}

export function canTransitionProcessingJobStatus(from: string, to: string): boolean {
  if (!isProcessingJobStatus(from) || !isProcessingJobStatus(to)) {
    return false;
  }

  return processingJobTransitions[from].includes(to);
}
