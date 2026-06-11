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
import { Dictionary } from "@/app/types/dictionary";

type Props = {
  userId: string;
  dictionary: Dictionary;
};

export async function MonthlyExpensesChart({ userId, dictionary }: Props) {
  const receipts = await prisma.receipt.findMany({
    where: {
      userId,
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

  const chartData: MonthlyExpensesChartData[] = Object.entries(monthlyData).map(
    ([month, total]) => ({
      month,
      total,
    })
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{dictionary.dashboard.monthlyExpenses.title}</CardTitle>
        <CardDescription>{dictionary.dashboard.monthlyExpenses.description}</CardDescription>
      </CardHeader>

      <CardContent>
        <MonthlyExpensesChartClient data={chartData} />
      </CardContent>
    </Card>
  );
}