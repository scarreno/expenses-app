import path from "node:path";

import { ExtractionRequestError } from "@/app/lib/receipts/extraction-errors";
import { isBlobStorageDriver } from "@/app/lib/storage/driver";
import { isSupportedReceiptFile } from "@/workers/extraction-policy";

const BLOB_HOST_SUFFIX = ".blob.vercel-storage.com";

type UploadLocationInput = {
  filePath: string;
  publicFileUrl: string;
  generatedFileName: string;
};

export function assertStoredUploadLocation(
  input: UploadLocationInput,
  driver = process.env.STORAGE_DRIVER ?? "local",
) {
  if (!isSafeFileName(input.generatedFileName) || !isSupportedReceiptFile(input.generatedFileName)) {
    throw new ExtractionRequestError(400, "Unsupported receipt file");
  }

  if (isBlobStorageDriver(driver)) {
    assertBlobLocation(input);
    return;
  }

  if (driver !== "local") {
    throw new ExtractionRequestError(400, "Unsupported storage driver");
  }

  assertLocalLocation(input);
}

function assertLocalLocation(input: UploadLocationInput) {
  if (input.publicFileUrl !== `/uploads/${input.generatedFileName}`) {
    throw new ExtractionRequestError(400, "Invalid upload location");
  }

  const uploadsDir = path.resolve(process.cwd(), "public", "uploads");
  const resolved = path.resolve(input.filePath);
  const relative = path.relative(uploadsDir, resolved);

  if (
    relative.startsWith("..") ||
    path.isAbsolute(relative) ||
    path.basename(resolved) !== input.generatedFileName
  ) {
    throw new ExtractionRequestError(400, "Invalid upload location");
  }
}

function assertBlobLocation(input: UploadLocationInput) {
  let url: URL;
  try {
    url = new URL(input.publicFileUrl);
  } catch {
    throw new ExtractionRequestError(400, "Invalid upload location");
  }

  const normalizedPath = input.filePath.replace(/^\/+/, "");
  if (
    url.protocol !== "https:" ||
    !url.hostname.endsWith(BLOB_HOST_SUFFIX) ||
    normalizedPath !== `receipts/${input.generatedFileName}` ||
    !url.pathname.endsWith(`/${input.generatedFileName}`)
  ) {
    throw new ExtractionRequestError(400, "Invalid upload location");
  }
}

function isSafeFileName(name: string) {
  return (
    name.length > 0 &&
    name.length <= 255 &&
    !name.includes("/") &&
    !name.includes("\\") &&
    !name.includes("..")
  );
}
