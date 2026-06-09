import { NextRequest, NextResponse } from "next/server";

import type { Prisma } from "@/app/generated/prisma/client";
import { getCurrentUser } from "@/app/lib/auth-user";
import { getCategoryLabel } from "@/app/lib/category-labels";
import { prisma } from "@/app/lib/prisma";
import { toTitleCase } from "@/app/lib/to-title-case";


export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  const month = request.nextUrl.searchParams.get("month") ?? "all";

  const where: Prisma.ReceiptItemWhereInput = {
    receipt: {
      userId: user.id,
    },
  };

  if (month !== "all") {
    where.receipt = {
      userId: user.id,
      purchaseDate: {
        startsWith: month,
      },
    };
  }

  const items = await prisma.receiptItem.findMany({
    where,
    select: {
      category: true,
      totalPrice: true,
    },
  });

  const userCategories = await prisma.category.findMany({
    where: {
      userId: user.id,
    },
  });

  const categoryMap = new Map(
    userCategories.map((category) => [category.code, category])
  );

  const data = Object.values(
    items.reduce<Record<string, { category: string; total: number }>>(
      (acc, item) => {
        const categoryCode = item.category ?? "UNKNOWN";
        const category = categoryMap.get(categoryCode);

        const categoryLabel = category
          ? getCategoryLabel(category, "en")
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

  return NextResponse.json(data);
}
