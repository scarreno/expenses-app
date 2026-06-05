'use client'
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatMoney }
from "@/app/lib/format-money";
import { UserSettings } from "@/app/types/user-settings-types";

type ChartData = {
  category: string;
  total: number;
};

type Props = {
  initialData: ChartData[];
  months: string[];
  settings: UserSettings;
};


export function CategoryTotalsChartClient({
    initialData,
    months,
    settings
    }: Props) {

    const [data, setData] = useState(initialData);
    const [selectedMonth, setSelectedMonth] = useState("all");
    
    async function handleMonthChange(value: string) {
      setSelectedMonth(value);

      
      try {
        const response = await fetch(
          `/api/dashboard/category-totals?month=${value}`
        );

        const result = await response.json();

        setData(result);
      } finally {

      }
    }
    
  return (
      <div className="rounded-xl border p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Expenses by Category</h2>
            <p className="text-sm text-muted-foreground">
              Total spending per category
            </p>
          </div>

          <Select
            value={selectedMonth}
            onValueChange={handleMonthChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>

            <SelectContent className="z-50 bg-zinc-950 text-zinc-50 border border-zinc-800 shadow-xl">
              <SelectItem value="all">
                All
              </SelectItem>

              {months.map((month) => (
                <SelectItem
                  key={month}
                  value={month}
                >
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="category" />
              <YAxis
                tickFormatter={(value) =>
                  formatMoney(Number(value), settings)
                }
              />
              <Tooltip
                formatter={(value) =>
                  formatMoney(Number(value), settings)
                }
              />
              <Bar dataKey="total" fill="#22c55e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
}