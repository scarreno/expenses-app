import { NextResponse } from "next/server";

import { NotificationRequestError } from "@/app/lib/notifications/notification-api";

export function notificationErrorResponse(error: unknown) {
  if (error instanceof NotificationRequestError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  console.error(error instanceof Error ? error.message : "Notification request failed");
  return NextResponse.json({ error: "Notification request failed" }, { status: 500 });
}
