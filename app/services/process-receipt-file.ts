import {
  extractReceiptData,
  cleanJsonResponse,
} from "@/app/lib/receipt-extractor";

import { extractedReceiptSchema } from "@/app/schemas/receipt-schema";

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
  publicFileUrl
}: ProcessReceiptFileInput) {
  const { buffer, contentType } = await getUploadedFileBuffer({
    filePath,
    publicFileUrl,
  });

  const base64 = buffer.toString("base64");

  const extracted = await extractReceiptData(
    base64,
    contentType,
    generatedFileName,
    receiptType
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

function normalizeExtractedReceipt(raw: any) {
  return {
    ...raw,
    items: Array.isArray(raw.items)
      ? raw.items.filter((item: any) => {
          return (
            typeof item.description === "string" &&
            item.description.trim().length > 0
          );
        })
      : [],
  };
}

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