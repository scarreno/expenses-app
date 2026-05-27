function normalizePurchaseDate(date: string) {
  const parts = date.split("/");

  if (parts.length === 3) {
    const [a, b, c] = parts;

    // assume dd/MM/yyyy
    return `${c}-${b.padStart(2, "0")}-${a.padStart(2, "0")}`;
  }

  return date;
}