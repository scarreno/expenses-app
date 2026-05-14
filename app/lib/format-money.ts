export function formatMoney(
  value: number | null | undefined
) {

  if (
    value === null ||
    value === undefined
  ) {
    return "-";
  }

  return new Intl.NumberFormat(
    "es-CL",
    {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
    }
  ).format(value);
}