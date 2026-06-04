// app/lib/category-labels.ts

export type SupportedLanguage = "en" | "es";

export const CATEGORY_LABELS = {
  en: {
    MEAT: "Meat",
    FRUITS_AND_VEGETABLES: "Fruits and Vegetables",
    BAKERY: "Bakery",
    DAIRY: "Dairy",
    BEVERAGES: "Beverages",
    SNACKS: "Snacks",
    GROCERIES: "Groceries",
    CLEANING: "Cleaning",
    PERSONAL_CARE: "Personal Care",
    PETS: "Pets",
    HEALTH: "Health",
    HOME: "Home",
    RESTAURANTS: "Restaurants",
    TRANSPORT: "Transport",
    OTHER: "Other",
    UNCATEGORIZED: "Uncategorized",
    FUEL: "Fuel",
  },

  es: {
    MEAT: "Carnes",
    FRUITS_AND_VEGETABLES: "Frutas y Verduras",
    BAKERY: "Panadería",
    DAIRY: "Lácteos",
    BEVERAGES: "Bebidas",
    SNACKS: "Snacks",
    GROCERIES: "Abarrotes",
    CLEANING: "Limpieza",
    PERSONAL_CARE: "Cuidado Personal",
    PETS: "Mascotas",
    HEALTH: "Salud",
    HOME: "Hogar",
    RESTAURANTS: "Restaurantes",
    TRANSPORT: "Transporte",
    OTHER: "Otros",
    UNCATEGORIZED: "Sin Categoría",
    FUEL: "Gasolina",
  },
} as const;


type CategoryLike = {
  code: string;
  displayName: string | null;
  isDefault: boolean;
};

export function getCategoryLabel(
  category: CategoryLike,
  language: SupportedLanguage = "en"
): string {
  // Custom category
  if (!category.isDefault && category.displayName) {
    return category.displayName;
  }

  const labels =
    CATEGORY_LABELS[language] as Record<string, string>;

  return labels[category.code] ?? category.code;
}

export function getCategoryLabelFromCode(
  code: string,
  language: SupportedLanguage = "en"
): string {
  const labels =
    CATEGORY_LABELS[language] as Record<string, string>;

  return labels[code] ?? code;
}