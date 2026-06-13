import { DashboardCard } from "@/app/components/dashboard-card";
import { formatMoney } from "@/lib/utils/format-money";
import { UserSettings } from "@/app/types/user-settings-types";
import { Dictionary } from "@/app/types/dictionary";
import { getReceiptSummary } from "@/app/lib/receipts/get-summary"

type Props = {
  settings: UserSettings;
  userId: string;
  dictionary: Dictionary;
};

export async function DashboardReceiptSummary({ settings, userId, dictionary }: Props) {
  const summary = await getReceiptSummary(userId)
  const { totalSpent, totalReceipts, totalItems, averageReceipt } = summary;

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