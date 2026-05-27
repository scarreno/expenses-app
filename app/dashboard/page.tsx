import Link from "next/link";
import { MonthlyExpensesChart } from "@/app/components/dashboard/monthly-expenses-chart/index"
import { Button } from "@/components/ui/button";
import { DashboardReceiptSummary } from "@/app/components/dashboard/dashboard-receipts-summary";
import { CategoryTotalsChart } from "@/app/components/dashboard/category-total-chart/index";

export default async function DashboardPage() {

  return (
    <main className="mx-auto max-w-7xl p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Dashboard
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Overview of your receipts and expenses.
          </p>
        </div>

        <Button asChild>
          <Link href="/">Upload receipt</Link>
        </Button>
      </div>

      <DashboardReceiptSummary/>
      <MonthlyExpensesChart/>
      <CategoryTotalsChart/>

        
    </main>
  );
}
