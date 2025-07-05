"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import type { Transaction } from "@/types/transaction"

const COLORS = [
  "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28CFE", "#FE6E9A", "#8884D8", "#82ca9d"
]

interface CategoryPieChartProps {
  transactions: Transaction[]
}

export function CategoryPieChart({ transactions }: CategoryPieChartProps) {
  // Aggregate expenses by category
  const categoryData = transactions
    .filter((t) => t.amount < 0 && t.category)
    .reduce<{ [key: string]: number }>((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount)
      return acc
    }, {})

  const data = Object.entries(categoryData).map(([category, value]) => ({
    name: category,
    value
  }))

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No category expense data available
      </div>
    )
  }

  return (
    <ChartContainer config={{}}>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#8884d8"
            label
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltipContent />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
