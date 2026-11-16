import { NextResponse } from "next/server";

import { readExtractionUser } from "@/app/lib/receipts/extraction-http";
import { listNotifications } from "@/app/lib/notifications/notification-api";
import { notificationErrorResponse } from "@/app/lib/notifications/notification-http";

export async function GET() {
  try {
    const user = await readExtractionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await listNotifications(user.id);
    return NextResponse.json(result);
  } catch (error) {
    return notificationErrorResponse(error);
  }
}
