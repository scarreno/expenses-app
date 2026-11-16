import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { enqueueExtraction } from "@/app/lib/receipts/extraction-api";
import {
  extractionErrorResponse,
  readExtractionUser,
} from "@/app/lib/receipts/extraction-http";

const enqueueRequestSchema = z.object({
  receiptType: z.string().min(1),
  filePath: z.string().min(1),
  originalName: z.string().min(1).max(255),
  generatedFileName: z.string().min(1).max(255),
  publicFileUrl: z.string().min(1),
  idempotencyKey: z.string().min(1).max(200).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await readExtractionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = enqueueRequestSchema.parse(await request.json());
    const headerKey = request.headers.get("Idempotency-Key");
    const idempotencyKey = headerKey?.trim() || body.idempotencyKey;
    if (!idempotencyKey) {
      return NextResponse.json({ error: "Idempotency key is required" }, { status: 400 });
    }

    const result = await enqueueExtraction({
      userId: user.id,
      idempotencyKey,
      receiptType: body.receiptType,
      filePath: body.filePath,
      originalName: body.originalName,
      generatedFileName: body.generatedFileName,
      publicFileUrl: body.publicFileUrl,
    });

    return NextResponse.json(result, { status: 202 });
  } catch (error) {
    return extractionErrorResponse(error);
  }
}
