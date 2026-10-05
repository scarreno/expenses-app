import { getCategoryLabel } from "@/app/lib/categories/category-labels";
import { toTitleCase } from "@/lib/utils/to-title-case";

type CategoryLike = {
  code: string;
  displayName: string | null;
  isDefault: boolean;
};

export type CategoryTotal = {
  categoryCode: string;
  total: number;
};

export type LabeledCategoryTotal = {
  category: string;
  total: number;
};

export function labelCategoryTotals(
  totals: CategoryTotal[],
  categories: CategoryLike[],
  defaultLabels: Record<string, string>
): LabeledCategoryTotal[] {
  const categoryMap = new Map(categories.map((category) => [category.code, category]));
  const merged = new Map<string, number>();

  for (const row of totals) {
    const category = categoryMap.get(row.categoryCode);
    const label = category
      ? getCategoryLabel(category, defaultLabels)
      : toTitleCase(row.categoryCode);

    merged.set(label, (merged.get(label) ?? 0) + row.total);
  }

  return Array.from(merged, ([category, total]) => ({ category, total })).sort(
    (a, b) => b.total - a.total
  );
}
