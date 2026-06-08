"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import { chartConfig } from "@/app/components/dashboard/monthly-expenses-chart/config";
import { MonthlyExpensesChartData } from "@/app/components/dashboard/monthly-expenses-chart/types";

type Props = {
  data: MonthlyExpensesChartData[];
};

export function MonthlyExpensesChartClient({ data }: Props) {
  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <BarChart data={data} margin={{ left: 24, right: 12 }}>
        <CartesianGrid vertical={false} />

        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
        />

        <YAxis
          width={90}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) =>
            `$${Number(value).toLocaleString("es-CL")}`
          }
        />

        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value) =>
                `$${Number(value).toLocaleString("es-CL")}`
              }
            />
          }
        />

        <Bar
          dataKey="total"
          fill="var(--chart-1)"
          radius={[6, 6, 0, 0]}
        />
      </BarChart>
    </ChartContainer>
  );
}