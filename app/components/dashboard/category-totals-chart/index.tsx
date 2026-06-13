import { CategoryTotalsChartClient } from "./client";

import { getCategoryLabel } from "@/app/lib/categories/category-labels";
import { prisma } from "@/app/lib/database/prisma";
import { UserSettings } from "@/app/types/user-settings-types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toTitleCase } from "@/app/lib/generic/to-title-case";
import { Dictionary } from "@/app/types/dictionary";

type Props = {
  settings: UserSettings;
  userId: string;
  dictionary: Dictionary;
};

export async function CategoryTotalsChart({ settings, userId, dictionary }: Props) {
  const items = await prisma.receiptItem.findMany({
    where: {
      receipt: {
        userId,
      },
    },
    select: {
      category: true,
      totalPrice: true,
    },
  });

  const categories = await prisma.category.findMany({
    where: {
      userId,
    },
  });

  const categoryMap = new Map(
    categories.map((category) => [category.code, category])
  );

  const data = Object.values(
    items.reduce<Record<string, { category: string; total: number }>>(
      (acc, item) => {
        const categoryCode = item.category ?? "UNKNOWN";
        const category = categoryMap.get(categoryCode);

        const categoryLabel = category
          ? getCategoryLabel(category, dictionary.categories.defaults)
          : toTitleCase(categoryCode);

        acc[categoryLabel] ??= {
          category: categoryLabel,
          total: 0,
        };

        acc[categoryLabel].total += item.totalPrice ?? 0;

        return acc;
      },
      {}
    )
  ).sort((a, b) => b.total - a.total);

  const receipts = await prisma.receipt.findMany({
    where: {
      userId,
      purchaseDate: {
        not: null,
      },
    },
    select: {
      purchaseDate: true,
    },
  });

  const months = Array.from(
    new Set(
      receipts
        .map((receipt) => receipt.purchaseDate?.slice(0, 7))
        .filter((month): month is string => Boolean(month))
    )
  ).sort((a, b) => b.localeCompare(a));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{dictionary.dashboard.categoryInsights.title}</CardTitle>
        <CardDescription>
          {dictionary.dashboard.categoryInsights.description}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <CategoryTotalsChartClient
          initialData={data}
          months={months}
          settings={settings}
          dictionary={dictionary}
        />
      </CardContent>
    </Card>
  );
}
