import path from "node:path";

import { ZodError } from "zod";

import { prisma } from "@/app/lib/database/prisma";
import { ExtractionRequestError } from "@/app/lib/receipts/extraction-errors";
import {
  PROCESSING_JOB_STATUS,
  RECEIPT_STATUS,
} from "@/app/lib/receipts/receipt-lifecycle";
import { assertStoredUploadLocation } from "@/app/lib/receipts/upload-location";
import { extractedReceiptSchema } from "@/app/schemas/receipt-schema";
import type { EnqueueExtractionResult, ExtractionView } from "@/app/types/extraction";
import type { ExtractedReceipt } from "@/app/types/receipt";
import { BUSINESS_TYPES } from "@/app/constants/business-types";
import { createWorkerDb, discardReceiptWork } from "@/workers/receipt-processor";

const IDEMPOTENCY_KEY_MAX = 200;

export type EnqueueExtractionInput = {
  userId: string;
  idempotencyKey: string;
  receiptType: string;
  filePath: string;
  originalName: string;
  generatedFileName: string;
  publicFileUrl: string;
};

export type ConfirmExtractionInput = {
  receiptType?: string;
  receipt: unknown;
};

export async function enqueueExtraction(
  input: EnqueueExtractionInput,
): Promise<EnqueueExtractionResult> {
  const idempotencyKey = normalizeIdempotencyKey(input.idempotencyKey);
  if (!isBusinessType(input.receiptType)) {
    throw new ExtractionRequestError(400, "Invalid receipt type");
  }
  if (!input.originalName.trim() || input.originalName.length > 255) {
    throw new ExtractionRequestError(400, "Invalid file name");
  }

  assertStoredUploadLocation({
    filePath: input.filePath,
    publicFileUrl: input.publicFileUrl,
    generatedFileName: input.generatedFileName,
  });

  try {
    return await prisma.$transaction(async (tx) => {
      const existing = await tx.processingJob.findUnique({
        where: {
          userId_idempotencyKey: {
            userId: input.userId,
            idempotencyKey,
          },
        },
        include: {
          receipt: {
            select: { status: true },
          },
        },
      });

      if (existing) {
        return {
          receiptId: existing.receiptId,
          jobId: existing.id,
          status: existing.receipt.status,
          replayed: true,
        };
      }

      const receipt = await tx.receipt.create({
        data: {
          userId: input.userId,
          status: RECEIPT_STATUS.EXTRACTING,
          receiptType: input.receiptType,
          fileName: input.originalName,
          filePath: input.filePath,
          publicFileUrl: input.publicFileUrl,
        },
      });

      const job = await tx.processingJob.create({
        data: {
          receiptId: receipt.id,
          userId: input.userId,
          status: PROCESSING_JOB_STATUS.QUEUED,
          idempotencyKey,
        },
      });

      return {
        receiptId: receipt.id,
        jobId: job.id,
        status: receipt.status,
        replayed: false,
      };
    });
  } catch (error) {
    if (!isUniqueViolation(error)) {
      throw error;
    }

    const existing = await prisma.processingJob.findUnique({
      where: {
        userId_idempotencyKey: {
          userId: input.userId,
          idempotencyKey,
        },
      },
      include: {
        receipt: {
          select: { status: true },
        },
      },
    });

    if (!existing) {
      throw error;
    }

    return {
      receiptId: existing.receiptId,
      jobId: existing.id,
      status: existing.receipt.status,
      replayed: true,
    };
  }
}

export async function getExtraction(
  userId: string,
  receiptId: string,
): Promise<ExtractionView | null> {
  const receipt = await prisma.receipt.findFirst({
    where: {
      id: receiptId,
      userId,
    },
    include: {
      processingJob: true,
    },
  });

  if (!receipt?.processingJob) {
    return null;
  }

  return {
    receiptId: receipt.id,
    jobId: receipt.processingJob.id,
    status: receipt.status,
    jobStatus: receipt.processingJob.status,
    attempts: receipt.processingJob.attempts,
    errorMessage: receipt.errorMessage,
    receiptType: receipt.receiptType,
    file: {
      originalName: receipt.fileName,
      filePath: receipt.filePath,
      generatedFileName: receipt.filePath ? path.basename(receipt.filePath) : null,
      publicFileUrl: receipt.publicFileUrl,
    },
    receipt: readableExtraction(receipt.status, receipt.rawJson),
  };
}

export async function confirmExtraction(
  userId: string,
  receiptId: string,
  input: ConfirmExtractionInput,
) {
  const receiptData = parseExtractedReceipt(input.receipt);
  if (input.receiptType !== undefined && !isBusinessType(input.receiptType)) {
    throw new ExtractionRequestError(400, "Invalid receipt type");
  }

  return prisma.$transaction(async (tx) => {
    const current = await tx.receipt.findFirst({
      where: {
        id: receiptId,
        userId,
      },
      include: {
        items: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!current) {
      throw new ExtractionRequestError(404, "Receipt not found");
    }

    if (current.status === RECEIPT_STATUS.PROCESSED) {
      return current;
    }

    if (current.status !== RECEIPT_STATUS.READY_FOR_REVIEW) {
      throw new ExtractionRequestError(409, "Receipt is not ready for review");
    }

    const updated = await tx.receipt.updateMany({
      where: {
        id: receiptId,
        userId,
        status: RECEIPT_STATUS.READY_FOR_REVIEW,
      },
      data: {
        status: RECEIPT_STATUS.PROCESSED,
        receiptType: input.receiptType ?? current.receiptType,
        store: receiptData.store,
        branch: receiptData.branch,
        purchaseDate: receiptData.purchaseDate,
        purchaseTime: receiptData.purchaseTime,
        paymentMethod: receiptData.paymentMethod,
        subtotal: receiptData.subtotal,
        tax: receiptData.tax,
        total: receiptData.total,
        rawJson: receiptData,
        errorMessage: null,
      },
    });

    if (updated.count !== 1) {
      const raced = await tx.receipt.findFirst({
        where: { id: receiptId, userId },
        include: {
          items: {
            orderBy: { createdAt: "asc" },
          },
        },
      });

      if (raced?.status === RECEIPT_STATUS.PROCESSED) {
        return raced;
      }

      throw new ExtractionRequestError(409, "Receipt is not ready for review");
    }

    if (receiptData.items.length > 0) {
      await tx.receiptItem.createMany({
        data: receiptData.items.map((item) => ({
          receiptId,
          sku: item.sku,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          category: item.category ?? null,
        })),
      });
    }

    const saved = await tx.receipt.findFirst({
      where: { id: receiptId, userId },
      include: {
        items: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!saved) {
      throw new ExtractionRequestError(404, "Receipt not found");
    }

    return saved;
  });
}

export async function discardExtraction(
  userId: string,
  receiptId: string,
  options?: {
    deleteFile?: (filePath: string) => Promise<void>;
  },
) {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new ExtractionRequestError(500, "Database is not configured");
  }

  const db = createWorkerDb(databaseUrl, 1);
  try {
    const fileCleanup = await discardReceiptWork(db, {
      receiptId,
      userId,
      deleteFile: options?.deleteFile,
    });

    if (fileCleanup === "missing") {
      throw new ExtractionRequestError(404, "Receipt not found");
    }

    return {
      status: RECEIPT_STATUS.DISCARDED,
      fileCleanup,
    };
  } finally {
    await db.end();
  }
}

function readableExtraction(status: string, rawJson: unknown): ExtractedReceipt | null {
  if (status !== RECEIPT_STATUS.READY_FOR_REVIEW && status !== RECEIPT_STATUS.PROCESSED) {
    return null;
  }

  const parsed = extractedReceiptSchema.safeParse(rawJson);
  return parsed.success ? toExtractedReceipt(parsed.data) : null;
}

function parseExtractedReceipt(value: unknown): ExtractedReceipt {
  try {
    return toExtractedReceipt(extractedReceiptSchema.parse(value));
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ExtractionRequestError(400, "Invalid receipt");
    }
    throw error;
  }
}

function toExtractedReceipt(
  value: ReturnType<typeof extractedReceiptSchema.parse>,
): ExtractedReceipt {
  return {
    ...value,
    items: value.items.map((item) => ({
      ...item,
      category: item.category ?? null,
    })),
  };
}

function normalizeIdempotencyKey(value: string) {
  const key = value.trim();
  if (key.length === 0 || key.length > IDEMPOTENCY_KEY_MAX || /\s/.test(key)) {
    throw new ExtractionRequestError(400, "Invalid idempotency key");
  }
  return key;
}

function isBusinessType(value: string) {
  return (BUSINESS_TYPES as readonly string[]).includes(value);
}

function isUniqueViolation(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  );
}
