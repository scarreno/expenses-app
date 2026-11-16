import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { getCurrentUser } from "@/app/lib/auth/auth-user";
import { ExtractionRequestError } from "@/app/lib/receipts/extraction-errors";

export async function readExtractionUser() {
  try {
    return await getCurrentUser();
  } catch (error) {
    if (error instanceof Error && isAuthFailure(error.message)) {
      return null;
    }
    throw error;
  }
}

export function extractionErrorResponse(error: unknown) {
  if (error instanceof ExtractionRequestError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  if (error instanceof ZodError) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  console.error(error instanceof Error ? error.message : "Receipt request failed");
  return NextResponse.json({ error: "Receipt request failed" }, { status: 500 });
}

function isAuthFailure(message: string) {
  return (
    message === "User not authenticated" ||
    message === "User not found in database" ||
    message === "Clerk user not found"
  );
}
