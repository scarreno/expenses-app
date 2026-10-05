import Link from "next/link";

import { CategoryTotalsChart } from "@/app/components/dashboard/category-totals-chart/index";
import { DailyExpensesChart } from "@/app/components/dashboard/daily-expenses-chart/index";
import { DashboardFilters } from "@/app/components/dashboard/dashboard-filters";
import { DashboardReceiptSummary } from "@/app/components/dashboard/dashboard-receipts-summary";
import { PageContainer } from "@/app/components/layout/page-container";
import { PageHeader } from "@/app/components/layout/page-header";
import { PageHeaderActions } from "@/app/components/layout/page-header-actions";
import { getCurrentUserOrRedirect } from "@/app/lib/auth/auth-user";
import { getCategoryLabel } from "@/app/lib/categories/category-labels";
import { loadDashboard } from "@/app/lib/dashboard/get-dashboard-metrics";
import { labelCategoryTotals } from "@/app/lib/dashboard/label-category-totals";
import { getDictionary } from "@/app/lib/i18n/get-dictionary";
import { getUserSettings } from "@/app/lib/settings/get-user-settings";
import { formatDisplayDate } from "@/lib/utils/date";
import { Button } from "@/components/ui/button";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{
    month?: string;
    year?: string;
    category?: string;
  }>;
}) {
  const params = await searchParams;
  const user = await getCurrentUserOrRedirect();
  const settings = await getUserSettings(user.id);
  const dictionary = getDictionary(settings.language);
  const dashboard = await loadDashboard(user.id, params);

  const categoryChartData = labelCategoryTotals(
    dashboard.period.categoryTotals,
    dashboard.categories,
    dictionary.categories.defaults
  );

  const dailyChartData = dashboard.period.dailyTotals.map((point) => ({
    date: formatDisplayDate(point.date, settings),
    total: point.total,
  }));

  const categoryOptions = dashboard.categories.map((category) => ({
    id: category.id,
    label: getCategoryLabel(category, dictionary.categories.defaults),
  }));

  return (
    <PageContainer className="max-w-7xl">
      <PageHeaderActions>
        <PageHeader
          title={dictionary.dashboard.title}
          description={dictionary.dashboard.description}
        />

        <Button asChild>
          <Link href="/">{dictionary.dashboard.actions.uploadReceipt}</Link>
        </Button>
      </PageHeaderActions>

      <DashboardFilters
        years={dashboard.years}
        categories={categoryOptions}
        selectedMonth={dashboard.filters.month}
        selectedYear={dashboard.filters.year}
        selectedCategoryId={dashboard.filters.categoryId ?? "all"}
        dictionary={dictionary}
      />

      <DashboardReceiptSummary
        settings={settings}
        dictionary={dictionary}
        summary={dashboard.period.summary}
      />

      <CategoryTotalsChart
        data={categoryChartData}
        settings={settings}
        dictionary={dictionary}
      />

      <DailyExpensesChart
        data={dailyChartData}
        settings={settings}
        dictionary={dictionary}
      />
    </PageContainer>
  );
}
