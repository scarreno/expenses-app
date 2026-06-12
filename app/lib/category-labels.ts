type CategoryLike = {
  code: string;
  displayName: string | null;
  isDefault: boolean;
};

export function getCategoryLabel(
  category: CategoryLike,
  defaultLabels: Record<string, string>
): string {
  if (!category.isDefault && category.displayName) {
    return category.displayName;
  }

  return defaultLabels[category.code] ?? category.code;
}
