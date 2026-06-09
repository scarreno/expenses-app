"use client";

import { useRouter, useSearchParams } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  years: string[];
  selectedMonth: string;
  selectedYear: string;
};

const months = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

export function ReceiptHistoryFilters({
  years,
  selectedMonth,
  selectedYear,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateFilter(key: "month" | "year", value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    params.set("page", "1");

    router.push(`/receipts?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
      <Select
        value={selectedMonth}
        onValueChange={(value) => updateFilter("month", value)}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Month" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">All months</SelectItem>

          {months.map((month) => (
            <SelectItem key={month.value} value={month.value}>
              {month.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={selectedYear}
        onValueChange={(value) => updateFilter("year", value)}
      >
        <SelectTrigger className="w-full sm:w-[140px]">
          <SelectValue placeholder="Year" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">All years</SelectItem>

          {years.map((year) => (
            <SelectItem key={year} value={year}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}