"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

import { formatMoney } from "@/app/lib/format-money";
import { UserSettings } from "@/app/types/user-settings-types";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ChartData = {
  category: string;
  total: number;
};

type Props = {
  initialData: ChartData[];
  months: string[];
  settings: UserSettings;
};

const chartConfig = {
  total: {
    label: "Total",
    color: "var(--chart-2)",
  },
};

function truncateLabel(value: string, maxLength = 14) {
  return value.length > maxLength
    ? `${value.slice(0, maxLength)}...`
    : value;
}

export function CategoryTotalsChartClient({
  initialData,
  months,
  settings,
}: Props) {
  const [data, setData] = useState(initialData);
  const [selectedMonth, setSelectedMonth] = useState("all");

  async function handleMonthChange(value: string) {
    setSelectedMonth(value);

    const response = await fetch(`/api/dashboard/category-totals?month=${value}`);

    if (!response.ok) {
      return;
    }

    const result = await response.json();
    setData(result);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Select value={selectedMonth} onValueChange={handleMonthChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Select month" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">All</SelectItem>

            {months.map((month) => (
              <SelectItem key={month} value={month}>
                {month}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ChartContainer config={chartConfig} className="h-[360px] w-full">
        <BarChart data={data} margin={{ left: 24, right: 12, bottom: 24 }}>
          <CartesianGrid vertical={false} />

          <XAxis
            dataKey="category"
            tickLine={false}
            axisLine={false}
            interval={0}
            angle={-20}
            textAnchor="end"
            height={70}
            tickFormatter={(value) => truncateLabel(String(value))}
          />

          <YAxis
            width={90}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => formatMoney(Number(value), settings)}
          />

          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value) => formatMoney(Number(value), settings)}
              />
            }
          />

          <Bar
            dataKey="total"
            fill="var(--chart-2)"
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
}