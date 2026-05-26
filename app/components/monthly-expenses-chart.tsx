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

type Props = {
  data: {
    month: string;
    total: number;
  }[];
};

const chartConfig = {
  total: {
    label: "Total",
  },
};

export function MonthlyExpensesChart({ data }: Props) {
  return (
    <ChartContainer
      config={chartConfig}
      className="h-[300px] w-full"
    >
      <BarChart data={data}>
        <CartesianGrid vertical={false} />

        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
        />

        <YAxis
          tickLine={false}
          axisLine={false}
        />

        <ChartTooltip
          content={<ChartTooltipContent />}
        />

        <Bar
          dataKey="total"
          radius={6}
        />
      </BarChart>
    </ChartContainer>
  );
}