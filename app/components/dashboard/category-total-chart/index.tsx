import { prisma } from '@/app/lib/prisma'

import { CategoryTotalsChartClient } from './client'
import type { CategoryTotalsChartData } from './types'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
export async function CategoryTotalsChart() {
  const items = await prisma.receiptItem.findMany({
    select: {
      category: true,
      totalPrice: true,
    },
  })

  const totalsByCategory = items.reduce<Record<string, number>>(
    (acc, item) => {
      const category = item.category ?? 'Unknown'

      acc[category] = (acc[category] ?? 0) + (item.totalPrice ?? 0)

      return acc
    },
    {}
  )

  const chartData: CategoryTotalsChartData[] = Object.entries(totalsByCategory)
    .map(([category, total]) => ({
      category,
      total,
    }))
    .sort((a, b) => b.total - a.total)

  return (
    <Card className="mt-8">
        <CardHeader>
            <h2 className="text-xl font-semibold">
                Category by Month
            </h2>
            <CardDescription>
            Total spent grouped by Category
            </CardDescription>
        </CardHeader>

        <CardContent>
            <CategoryTotalsChartClient data={chartData} />
        </CardContent>
    </Card>
  )
}