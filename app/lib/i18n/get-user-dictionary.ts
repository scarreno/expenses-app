import { getUserSettings } from "@/app/lib/settings/get-user-settings";
import { getDictionary } from "@/app/lib/i18n/get-dictionary";

export async function getUserDictionary(userId: string) {
  const settings = await getUserSettings(userId);

  return getDictionary(settings.language);
}