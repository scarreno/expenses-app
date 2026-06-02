
import { upload } from "@vercel/blob/client";

export type UploadedReceiptFile = {
  filePath: string;
  generatedFileName: string;
  publicFileUrl: string;
};

const storageDriver =
  process.env.NEXT_PUBLIC_STORAGE_DRIVER ?? "local";

export async function uploadReceiptFileFromClient(
  file: File
): Promise<UploadedReceiptFile> {
  if (storageDriver === "vercel-blob") {
    return uploadToVercelBlob(file);
  }

  return uploadToLocalStorage(file);
}

export async function deleteReceiptFileFromClient(
  filePath: string
): Promise<void> {
  await fetch("/api/receipts/upload-file", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ filePath }),
  });
}

async function uploadToLocalStorage(
  file: File
): Promise<UploadedReceiptFile> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/receipts/upload-file", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to upload receipt file");
  }

  return response.json();
}

async function uploadToVercelBlob(
  file: File
): Promise<UploadedReceiptFile> {
  const extension = file.name.split(".").pop();
  const generatedFileName = `${crypto.randomUUID()}.${extension}`;

  const blob = await upload(
  `receipts/${generatedFileName}`,
  file,
  {
    access: "public",
    handleUploadUrl: "/api/receipts/upload-file",
  }
);

  return {
    filePath: blob.pathname,
    generatedFileName,
    publicFileUrl: blob.url,
  };
}