import { NextResponse } from "next/server";

import { discardExtraction } from "@/app/lib/receipts/extraction-api";
import {
  extractionErrorResponse,
  readExtractionUser,
} from "@/app/lib/receipts/extraction-http";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await readExtractionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const result = await discardExtraction(user.id, id);
    return NextResponse.json(result);
  } catch (error) {
    return extractionErrorResponse(error);
  }
}
