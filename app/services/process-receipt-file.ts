import {
  extractReceiptData,
  cleanJsonResponse,
} from "@/app/lib/receipt-extractor";

import { extractedReceiptSchema } from "@/app/schemas/receipt-schema";
import { uploadReceiptFile } from "@/app/lib/storage";

export async function processReceiptFile(file: File, receiptType: string) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const base64 = buffer.toString("base64");

  const uploadedFile = await uploadReceiptFile(file);

  const extracted = await extractReceiptData(
    base64,
    file.type,
    file.name,
    receiptType
  );

  const cleanJson = cleanJsonResponse(extracted);

  const parsed = extractedReceiptSchema.parse(
    JSON.parse(cleanJson)
  );

  return {
    extractedData: parsed,
    filePath: uploadedFile.filePath,
    generatedFileName: uploadedFile.generatedFileName,
    publicFileUrl: uploadedFile.publicFileUrl,
  };
}