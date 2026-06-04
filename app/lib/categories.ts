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
  { code: "FUEL" }
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


export async function getActiveCategoryCodes(
  userId: string
): Promise<string[]> {
  const categories = await prisma.category.findMany({
    where: {
      userId,
      isActive: true,
    },
    orderBy: {
      code: "asc",
    },
  });

  return categories.map((category) => category.code);
}

export async function getActiveCategoriesForUser(userId: string) {
  await ensureUserDefaultCategories(userId);

  return prisma.category.findMany({
    where: {
      userId,
      isActive: true,
    },
    orderBy: [{ isDefault: "desc" }, { code: "asc" }],
  });
}

export async function getDefaultCategoriesForClassification(userId: string) {
  await ensureUserDefaultCategories(userId);

  return prisma.category.findMany({
    where: {
      userId,
      isDefault: true,
      isActive: true,
    },
    orderBy: {
      code: "asc",
    },
  });
}

export async function getAvailableCategoriesForPreview(userId: string) {
  await ensureUserDefaultCategories(userId);

  return prisma.category.findMany({
    where: {
      userId,
      isActive: true,
    },
    orderBy: [{ isDefault: "desc" }, { code: "asc" }],
  });
}