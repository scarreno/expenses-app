import Link from "next/link";

import { CategoryTotalsChart } from "@/app/components/dashboard/category-totals-chart/index";
import { DashboardReceiptSummary } from "@/app/components/dashboard/dashboard-receipts-summary";
import { MonthlyExpensesChart } from "@/app/components/dashboard/monthly-expenses-chart/index";
import { PageContainer } from "@/app/components/layout/page-container";
import { PageHeader } from "@/app/components/layout/page-header";
import { PageHeaderActions } from "@/app/components/layout/page-header-actions";
import { getCurrentUserOrRedirect } from "@/app/lib/auth-user";
import { getUserSettings } from "@/app/lib/settings/get-user-settings";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const user = await getCurrentUserOrRedirect();
  const settings = await getUserSettings(user.id);

  return (
    <PageContainer className="max-w-7xl">
      <PageHeaderActions>
        <PageHeader
          title="Dashboard"
          description="Overview of your receipts and expenses."
        />

        <Button asChild>
          <Link href="/">Upload receipt</Link>
        </Button>
      </PageHeaderActions>

      <DashboardReceiptSummary settings={settings} userId={user.id} />

      <CategoryTotalsChart settings={settings} userId={user.id} />

      <MonthlyExpensesChart userId={user.id} />
    </PageContainer>
  );
}