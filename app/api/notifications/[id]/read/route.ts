import { NextResponse } from "next/server";

import { markNotificationRead } from "@/app/lib/notifications/notification-api";
import { notificationErrorResponse } from "@/app/lib/notifications/notification-http";
import { readExtractionUser } from "@/app/lib/receipts/extraction-http";

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
    const notification = await markNotificationRead(user.id, id);
    return NextResponse.json({ notification });
  } catch (error) {
    return notificationErrorResponse(error);
  }
}
