import { DashboardCard } from "@/app/components/dashboard-card";
import { DashboardSummary } from "@/app/lib/dashboard/get-dashboard-metrics";
import { Dictionary } from "@/app/types/dictionary";
import { UserSettings } from "@/app/types/user-settings-types";
import { formatMoney } from "@/lib/utils/format-money";

type Props = {
  settings: UserSettings;
  dictionary: Dictionary;
  summary: DashboardSummary;
};

export function DashboardReceiptSummary({ settings, dictionary, summary }: Props) {
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
