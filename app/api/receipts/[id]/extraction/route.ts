import { NextResponse } from "next/server";

import { getExtraction } from "@/app/lib/receipts/extraction-api";
import {
  extractionErrorResponse,
  readExtractionUser,
} from "@/app/lib/receipts/extraction-http";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await readExtractionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const extraction = await getExtraction(user.id, id);
    if (!extraction) {
      return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
    }

    return NextResponse.json(extraction);
  } catch (error) {
    return extractionErrorResponse(error);
  }
}
