import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { v4 as uuid } from "uuid";
import { put } from "@vercel/blob";

type UploadedFile = {
  filePath: string;
  generatedFileName: string;
  publicFileUrl: string;
};

const storageDriver = process.env.STORAGE_DRIVER ?? "local";

export async function uploadReceiptFile(file: File): Promise<UploadedFile> {
  if (storageDriver === "vercel-blob") {
    return uploadToVercelBlob(file);
  }

  return uploadToLocalStorage(file);
}

async function uploadToLocalStorage(file: File): Promise<UploadedFile> {
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

async function uploadToVercelBlob(file: File): Promise<UploadedFile> {
  const extension = file.name.split(".").pop();
  const generatedFileName = `${uuid()}.${extension}`;

  const blob = await put(`uploads/${generatedFileName}`, file, {
    access: "public",
  });

  return {
    filePath: blob.pathname,
    generatedFileName,
    publicFileUrl: blob.url,
  };
}