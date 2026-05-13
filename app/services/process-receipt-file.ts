import {
  extractReceiptData,
  cleanJsonResponse,
} from "@/app/lib/receipt-extractor";
import fs from "fs/promises";
import path from "path";
import { v4 as uuid } from "uuid";

export async function processReceiptFile(file: File, receiptType: string) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const base64 = buffer.toString("base64");

  const extension = file.name.split(".").pop();
  const generatedFileName = `${uuid()}.${extension}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  const filePath = path.join(uploadDir, generatedFileName);

  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(filePath, buffer);

  const extracted = await extractReceiptData(
    base64,
    file.type,
    file.name,
    receiptType
  );

  const publicFileUrl = `/uploads/${generatedFileName}`;
  const cleanJson = cleanJsonResponse(extracted);
  const parsed = JSON.parse(cleanJson);
  return {
    extractedData: parsed,
    filePath,
    generatedFileName,
    publicFileUrl,
  };
}
