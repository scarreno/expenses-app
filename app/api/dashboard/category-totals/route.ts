import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/app/lib/prisma";
import type { Prisma } from "@/app/generated/prisma/client";

export async function GET(request: NextRequest) {
  const month = request.nextUrl.searchParams.get("month") ?? "all";

  const where: Prisma.ReceiptItemWhereInput = {};

  if (month !== "all") {
    where.receipt = {
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

  return NextResponse.json(data);
}