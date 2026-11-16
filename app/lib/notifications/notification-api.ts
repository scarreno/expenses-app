import { prisma } from "@/app/lib/database/prisma";
import { NOTIFICATION_TYPE } from "@/app/lib/receipts/receipt-lifecycle";

const DEFAULT_LIMIT = 20;

export class NotificationRequestError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "NotificationRequestError";
    this.status = status;
  }
}

export type NotificationView = {
  id: string;
  type: string;
  receiptId: string | null;
  messageKey: string;
  readAt: string | null;
  createdAt: string;
  href: string | null;
};

type NotificationRow = {
  id: string;
  type: string;
  receiptId: string | null;
  messageKey: string;
  readAt: Date | null;
  createdAt: Date;
};

export async function listNotifications(userId: string, limit = DEFAULT_LIMIT) {
  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: notificationSelect,
    }),
    countUnreadNotifications(userId),
  ]);

  return {
    notifications: notifications.map(toView),
    unreadCount,
  };
}

export async function countUnreadNotifications(userId: string) {
  return prisma.notification.count({
    where: {
      userId,
      readAt: null,
    },
  });
}

export async function markNotificationRead(userId: string, notificationId: string) {
  const existing = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      userId,
    },
    select: notificationSelect,
  });

  if (!existing) {
    throw new NotificationRequestError(404, "Notification not found");
  }

  if (!existing.readAt) {
    await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });
  }

  const current = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      userId,
    },
    select: notificationSelect,
  });

  if (!current) {
    throw new NotificationRequestError(404, "Notification not found");
  }

  return toView(current);
}

export async function markAllNotificationsRead(userId: string) {
  const result = await prisma.notification.updateMany({
    where: {
      userId,
      readAt: null,
    },
    data: {
      readAt: new Date(),
    },
  });

  return { updated: result.count };
}

export function notificationHref(type: string, receiptId: string | null) {
  if (!receiptId) {
    return null;
  }

  if (
    type === NOTIFICATION_TYPE.EXTRACTION_SUCCEEDED ||
    type === NOTIFICATION_TYPE.EXTRACTION_FAILED
  ) {
    return `/receipts/${receiptId}/review`;
  }

  return null;
}

const notificationSelect = {
  id: true,
  type: true,
  receiptId: true,
  messageKey: true,
  readAt: true,
  createdAt: true,
} as const;

function toView(row: NotificationRow): NotificationView {
  return {
    id: row.id,
    type: row.type,
    receiptId: row.receiptId,
    messageKey: row.messageKey,
    readAt: row.readAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    href: notificationHref(row.type, row.receiptId),
  };
}
