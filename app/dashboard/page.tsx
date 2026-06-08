import Link from "next/link";
import { MonthlyExpensesChart } from "@/app/components/dashboard/monthly-expenses-chart/index"
import { Button } from "@/components/ui/button";
import { DashboardReceiptSummary } from "@/app/components/dashboard/dashboard-receipts-summary";
import { CategoryTotalsChart } from "@/app/components/dashboard/category-totals-chart/index";
import { getCurrentUserOrRedirect } from "@/app/lib/auth-user";
import { getUserSettings } from "@/app/lib/settings/get-user-settings";
import { PageHeader } from "@/app/components/layout/page-header";

export default async function DashboardPage({ searchParams }: {
    searchParams: Promise<{ month?: string }>;
  }) {

  const user = await getCurrentUserOrRedirect();
  const settings = await getUserSettings(user.id);

  return (
    <main className="mx-auto max-w-7xl p-8">
      <div className="mb-8 flex items-center justify-between">
        <PageHeader
                    title="Dashboard"
                    description="Overview of your receipts and expenses."
                  />

        <Button asChild>
          <Link href="/">Upload receipt</Link>
        </Button>
      </div>

      <DashboardReceiptSummary settings={settings} userId={user.id}/>      
      <CategoryTotalsChart 
        settings={settings}
        userId={user.id}
        />
      <MonthlyExpensesChart userId={user.id}/>

        
    </main>
  );
}
