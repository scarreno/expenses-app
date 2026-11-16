import path from "node:path";

import { describe, expect, it } from "vitest";

import { ExtractionRequestError } from "@/app/lib/receipts/extraction-errors";
import { assertStoredUploadLocation } from "@/app/lib/receipts/upload-location";

describe("stored upload locations", () => {
  it("accepts a file inside the local uploads directory", () => {
    const generatedFileName = "receipt.pdf";
    expect(() =>
      assertStoredUploadLocation(
        {
          generatedFileName,
          publicFileUrl: `/uploads/${generatedFileName}`,
          filePath: path.join(process.cwd(), "public", "uploads", generatedFileName),
        },
        "local",
      ),
    ).not.toThrow();
  });

  it("rejects a local path outside the uploads directory", () => {
    expect(() =>
      assertStoredUploadLocation(
        {
          generatedFileName: "receipt.pdf",
          publicFileUrl: "/uploads/receipt.pdf",
          filePath: path.join(process.cwd(), "receipt.pdf"),
        },
        "local",
      ),
    ).toThrow(ExtractionRequestError);
  });

  it("accepts a configured blob host and rejects other hosts", () => {
    expect(() =>
      assertStoredUploadLocation(
        {
          generatedFileName: "receipt.pdf",
          filePath: "receipts/receipt.pdf",
          publicFileUrl: "https://store.public.blob.vercel-storage.com/receipts/receipt.pdf",
        },
        "vercel-blob",
      ),
    ).not.toThrow();

    expect(() =>
      assertStoredUploadLocation(
        {
          generatedFileName: "receipt.pdf",
          filePath: "receipts/receipt.pdf",
          publicFileUrl: "https://example.com/receipts/receipt.pdf",
        },
        "vercel-blob",
      ),
    ).toThrow(ExtractionRequestError);

    expect(() =>
      assertStoredUploadLocation(
        {
          generatedFileName: "receipt.pdf",
          filePath: "receipts/receipt.pdf",
          publicFileUrl: "https://store.public.blob.vercel-storage.com/receipts/receipt.pdf",
        },
        "blob",
      ),
    ).not.toThrow();
  });
});
