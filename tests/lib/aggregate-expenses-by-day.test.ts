import { describe, expect, it } from "vitest";

import { aggregateExpensesByDay } from "@/app/lib/dashboard/aggregate-expenses-by-day";

describe("aggregateExpensesByDay", () => {
  it("sums receipts that share a purchase date and keeps one point per day", () => {
    expect(
      aggregateExpensesByDay([
        { date: "2026-10-02", amount: 1000 },
        { date: "2026-10-02", amount: 2500 },
        { date: "2026-10-05", amount: 400 },
      ])
    ).toEqual([
      { date: "2026-10-02", total: 3500 },
      { date: "2026-10-05", total: 400 },
    ]);
  });

  it("orders days chronologically and omits days without expenses", () => {
    expect(
      aggregateExpensesByDay([
        { date: "2026-10-24", amount: 800 },
        { date: "2026-10-02", amount: 100 },
        { date: "2026-10-12", amount: 200 },
      ])
    ).toEqual([
      { date: "2026-10-02", total: 100 },
      { date: "2026-10-12", total: 200 },
      { date: "2026-10-24", total: 800 },
    ]);
  });

  it("renders a single matching day and skips rows without a purchase date", () => {
    expect(
      aggregateExpensesByDay([
        { date: null, amount: 900 },
        { date: "2026-10-05T13:00:00", amount: 150 },
        { date: "2026-10-05", amount: 50 },
      ])
    ).toEqual([{ date: "2026-10-05", total: 200 }]);
  });

  it("returns no points when nothing matches", () => {
    expect(aggregateExpensesByDay([])).toEqual([]);
  });
});
