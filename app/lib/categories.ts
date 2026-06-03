import { prisma } from "@/app/lib/prisma";

export const DEFAULT_CATEGORIES = [
  { code: "MEAT" },
  { code: "FRUITS_AND_VEGETABLES" },
  { code: "BAKERY" },
  { code: "DAIRY" },
  { code: "BEVERAGES" },
  { code: "SNACKS" },
  { code: "GROCERIES" },
  { code: "CLEANING" },
  { code: "PERSONAL_CARE" },
  { code: "PETS" },
  { code: "HEALTH" },
  { code: "HOME" },
  { code: "RESTAURANTS" },
  { code: "TRANSPORT" },
  { code: "OTHER" },
  { code: "UNCATEGORIZED" },
] as const;


export async function ensureUserDefaultCategories(userId: string) {
  const existingCategories = await prisma.category.count({
    where: { userId },
  });

  if (existingCategories > 0) {
    return;
  }

  await prisma.category.createMany({
    data: DEFAULT_CATEGORIES.map((category) => ({
      userId,
      code: category.code,
      displayName: null,
      isDefault: true,
      isActive: true,
    })),
  });
}
