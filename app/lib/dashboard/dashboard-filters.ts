import { format } from "date-fns";

export const DASHBOARD_MONTHS = [
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

export type DashboardMonth = (typeof DASHBOARD_MONTHS)[number]["value"];

export type DashboardFilterParams = {
  month?: string | null;
  year?: string | null;
  category?: string | null;
};

export type ParsedDashboardFilters = {
  month: DashboardMonth;
  year: string;
  categoryId: string | null;
};

const YEAR_PATTERN = /^\d{4}$/;

export function isValidMonth(value: string | null | undefined): value is DashboardMonth {
  return DASHBOARD_MONTHS.some((month) => month.value === value);
}

export function isValidYear(value: string | null | undefined): value is string {
  return Boolean(value && YEAR_PATTERN.test(value));
}

export function getCurrentPeriod(now = new Date()) {
  return {
    month: format(now, "MM") as DashboardMonth,
    year: format(now, "yyyy"),
  };
}

export function parseDashboardFilters(
  params: DashboardFilterParams,
  now = new Date()
): ParsedDashboardFilters {
  const current = getCurrentPeriod(now);
  const category = params.category?.trim() ?? "";

  return {
    month: isValidMonth(params.month) ? params.month : current.month,
    year: isValidYear(params.year) ? params.year : current.year,
    categoryId: category.length > 0 ? category : null,
  };
}

export function getMonthPrefix(year: string, month: string) {
  return `${year}-${month}`;
}

export function buildYearOptions(
  receiptYears: string[],
  selectedYear: string,
  currentYear: string
) {
  const years = new Set<string>();

  for (const year of receiptYears) {
    if (isValidYear(year)) {
      years.add(year);
    }
  }

  if (isValidYear(currentYear)) {
    years.add(currentYear);
  }

  if (isValidYear(selectedYear)) {
    years.add(selectedYear);
  }

  return Array.from(years).sort((a, b) => b.localeCompare(a));
}

export function resolveOwnedCategory<T extends { id: string }>(
  categoryId: string | null,
  categories: T[]
): T | null {
  if (!categoryId) {
    return null;
  }

  return categories.find((category) => category.id === categoryId) ?? null;
}
