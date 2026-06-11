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
import { getDictionary } from "@/app/lib/i18n/get-dictionary";

export default async function DashboardPage() {
  const user = await getCurrentUserOrRedirect();
  const settings = await getUserSettings(user.id);
  const dictionary = getDictionary(settings.language);

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

      <DashboardReceiptSummary 
        settings={settings} 
        userId={user.id} 
        dictionary={dictionary}
      />

      <CategoryTotalsChart 
        settings={settings} 
        userId={user.id} 
        dictionary={dictionary}
      />

      <MonthlyExpensesChart 
        userId={user.id} 
        dictionary={dictionary}
      />
    </PageContainer>
  );
}