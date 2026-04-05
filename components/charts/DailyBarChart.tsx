"use client"

import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"


type DailyData = {
  date: string
  income: number
  expense: number
}

type Props = {
  data: DailyData[]
}

export default function DailyBarChart({ data }: Props) {
  if (data.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-10">No data for this month</p>
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} barCategoryGap="30%">
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10 }}
          tickFormatter={(val) => val.slice(8)}
          label={{ value: "Day", position: "insideBottom", offset: -2, fontSize: 11 }}
        />
        <YAxis tick={{ fontSize: 10 }} />
        <Tooltip
          labelFormatter={(label) => `Date: ${label}`}
          formatter={(value: any) =>
          [`${Number(value).toFixed(2)}`]
          }
        />
        <Legend
          formatter={(value) => (
            <span className="text-xs text-gray-600 capitalize">{value}</span>
          )}
        />
        <Bar dataKey="income"  fill="#65DE52" radius={[4, 4, 0, 0]} name="Income" />
        <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expense" />
      </BarChart>
    </ResponsiveContainer>
  )
}