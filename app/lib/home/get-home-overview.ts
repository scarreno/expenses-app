import { prisma } from "@/app/lib/database/prisma";

export async function getHomeOverview(userId: string) {
  const receipts = await prisma.receipt.findMany({
    where: {
      userId,
    },
    include: {
      items: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const totalSpent = receipts.reduce(
    (sum, receipt) => sum + (receipt.total ?? 0),
    0
  );

  const totalReceipts = receipts.length;

  const totalItems = receipts.reduce(
    (sum, receipt) => sum + receipt.items.length,
    0
  );

  const averageReceipt =
    totalReceipts > 0 ? Math.round(totalSpent / totalReceipts) : 0;

  const recentReceipts = receipts.slice(0, 5).map((receipt) => ({
    id: receipt.id,
    store: receipt.store,
    purchaseDate: receipt.purchaseDate,
    total: receipt.total,
  }));

  return {
    summary: {
      totalSpent,
      totalReceipts,
      totalItems,
      averageReceipt,
    },
    recentReceipts,
  };
}