import {
  extractReceiptData,
  cleanJsonResponse,
} from "@/app/lib/receipts/receipt-extractor";

import { extractedReceiptSchema } from "@/app/schemas/receipt-schema";
import { getDefaultCategoriesForClassification } from "@/app/lib/categories/categories";

const NON_PRODUCT_DESCRIPTIONS = [
  "AHORRO",
  "CODIGO",
  "SUBTOTAL",
  "TOTAL",
  "TOTAL AFECTO",
  "TOTAL EXENTO",
  "IVA",
  "MEDIO DE PAGO",
  "PRECIO BAJOS",
  "MI CLUB",
  "RF PRECIO ANTES AHORRO",
  "RIF LEVE N",
  "DESCUENTO",
  "PROMOCION",
  "PROMOCIÓN",
];

function isNonProductDescription(description: string) {
  const normalized = description
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  return NON_PRODUCT_DESCRIPTIONS.some((term) =>
    normalized.includes(
      term
        .toUpperCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
    )
  );
}

type ProcessReceiptFileInput = {
  receiptType: string;
  filePath: string;
  generatedFileName: string;
  publicFileUrl: string;
};

export async function processReceiptFile({
  receiptType,
  filePath,
  generatedFileName,
  publicFileUrl,
  userId,
}: ProcessReceiptFileInput & { userId: string }) {

  const { buffer, contentType } = await getUploadedFileBuffer({
    filePath,
    publicFileUrl,
  });
  const categories = await getDefaultCategoriesForClassification(userId);

  const base64 = buffer.toString("base64");

  const extracted = await extractReceiptData(
    base64,
    contentType,
    generatedFileName,
    receiptType,
    categories
  );

  const cleanJson = cleanJsonResponse(extracted);
  const rawParsed = JSON.parse(cleanJson);
  const normalized = normalizeExtractedReceipt(rawParsed);
  const parsed = extractedReceiptSchema.parse(normalized);

  return {
    extractedData: parsed,
    filePath,
    generatedFileName,
    publicFileUrl,
  };
}

function isQuantityPricePattern(description: string) {
  const normalized = description.trim().toUpperCase();

  return /^\d+\s*X\s*[\d.,]+$/.test(normalized);
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function normalizeExtractedReceipt(raw: any) {
  return {
    ...raw,
    items: Array.isArray(raw.items)
      ? raw.items
          .filter((item: any) => {
          if (
            typeof item.description !== "string" ||
            item.description.trim().length === 0
          ) {
            return false;
          }

          if (isNonProductDescription(item.description)) {
            return false;
          }

          if (isQuantityPricePattern(item.description)) {
            return false;
          }

          return true;
        })
          .map((item: any) => ({
            ...item,
            description: item.description.trim(),
          }))
      : [],
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

async function getUploadedFileBuffer({
  filePath,
  publicFileUrl,
}: {
  filePath: string;
  publicFileUrl: string;
}): Promise<{
  buffer: Buffer;
  contentType: string;
}> {
  if (publicFileUrl.startsWith("/")) {
    const { readFile } = await import("fs/promises");

    const buffer = await readFile(filePath);

    return {
      buffer,
      contentType: getContentTypeFromFileName(filePath),
    };
  }

  const response = await fetch(publicFileUrl);

  if (!response.ok) {
    throw new Error(
      `Failed to download uploaded file. Status: ${response.status}`
    );
  }

  const arrayBuffer = await response.arrayBuffer();

  return {
    buffer: Buffer.from(arrayBuffer),
    contentType:
      response.headers.get("content-type") ??
      getContentTypeFromFileName(publicFileUrl),
  };
}

function getContentTypeFromFileName(fileName: string): string {
  const extension = fileName.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "pdf":
      return "application/pdf";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    default:
      return "application/octet-stream";
  }
}