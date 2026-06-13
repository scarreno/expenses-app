import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextRequest, NextResponse } from "next/server";
import { deleteReceiptFile, uploadReceiptFile } from "@/app/lib/storage/storage";

const storageDriver = process.env.STORAGE_DRIVER ?? "local";

export async function POST(request: NextRequest) {
  try {
    if (storageDriver === "vercel-blob") {
      const body = (await request.json()) as HandleUploadBody;

      const jsonResponse = await handleUpload({
        body,
        request,
        onBeforeGenerateToken: async () => {
          return {
            allowedContentTypes: [
              "image/jpeg",
              "image/png",
              "image/webp",
              "application/pdf",
            ],
            tokenPayload: JSON.stringify({
              uploadedAt: new Date().toISOString(),
            }),
          };
        },
        onUploadCompleted: async ({ blob }) => {
          console.log("Receipt file uploaded to Vercel Blob:", {
            url: blob.url,
            pathname: blob.pathname,
          });
        },
      });

      return NextResponse.json(jsonResponse);
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "File is required" },
        { status: 400 }
      );
    }

    const uploadedFile = await uploadReceiptFile(file);

    return NextResponse.json(uploadedFile);
  } catch (error) {
    console.error("Upload receipt file error:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      cause: error instanceof Error ? error.cause : undefined,
    });

    return NextResponse.json(
      {
        error: "Failed to upload receipt file",
        detail:
          process.env.NODE_ENV === "development" && error instanceof Error
            ? error.message
            : undefined,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { filePath } = await request.json();

    if (!filePath || typeof filePath !== "string") {
      return NextResponse.json(
        { error: "filePath is required" },
        { status: 400 }
      );
    }

    await deleteReceiptFile(filePath);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete receipt file error:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      cause: error instanceof Error ? error.cause : undefined,
    });

    return NextResponse.json(
      {
        error: "Failed to delete receipt file",
        detail:
          process.env.NODE_ENV === "development" && error instanceof Error
            ? error.message
            : undefined,
      },
      { status: 500 }
    );
  }
}