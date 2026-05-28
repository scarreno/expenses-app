'use client'
import { useState } from "react";
import { useRouter } from 'next/navigation'
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

type ChartData = {
  category: string;
  total: number;
};

type Props = {
  initialData: ChartData[];
  months: string[];
};

const formatCLP = (value: number) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);

export function CategoryTotalsChartClient({
    initialData,
    months,
    }: Props) {

    const [data, setData] = useState(initialData);
    const [selectedMonth, setSelectedMonth] = useState("all");
    const [loading, setLoading] = useState(false);
    
    const router = useRouter();

    async function handleMonthChange(value: string) {
      setSelectedMonth(value);

      setLoading(true);

      try {
        const response = await fetch(
          `/api/dashboard/category-totals?month=${value}`
        );

        const result = await response.json();

        setData(result);
      } finally {
        setLoading(false);
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
              <YAxis tickFormatter={formatCLP} />
              <Tooltip formatter={(value) => formatCLP(Number(value))} />
              <Bar dataKey="total" fill="#22c55e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
}