"use client";

import { useRouter } from "next/navigation";

import { DASHBOARD_MONTHS } from "@/app/lib/dashboard/dashboard-filters";
import { Dictionary } from "@/app/types/dictionary";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type CategoryOption = {
  id: string;
  label: string;
};

type Props = {
  years: string[];
  categories: CategoryOption[];
  selectedMonth: string;
  selectedYear: string;
  selectedCategoryId: string;
  dictionary: Dictionary;
};

export function DashboardFilters({
  years,
  categories,
  selectedMonth,
  selectedYear,
  selectedCategoryId,
  dictionary,
}: Props) {
  const router = useRouter();
  const filters = dictionary.dashboard.filters;
  const selectedMonthLabel =
    dictionary.common.months[
      DASHBOARD_MONTHS.find((month) => month.value === selectedMonth)?.key ?? "january"
    ];
  const selectedCategoryLabel =
    categories.find((category) => category.id === selectedCategoryId)?.label ??
    filters.allCategories;

  function updateFilter(key: "month" | "year" | "category", value: string) {
    const params = new URLSearchParams();
    params.set("month", key === "month" ? value : selectedMonth);
    params.set("year", key === "year" ? value : selectedYear);

    const category = key === "category" ? value : selectedCategoryId;
    if (category !== "all") {
      params.set("category", category);
    }

    router.push(`/dashboard?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        {filters.showing}{" "}
        <span className="font-medium text-foreground">
          {selectedMonthLabel} {selectedYear}
        </span>
        <span aria-hidden="true"> · </span>
        <span className="font-medium text-foreground">{selectedCategoryLabel}</span>
      </p>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">{filters.month}</span>
          <Select
            value={selectedMonth}
            onValueChange={(value) => updateFilter("month", value)}
          >
            <SelectTrigger aria-label={filters.month} className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DASHBOARD_MONTHS.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {dictionary.common.months[month.key]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">{filters.year}</span>
          <Select value={selectedYear} onValueChange={(value) => updateFilter("year", value)}>
            <SelectTrigger aria-label={filters.year} className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">{filters.category}</span>
          <Select
            value={selectedCategoryId}
            onValueChange={(value) => updateFilter("category", value)}
          >
            <SelectTrigger aria-label={filters.category} className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{filters.allCategories}</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
