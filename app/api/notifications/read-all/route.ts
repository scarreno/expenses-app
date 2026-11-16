import { NextResponse } from "next/server";

import { markAllNotificationsRead } from "@/app/lib/notifications/notification-api";
import { notificationErrorResponse } from "@/app/lib/notifications/notification-http";
import { readExtractionUser } from "@/app/lib/receipts/extraction-http";

export async function POST() {
  try {
    const user = await readExtractionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await markAllNotificationsRead(user.id);
    return NextResponse.json(result);
  } catch (error) {
    return notificationErrorResponse(error);
  }
}
