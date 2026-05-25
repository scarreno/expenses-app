export function parseReceiptDate(
  value: string | null | undefined
): Date | null {

  if (!value) {
    return null;
  }

  // DD-MM-YYYY
  const match =
    value.match(/^(\d{2})-(\d{2})-(\d{4})$/);

  if (match) {

    const [, day, month, year] = match;

    return new Date(
      `${year}-${month}-${day}`
    );
  }

  const parsed = new Date(value);

  if (isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}