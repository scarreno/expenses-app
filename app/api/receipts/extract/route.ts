import { NextRequest, NextResponse } from "next/server";
import { processReceiptFile } from "@/app/services/process-receipt-file";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const receiptType = formData.get("receiptType");

    if (typeof receiptType != "string" || !receiptType) {
      return NextResponse.json(
        { error: "Receipt type is required" },
        { status: 400 }
      );
    }
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    const result = await processReceiptFile(file, receiptType);

    return NextResponse.json({
      message: "Receipt uploaded succesfully!",
      receiptType,
      file: {
        originalName: file.name,
        filePath: result.filePath,
        generatedFileName: result.generatedFileName,
        publicFileUrl: result.publicFileUrl,
      },
      receipt: result.extractedData,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error: "Failed to process receipt",
      },
      { status: 500 }
    );
  }
}
