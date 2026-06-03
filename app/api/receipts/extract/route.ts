import { NextRequest, NextResponse } from "next/server";
import { processReceiptFile } from "@/app/services/process-receipt-file";
import { getCurrentUserOrRedirect } from "@/app/lib/auth-user";

type ExtractReceiptRequest = {
  receiptType: string;
  filePath: string;
  generatedFileName: string;
  publicFileUrl: string;
  originalName: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<ExtractReceiptRequest>;
    const user = await getCurrentUserOrRedirect();

    const {
      receiptType,
      filePath,
      generatedFileName,
      publicFileUrl,
      originalName
    } = body;

    if (typeof receiptType !== "string" || !receiptType) {
      return NextResponse.json(
        { error: "Receipt type is required" },
        { status: 400 }
      );
    }

    if (typeof filePath !== "string" || !filePath) {
      return NextResponse.json(
        { error: "filePath is required" },
        { status: 400 }
      );
    }

    if (typeof originalName !== "string" || !originalName) {
      return NextResponse.json(
        { error: "originalName is required" },
        { status: 400 }
      );
    }
    if (
      typeof generatedFileName !== "string" ||
      !generatedFileName
    ) {
      return NextResponse.json(
        { error: "generatedFileName is required" },
        { status: 400 }
      );
    }

    if (typeof publicFileUrl !== "string" || !publicFileUrl) {
      return NextResponse.json(
        { error: "publicFileUrl is required" },
        { status: 400 }
      );
    }

    const result = await processReceiptFile({
      receiptType,
      filePath,
      generatedFileName,
      publicFileUrl,
      userId: user.id
    });

    return NextResponse.json({
      message: "Receipt processed successfully!",
      receiptType,
      file: {
        filePath,
        generatedFileName,
        publicFileUrl,
        originalName
      },
      receipt: result.extractedData,
    });
  } catch (error) {
    console.error("Extract receipt error:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      cause: error instanceof Error ? error.cause : undefined,
    });

    return NextResponse.json(
      {
        error: "Failed to process receipt",
        detail:
          process.env.NODE_ENV === "development" &&
          error instanceof Error
            ? error.message
            : undefined,
      },
      { status: 500 }
    );
  }
}