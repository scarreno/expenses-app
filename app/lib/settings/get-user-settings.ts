import { prisma } from "@/app/lib/database/prisma";
import { defaultUserSettings } from "./default-user-settings";

export async function getUserSettings(userId: string) {
  const settings = await prisma.userSettings.findUnique({
    where: { userId },
  });

  return {
    ...defaultUserSettings,
    ...settings,
  };
}