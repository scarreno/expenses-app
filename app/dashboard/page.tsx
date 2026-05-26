import Link from "next/link";

import { prisma } from "@/app/lib/prisma";
import { formatMoney } from "@/app/lib/format-money";
import { DashboardCard } from "@/app/components/dashboard-card";
import { MonthlyExpensesChart } from "@/app/components/monthly-expenses-chart"
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function DashboardPage() {
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

  const monthlyData = receipts.reduce<Record<string, number>>(
    (acc, receipt) => {
        const date = receipt.purchaseDate ?? receipt.createdAt;

        console.log(date);
        const month = date.toLocaleDateString("es-CL", {
        month: "short",
        year: "numeric",
        });

        acc[month] = (acc[month] ?? 0) + (receipt.total ?? 0);

        return acc;
    },
    {}
    );

    const chartData = Object.entries(monthlyData).map(
    ([month, total]) => ({
        month,
        total,
    })
    );

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

        <Card className="mt-8">
            <CardHeader>
                <CardTitle>Monthly expenses</CardTitle>
                <CardDescription>
                Total spent grouped by month.
                </CardDescription>
            </CardHeader>

            <CardContent>
                <MonthlyExpensesChart data={chartData} />
            </CardContent>
        </Card>
    </main>
  );
}
