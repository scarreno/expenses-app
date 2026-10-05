import { describe, expect, it } from "vitest";

import {
  buildYearOptions,
  getCurrentPeriod,
  getMonthPrefix,
  parseDashboardFilters,
  resolveOwnedCategory,
} from "@/app/lib/dashboard/dashboard-filters";
import { labelCategoryTotals } from "@/app/lib/dashboard/label-category-totals";

const october2026 = new Date(2026, 9, 4);

describe("parseDashboardFilters", () => {
  it("defaults to the current month, current year, and all categories", () => {
    expect(parseDashboardFilters({}, october2026)).toEqual({
      month: "10",
      year: "2026",
      categoryId: null,
    });
  });

  it("keeps a valid month, year, and category", () => {
    expect(
      parseDashboardFilters(
        { month: "08", year: "2024", category: "category-1" },
        october2026
      )
    ).toEqual({
      month: "08",
      year: "2024",
      categoryId: "category-1",
    });
  });

  it("falls back when month or year is invalid", () => {
    expect(
      parseDashboardFilters(
        { month: "13", year: "20", category: "   " },
        october2026
      )
    ).toEqual({
      month: "10",
      year: "2026",
      categoryId: null,
    });
  });

  it("uses the local calendar month", () => {
    expect(getCurrentPeriod(october2026)).toEqual({
      month: "10",
      year: "2026",
    });
  });
});

describe("dashboard period helpers", () => {
  it("builds a calendar month prefix", () => {
    expect(getMonthPrefix("2026", "10")).toBe("2026-10");
    expect(getMonthPrefix("2026", "01")).toBe("2026-01");
  });

  it("builds year options from history, the current year, and the selection", () => {
    expect(buildYearOptions(["2024", "2026", "bad", "2024"], "2025", "2026")).toEqual([
      "2026",
      "2025",
      "2024",
    ]);
  });

  it("resolves only a category id present in the owned list", () => {
    const categories = [
      { id: "owned", code: "GROCERIES" },
      { id: "also-owned", code: "TRANSPORT" },
    ];

    expect(resolveOwnedCategory("owned", categories)?.code).toBe("GROCERIES");
    expect(resolveOwnedCategory("someone-else", categories)).toBeNull();
    expect(resolveOwnedCategory(null, categories)).toBeNull();
  });
});

describe("labelCategoryTotals", () => {
  it("labels owned categories and merges rows that share a label", () => {
    const labeled = labelCategoryTotals(
      [
        { categoryCode: "GROCERIES", total: 1000 },
        { categoryCode: "GROCERIES", total: 500 },
        { categoryCode: "UNKNOWN", total: 200 },
      ],
      [
        {
          code: "GROCERIES",
          displayName: null,
          isDefault: true,
        },
      ],
      { GROCERIES: "Groceries" }
    );

    expect(labeled).toEqual([
      { category: "Groceries", total: 1500 },
      { category: "Unknown", total: 200 },
    ]);
  });
});
