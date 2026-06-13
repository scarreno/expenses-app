import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";
import { v4 as uuid } from "uuid";
import { put, del } from "@vercel/blob";

export type UploadedReceiptFile = {
  filePath: string;
  generatedFileName: string;
  publicFileUrl: string;
};

const storageDriver = process.env.STORAGE_DRIVER ?? "local";

export async function uploadReceiptFile(
  file: File
): Promise<UploadedReceiptFile> {
  if (storageDriver === "vercel-blob") {
    return uploadToVercelBlob(file);
  }

  return uploadToLocalStorage(file);
}

export async function deleteReceiptFile(filePath: string): Promise<void> {
  if (storageDriver === "vercel-blob") {
    await deleteFromVercelBlob(filePath);
    return;
  }

  await deleteFromLocalStorage(filePath);
}

async function uploadToLocalStorage(file: File): Promise<UploadedReceiptFile> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const extension = file.name.split(".").pop();
  const generatedFileName = `${uuid()}.${extension}`;

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  const filePath = path.join(uploadDir, generatedFileName);

  await mkdir(uploadDir, { recursive: true });
  await writeFile(filePath, buffer);

  return {
    filePath,
    generatedFileName,
    publicFileUrl: `/uploads/${generatedFileName}`,
  };
}

async function uploadToVercelBlob(
  file: File
): Promise<UploadedReceiptFile> {
  const extension = file.name.split(".").pop();
  const generatedFileName = `${uuid()}.${extension}`;

  const blob = await put(`receipts/${generatedFileName}`, file, {
    access: "public",
  });

  return {
    filePath: blob.pathname,
    generatedFileName,
    publicFileUrl: blob.url,
  };
}

async function deleteFromLocalStorage(filePath: string): Promise<void> {
  const uploadsDir = path.join(process.cwd(), "public", "uploads");

  const resolvedFilePath = path.resolve(filePath);
  const resolvedUploadsDir = path.resolve(uploadsDir);

  if (!resolvedFilePath.startsWith(resolvedUploadsDir)) {
    throw new Error("Invalid file path");
  }

  try {
    await unlink(resolvedFilePath);
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return;
    }

    throw error;
  }
}

async function deleteFromVercelBlob(filePath: string): Promise<void> {
  await del(filePath);
}