"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { Transaction } from "@/types/transaction"

interface MonthlyChartProps {
  transactions: Transaction[]
}

export function MonthlyChart({ transactions }: MonthlyChartProps) {
  // Process transactions to get monthly data
  const processMonthlyData = () => {
    const monthlyData: { [key: string]: { income: number; expenses: number } } = {}

    transactions.forEach((transaction) => {
      const date = new Date(transaction.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expenses: 0 }
      }

      if (transaction.amount >= 0) {
        monthlyData[monthKey].income += transaction.amount
      } else {
        monthlyData[monthKey].expenses += Math.abs(transaction.amount)
      }
    })

    // Convert to array and sort by date
    const chartData = Object.entries(monthlyData)
      .map(([month, data]) => ({
        month: new Date(month + "-01").toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
        income: data.income,
        expenses: data.expenses,
        net: data.income - data.expenses,
      }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
      .slice(-6) // Show last 6 months

    return chartData
  }

  const chartData = processMonthlyData()

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No data available for chart
      </div>
    )
  }

  return (
    <ChartContainer
      config={{
        income: {
          label: "Income",
          color: "hsl(var(--chart-1))",
        },
        expenses: {
          label: "Expenses",
          color: "hsl(var(--chart-2))",
        },
      }}
      className="h-[300px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="month" className="text-xs" tick={{ fontSize: 12 }} />
          <YAxis className="text-xs" tick={{ fontSize: 12 }} tickFormatter={(value) => `$${value}`} />
          <ChartTooltip
            content={<ChartTooltipContent />}
            formatter={(value: number, name: string) => [
              `$${value.toFixed(2)}`,
              name === "income" ? "Income" : "Expenses",
            ]}
          />
          <Bar dataKey="income" fill="var(--color-income)" name="income" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expenses" fill="var(--color-expenses)" name="expenses" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
