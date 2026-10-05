"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { createDailyExpensesChartConfig } from "@/app/components/dashboard/daily-expenses-chart/config";
import { DailyExpensesChartData } from "@/app/components/dashboard/daily-expenses-chart/types";
import { Dictionary } from "@/app/types/dictionary";
import { UserSettings } from "@/app/types/user-settings-types";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { formatMoney } from "@/lib/utils/format-money";

type Props = {
  data: DailyExpensesChartData[];
  settings: UserSettings;
  dictionary: Dictionary;
};

export function DailyExpensesChartClient({ data, settings, dictionary }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">
        {dictionary.dashboard.filters.empty}
      </div>
    );
  }

  return (
    <ChartContainer
      config={createDailyExpensesChartConfig(dictionary.dashboard.filters.total)}
      className="h-[300px] w-full"
    >
      <BarChart data={data} margin={{ left: 24, right: 12, bottom: 24 }}>
        <CartesianGrid vertical={false} />

        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          interval={0}
          angle={-35}
          textAnchor="end"
          height={70}
        />

        <YAxis
          width={90}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => formatMoney(Number(value), settings)}
        />

        <ChartTooltip
          content={
            <ChartTooltipContent formatter={(value) => formatMoney(Number(value), settings)} />
          }
        />

        <Bar dataKey="total" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
