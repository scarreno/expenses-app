import { prisma } from '@/app/lib/prisma'

import { CategoryTotalsChartClient } from './client'
import { getCurrentUserOrRedirect } from "@/app/lib/auth-user";

type Props = {
    selectedMonth: string;
}
export async function CategoryTotalsChart({ selectedMonth }: Props) {

  const user = await getCurrentUserOrRedirect();

    const items = await prisma.receiptItem.findMany({
      where: {
        receipt: {
          userId: user.id,
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