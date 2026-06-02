import { parseISO } from "date-fns";

import { prisma } from "@/app/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MonthlyExpensesChartClient } from "./client";
import { MonthlyExpensesChartData } from "./types";
import { getCurrentUserOrRedirect } from "@/app/lib/auth-user";

export async function MonthlyExpensesChart() {

  const user = await getCurrentUserOrRedirect();


  const receipts = await prisma.receipt.findMany({
    where:{
      userId: user.id
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const monthlyData = receipts.reduce<Record<string, number>>(
    (acc, receipt) => {
      if (!receipt.purchaseDate) {
        return acc;
      }

      const date = parseISO(receipt.purchaseDate);

      const month = date.toLocaleDateString("es-CL", {
        month: "short",
        year: "numeric",
      });

      acc[month] = (acc[month] ?? 0) + (receipt.total ?? 0);

      return acc;
    },
    {}
  );

  const chartData: MonthlyExpensesChartData[] =
    Object.entries(monthlyData).map(
      ([month, total]) => ({
        month,
        total,
      })
    );

  return (
    <Card className="mt-8">
        <CardHeader>
            <h2 className="text-xl font-semibold">
                Monthly expenses
            </h2>
            <CardDescription>
            Total spent grouped by month.
            </CardDescription>
        </CardHeader>

        <CardContent>
            <MonthlyExpensesChartClient
            data={chartData}
            />
        </CardContent>
    </Card>

  );
}