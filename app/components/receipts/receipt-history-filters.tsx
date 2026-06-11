"use client";

import { useRouter, useSearchParams } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dictionary } from "@/app/types/dictionary";

type Props = {
  years: string[];
  selectedMonth: string;
  selectedYear: string;
  dictionary: Dictionary;
};

const months = [
  { value: "01", key: "january" },
  { value: "02", key: "february" },
  { value: "03", key: "march" },
  { value: "04", key: "april" },
  { value: "05", key: "may" },
  { value: "06", key: "june" },
  { value: "07", key: "july" },
  { value: "08", key: "august" },
  { value: "09", key: "september" },
  { value: "10", key: "october" },
  { value: "11", key: "november" },
  { value: "12", key: "december" },
] as const;

export function ReceiptHistoryFilters({
  years,
  selectedMonth,
  selectedYear,
  dictionary
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
          <SelectItem value="all">{dictionary.receiptsHistory.filters.allMonths}</SelectItem>

          {months.map((month) => (
            <SelectItem key={month.value} value={month.value}>
              {dictionary.common.months[month.key]}
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
          <SelectItem value="all">{dictionary.receiptsHistory.filters.allYears}</SelectItem>

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