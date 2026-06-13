export function normalizeMoney(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "number") {
    if (value < 1000 && value % 1 !== 0) {
      return Math.round(value * 1000);
    }

    return Math.round(value);
  }

  if (typeof value === "string") {
    const cleaned = value
      .replace(/\$/g, "")
      .replace(/\s/g, "")
      .replace(/\./g, "")
      .replace(/,/g, "");

    const parsed = Number(cleaned);

    return Number.isNaN(parsed) ? null : parsed;
  }

  return null;
}
