import { prisma } from "@/app/lib/database/prisma";

export async function getReceiptSummary(userId: string) {
  const receipts = await prisma.receipt.findMany({
    where: { userId },
    include: { items: true },
  });

  const totalSpent = receipts.reduce((sum, r) => sum + (r.total ?? 0), 0);
  const totalReceipts = receipts.length;
  const totalItems = receipts.reduce((sum, r) => sum + r.items.length, 0);
  const averageReceipt = totalReceipts > 0 ? Math.round(totalSpent / totalReceipts) : 0;

  return { totalSpent, totalReceipts, totalItems, averageReceipt };
}