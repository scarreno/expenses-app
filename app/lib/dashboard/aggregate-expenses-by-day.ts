export type DailyExpense = {
  date: string;
  total: number;
};

const DAY_PREFIX = /^(\d{4}-\d{2}-\d{2})/;

export function aggregateExpensesByDay(
  rows: { date: string | null | undefined; amount: number | null | undefined }[]
): DailyExpense[] {
  const totals = new Map<string, number>();

  for (const row of rows) {
    const day = row.date ? DAY_PREFIX.exec(row.date)?.[1] : undefined;
    if (!day) {
      continue;
    }

    totals.set(day, (totals.get(day) ?? 0) + (row.amount ?? 0));
  }

  return Array.from(totals, ([date, total]) => ({ date, total })).sort((a, b) =>
    a.date.localeCompare(b.date)
  );
}
