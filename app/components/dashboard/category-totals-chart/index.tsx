import { CategoryTotalsChartClient } from "./client";

import { prisma } from "@/app/lib/prisma";
import { UserSettings } from "@/app/types/user-settings-types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Props = {
  settings: UserSettings;
  userId: string;
};

export async function CategoryTotalsChart({ settings, userId }: Props) {
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

  const data = Object.values(
    items.reduce<Record<string, { category: string; total: number }>>(
      (acc, item) => {
        const category = item.category ?? "UNKNOWN";

        acc[category] ??= {
          category,
          total: 0,
        };

        acc[category].total += item.totalPrice ?? 0;

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
        <CardTitle>Category Insights</CardTitle>
        <CardDescription>
          Total spending distribution by category.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <CategoryTotalsChartClient
          initialData={data}
          months={months}
          settings={settings}
        />
      </CardContent>
    </Card>
  );
}