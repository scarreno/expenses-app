import { NextResponse } from "next/server";

import { countUnreadNotifications } from "@/app/lib/notifications/notification-api";
import { notificationErrorResponse } from "@/app/lib/notifications/notification-http";
import { readExtractionUser } from "@/app/lib/receipts/extraction-http";

export async function GET() {
  try {
    const user = await readExtractionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const unreadCount = await countUnreadNotifications(user.id);
    return NextResponse.json({ unreadCount });
  } catch (error) {
    return notificationErrorResponse(error);
  }
}
