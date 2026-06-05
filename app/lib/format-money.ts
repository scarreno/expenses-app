import { UserSettings } from "@/app/types/user-settings-types";

export function formatMoney(
  value: number | null | undefined,
  settings: UserSettings
) {
  if (
    value === null ||
    value === undefined
  ) {
    return "-";
  }

  return new Intl.NumberFormat(
    settings.currencyLocale,
    {
      style: "currency",
      currency: settings.currencyCode,
      minimumFractionDigits: 0,
    }
  ).format(value);
}