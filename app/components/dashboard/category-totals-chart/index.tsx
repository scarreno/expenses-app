import { prisma } from '@/app/lib/prisma'
import { Prisma } from "@/app/generated/prisma/client";

import { CategoryTotalsChartClient } from './client'
import type { CategoryTotalsChartData } from './types'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";


type Props = {
    selectedMonth: string;
}
export async function CategoryTotalsChart({ selectedMonth }: Props) {

    const items = await prisma.receiptItem.findMany({
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
    <section className="mt-8 space-y-4">
      <div>
        <h2 className="text-xl font-semibold">
          Category Insights
        </h2>

        <p className="text-sm text-muted-foreground">
          Total spending distribution by category
        </p>
      </div>

      <CategoryTotalsChartClient 
        initialData={data}
        months={months}
      />
    </section>
  );
}