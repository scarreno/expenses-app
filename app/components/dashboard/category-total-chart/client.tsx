'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from 'recharts'

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

import { chartConfig } from './config'
import type { CategoryTotalsChartData } from './types'

type Props = {
  data: CategoryTotalsChartData[]
}

export function CategoryTotalsChartClient({ data }: Props) {
  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <BarChart data={data}>
        <CartesianGrid vertical={false} />

        <XAxis
          dataKey="category"
          tickLine={false}
          axisLine={false}
        />

        <YAxis
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) =>
                `$${Number(value).toLocaleString("es-CL")}`
            }
            />

        <ChartTooltip
            content={
                <ChartTooltipContent
                formatter={(value) =>
                    `$${Number(value).toLocaleString("es-CL")}`
                }
                />
            }
            />

        <Bar
            dataKey="total"
            fill="#22c55e"
            radius={[6, 6, 0, 0]}
            />
      </BarChart>
    </ChartContainer>
  )
}