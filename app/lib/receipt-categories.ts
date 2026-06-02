export const RECEIPT_CATEGORIES = [
  "MEAT",
  "FRUITS_AND_VEGETABLES",
  "BAKERY",
  "DAIRY",
  "BEVERAGES",
  "CLEANING",
  "PERSONAL_CARE",
  "PETS",
  "HEALTH",
  "HOME",
  "RESTAURANTS",
  "TRANSPORT",
  "OTHER",
  "UNCATEGORIZED",
] as const;

export type ReceiptCategory = (typeof RECEIPT_CATEGORIES)[number];

export function buildCategoryPromptSection() {
  return `
Use only one of the following categories for each receipt item:

${RECEIPT_CATEGORIES.map((category) => `- ${category}`).join("\n")}

Return the category value exactly as written.
Do not translate category values.
Do not invent new categories.

Category rules:

- MEAT: beef, chicken, pork, fish, seafood, sausages, ham.
- FRUITS_AND_VEGETABLES: fruits, vegetables, salads, herbs.
- BAKERY: bread, pastries, cakes, tortillas.
- DAIRY: milk, cheese, yogurt, butter, cream.
- BEVERAGES: water, soda, juice, coffee, tea, beer, wine, alcoholic beverages.
- CLEANING: detergent, dish soap, bleach, paper towels, toilet paper, cleaning supplies.
- PERSONAL_CARE: shampoo, soap, deodorant, toothpaste, cosmetics.
- PETS: pet food, pet supplies.
- HEALTH: medicine, vitamins, pharmacy items.
- HOME: kitchen items, tools, batteries, household items.
- RESTAURANTS: prepared meals, fast food, delivery, ready-to-eat meals.
- TRANSPORT: fuel, parking, tolls.
- OTHER: readable items that do not fit any category.
- UNCATEGORIZED: unreadable, missing, or impossible-to-classify items only.

Prefer OTHER over UNCATEGORIZED when the item is readable but does not clearly match a category.
`;
}