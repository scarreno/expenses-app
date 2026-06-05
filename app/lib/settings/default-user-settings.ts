import { appSettings } from "@/lib/config/app-settings";

export const defaultUserSettings = {
  locale: appSettings.locale,
  dateFormat: appSettings.date.displayFormat,
  storageFormat: appSettings.date.storageFormat,
  currencyLocale: appSettings.currency.locale,
  currencyCode: appSettings.currency.currency,
};