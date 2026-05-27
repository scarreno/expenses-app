import { formatMoney } from "@/app/lib/format-money";
import { DashboardCard } from "@/app/components/dashboard-card";
import { prisma } from "@/app/lib/prisma";

export async function DashboardReceiptSummary(){
      const receipts = await prisma.receipt.findMany({
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
    
      const averageReceipt = totalReceipts > 0 ? Math.round(totalSpent / totalReceipts) : 0;

    return (
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <DashboardCard
          title="Total Spent"
          value={formatMoney(totalSpent)}
        />

        <DashboardCard
          title="Receipts"
          value={String(totalReceipts)}
        />

        <DashboardCard
          title="Items"
          value={String(totalItems)}
        />

        <DashboardCard
          title="Average Receipt"
          value={formatMoney(averageReceipt)}
        />
      </section>
    );
}