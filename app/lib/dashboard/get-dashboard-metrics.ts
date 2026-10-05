import { prisma } from "@/app/lib/database/prisma";

import { aggregateExpensesByDay, type DailyExpense } from "./aggregate-expenses-by-day";
import {
  buildYearOptions,
  getCurrentPeriod,
  getMonthPrefix,
  parseDashboardFilters,
  resolveOwnedCategory,
  type DashboardFilterParams,
} from "./dashboard-filters";
import type { CategoryTotal } from "./label-category-totals";

export type DashboardSummary = {
  totalSpent: number;
  totalReceipts: number;
  totalItems: number;
  averageReceipt: number;
};

export type DashboardPeriodData = {
  summary: DashboardSummary;
  categoryTotals: CategoryTotal[];
  dailyTotals: DailyExpense[];
};

export type DashboardPeriodFilters = {
  month: string;
  year: string;
  categoryCode: string | null;
};

function averageReceipt(totalSpent: number, totalReceipts: number) {
  return totalReceipts > 0 ? Math.round(totalSpent / totalReceipts) : 0;
}

function toCategoryTotals(
  rows: { category: string | null; _sum: { totalPrice: number | null } }[]
): CategoryTotal[] {
  return rows
    .map((row) => ({
      categoryCode: row.category ?? "UNKNOWN",
      total: row._sum.totalPrice ?? 0,
    }))
    .sort((a, b) => b.total - a.total);
}

export async function getOwnedCategories(userId: string) {
  return prisma.category.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { code: "asc" }],
  });
}

export async function getDashboardYearOptions(
  userId: string,
  selectedYear: string,
  now = new Date()
) {
  const receipts = await prisma.receipt.findMany({
    where: {
      userId,
      purchaseDate: { not: null },
    },
    select: {
      purchaseDate: true,
    },
  });

  const receiptYears = receipts.map((receipt) => receipt.purchaseDate?.slice(0, 4) ?? "");

  return buildYearOptions(receiptYears, selectedYear, getCurrentPeriod(now).year);
}

export async function getDashboardPeriodData(
  userId: string,
  filters: DashboardPeriodFilters
): Promise<DashboardPeriodData> {
  const prefix = getMonthPrefix(filters.year, filters.month);
  const periodWhere = {
    userId,
    purchaseDate: {
      startsWith: prefix,
    },
  };

  if (filters.categoryCode) {
    const itemWhere = {
      category: filters.categoryCode,
      receipt: periodWhere,
    };

    const [itemAggregate, receiptCount, grouped, dailyRows] = await Promise.all([
      prisma.receiptItem.aggregate({
        where: itemWhere,
        _sum: { totalPrice: true },
        _count: { _all: true },
      }),
      prisma.receipt.count({
        where: {
          ...periodWhere,
          items: {
            some: {
              category: filters.categoryCode,
            },
          },
        },
      }),
      prisma.receiptItem.groupBy({
        by: ["category"],
        where: itemWhere,
        _sum: { totalPrice: true },
      }),
      prisma.receiptItem.findMany({
        where: itemWhere,
        select: {
          totalPrice: true,
          receipt: {
            select: {
              purchaseDate: true,
            },
          },
        },
      }),
    ]);

    const totalItems = itemAggregate._count._all;
    const totalSpent = itemAggregate._sum.totalPrice ?? 0;

    return {
      summary: {
        totalSpent,
        totalReceipts: receiptCount,
        totalItems,
        averageReceipt: averageReceipt(totalSpent, receiptCount),
      },
      categoryTotals: toCategoryTotals(grouped),
      dailyTotals: aggregateExpensesByDay(
        dailyRows.map((row) => ({
          date: row.receipt.purchaseDate,
          amount: row.totalPrice,
        }))
      ),
    };
  }

  const [receiptAggregate, itemCount, grouped, dailyGroups] = await Promise.all([
    prisma.receipt.aggregate({
      where: periodWhere,
      _sum: { total: true },
      _count: { _all: true },
    }),
    prisma.receiptItem.count({
      where: {
        receipt: periodWhere,
      },
    }),
    prisma.receiptItem.groupBy({
      by: ["category"],
      where: {
        receipt: periodWhere,
      },
      _sum: { totalPrice: true },
    }),
    prisma.receipt.groupBy({
      by: ["purchaseDate"],
      where: periodWhere,
      _sum: { total: true },
    }),
  ]);

  const totalReceipts = receiptAggregate._count._all;
  const totalSpent = receiptAggregate._sum.total ?? 0;

  return {
    summary: {
      totalSpent,
      totalReceipts,
      totalItems: itemCount,
      averageReceipt: averageReceipt(totalSpent, totalReceipts),
    },
    categoryTotals: toCategoryTotals(grouped),
    dailyTotals: aggregateExpensesByDay(
      dailyGroups.map((row) => ({
        date: row.purchaseDate,
        amount: row._sum.total,
      }))
    ),
  };
}

export async function loadDashboard(
  userId: string,
  params: DashboardFilterParams,
  now = new Date()
) {
  const parsed = parseDashboardFilters(params, now);
  const categories = await getOwnedCategories(userId);
  const ownedCategory = resolveOwnedCategory(parsed.categoryId, categories);

  const [years, period] = await Promise.all([
    getDashboardYearOptions(userId, parsed.year, now),
    getDashboardPeriodData(userId, {
      month: parsed.month,
      year: parsed.year,
      categoryCode: ownedCategory?.code ?? null,
    }),
  ]);

  return {
    filters: {
      month: parsed.month,
      year: parsed.year,
      categoryId: ownedCategory?.id ?? null,
    },
    categories,
    years,
    period,
  };
}
