import { DashboardCard } from "@/app/components/dashboard-card";
import { formatMoney } from "@/app/lib/format-money";
import { prisma } from "@/app/lib/prisma";
import { UserSettings } from "@/app/types/user-settings-types";
import { Dictionary } from "@/app/types/dictionary";

type Props = {
  settings: UserSettings;
  userId: string;
  dictionary: Dictionary;
};

export async function DashboardReceiptSummary({ settings, userId, dictionary }: Props) {
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

  return (
    <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      <DashboardCard
        title={dictionary.dashboard.summary.totalSpent}
        value={formatMoney(totalSpent, settings)}
      />

      <DashboardCard title={dictionary.dashboard.summary.receipts} value={String(totalReceipts)} />

      <DashboardCard title={dictionary.dashboard.summary.items} value={String(totalItems)} />

      <DashboardCard
        title={dictionary.dashboard.summary.averageReceipt}
        value={formatMoney(averageReceipt, settings)}
      />
    </section>
  );
}