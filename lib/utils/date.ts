import { format, parseISO } from "date-fns";
import type { UserSettings } from "@/app/types/user-settings-types";
import { defaultUserSettings } from "@/app/lib/settings/default-user-settings";

export function formatDisplayDate(
  date: string | Date,
  settings?: UserSettings
) {
  const parsed =
    typeof date === "string"
      ? parseISO(date)
      : date;

  return format(
    parsed,
    settings?.dateFormat ??
      defaultUserSettings.dateFormat
  );
}