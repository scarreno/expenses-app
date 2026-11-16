import { randomUUID } from "node:crypto";
import path from "node:path";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { loadLocalEnv } from "@/workers/load-env";

loadLocalEnv();

const describeWithDb = process.env.DATABASE_URL ? describe : describe.skip;

type NotificationApi = typeof import("@/app/lib/notifications/notification-api");
type PrismaClient = typeof import("@/app/lib/database/prisma").prisma;

describeWithDb("notification api", { timeout: 20_000 }, () => {
  let api: NotificationApi;
  let prisma: PrismaClient;
  const userIds: string[] = [];

  beforeAll(async () => {
    api = await import("@/app/lib/notifications/notification-api");
    prisma = (await import("@/app/lib/database/prisma")).prisma;
  });

  afterAll(async () => {
    if (!prisma || userIds.length === 0) {
      return;
    }

    await prisma.receipt.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.category.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  });

  it("lists only the current user's notifications and links them to review", async () => {
    const owner = await createUser();
    const other = await createUser();
    const ready = await createNotification(owner, "EXTRACTION_SUCCEEDED");
    const failed = await createNotification(owner, "EXTRACTION_FAILED");
    await createNotification(other, "EXTRACTION_SUCCEEDED");

    const result = await api.listNotifications(owner);
    expect(result.unreadCount).toBe(2);
    expect(result.notifications.map((item) => item.id).sort()).toEqual([ready.id, failed.id].sort());
    expect(result.notifications.find((item) => item.id === ready.id)?.href).toBe(
      `/receipts/${ready.receiptId}/review`,
    );
    expect(result.notifications.find((item) => item.id === failed.id)?.href).toBe(
      `/receipts/${failed.receiptId}/review`,
    );
    expect(await api.countUnreadNotifications(other)).toBe(1);
  });

  it("marks one notification read without exposing another user's row", async () => {
    const owner = await createUser();
    const other = await createUser();
    const notification = await createNotification(owner, "EXTRACTION_SUCCEEDED");

    const first = await api.markNotificationRead(owner, notification.id);
    const second = await api.markNotificationRead(owner, notification.id);

    expect(first.readAt).toBeTruthy();
    expect(second.readAt).toBe(first.readAt);
    expect(await api.countUnreadNotifications(owner)).toBe(0);
    await expect(api.markNotificationRead(other, notification.id)).rejects.toMatchObject({
      status: 404,
    });
    expect(
      (await prisma.notification.findUnique({ where: { id: notification.id } }))?.readAt?.toISOString(),
    ).toBe(first.readAt);
  });

  it("marks every unread notification for that user", async () => {
    const owner = await createUser();
    const other = await createUser();
    await createNotification(owner, "EXTRACTION_SUCCEEDED");
    await createNotification(owner, "EXTRACTION_FAILED");
    const otherNotification = await createNotification(other, "EXTRACTION_FAILED");

    const result = await api.markAllNotificationsRead(owner);

    expect(result.updated).toBe(2);
    expect(await api.countUnreadNotifications(owner)).toBe(0);
    expect(await api.markAllNotificationsRead(owner)).toEqual({ updated: 0 });
    expect(
      (await prisma.notification.findUnique({ where: { id: otherNotification.id } }))?.readAt,
    ).toBeNull();
  });

  async function createUser() {
    const id = `phase4-${randomUUID()}`;
    await prisma.user.create({ data: { id } });
    userIds.push(id);
    return id;
  }

  async function createNotification(userId: string, type: "EXTRACTION_SUCCEEDED" | "EXTRACTION_FAILED") {
    const generatedFileName = `${randomUUID()}.pdf`;
    const receipt = await prisma.receipt.create({
      data: {
        userId,
        status: type === "EXTRACTION_SUCCEEDED" ? "READY_FOR_REVIEW" : "EXTRACTION_FAILED",
        fileName: "boleta.pdf",
        filePath: path.join(process.cwd(), "public", "uploads", generatedFileName),
        publicFileUrl: `/uploads/${generatedFileName}`,
        receiptType: "SUPERMARKET",
      },
    });
    const job = await prisma.processingJob.create({
      data: {
        receiptId: receipt.id,
        userId,
        status: type === "EXTRACTION_SUCCEEDED" ? "SUCCEEDED" : "FAILED",
        idempotencyKey: randomUUID(),
      },
    });
    return prisma.notification.create({
      data: {
        userId,
        type,
        receiptId: receipt.id,
        jobId: job.id,
        messageKey:
          type === "EXTRACTION_SUCCEEDED"
            ? "notifications.extractionSucceeded"
            : "notifications.extractionFailed",
      },
    });
  }
});
