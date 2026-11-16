import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { confirmExtraction } from "@/app/lib/receipts/extraction-api";
import {
  extractionErrorResponse,
  readExtractionUser,
} from "@/app/lib/receipts/extraction-http";

const confirmRequestSchema = z.object({
  receiptType: z.string().min(1).optional(),
  receipt: z.unknown(),
});

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await readExtractionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = confirmRequestSchema.parse(await request.json());
    const receipt = await confirmExtraction(user.id, id, {
      receiptType: body.receiptType,
      receipt: body.receipt,
    });

    return NextResponse.json(receipt);
  } catch (error) {
    return extractionErrorResponse(error);
  }
}
