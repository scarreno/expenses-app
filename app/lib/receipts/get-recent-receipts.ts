import { prisma } from "@/app/lib/database/prisma";

export async function getRecentReceipts(userId: string, limit: number = 5) {
  const recentReceipts = await prisma.receipt.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
    select: {
      id: true,
      store: true,
      purchaseDate: true,
      total: true,
    },
  });

  return recentReceipts;
}