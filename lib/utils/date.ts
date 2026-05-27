// lib/utils/date.ts

import { format, parseISO } from "date-fns";
import { appSettings } from "@/lib/config/app-settings";

export function formatDisplayDate(date: string | Date) {
  const parsed =
    typeof date === "string"
      ? parseISO(date)
      : date;

  return format(
    parsed,
    appSettings.date.displayFormat
  );
}