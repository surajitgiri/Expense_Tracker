"use client"

import { LineChart , Line , XAxis , YAxis , Tooltip , Legend , CartesianGrid , ResponsiveContainer, Label } from "recharts"

type DailyData = {
    date: string
    income: number
    expense: number
}

type Props = {
    data: DailyData[]
}

export default function TrendLineChart({data}:Props){
    return (
        <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6"/>
            <XAxis
            dataKey="date"
            tick={{fontSize: 10}}
            tickFormatter={(val) => val.slice(8)}
            />
            <YAxis tick={{fontSize : 10}}/>
            <Tooltip
             labelFormatter={(label) => `Date: ${label}`}
             formatter={(value: number) => `${value.toFixed(2)}`}
            />
            <Legend
             formatter={(value) => (
                <span className="text-xs text-gray-600 capitalize">{value}</span>
             )}
            />
            <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} dot={false} name="Income"/>
            <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} dot={false} name="Expanse"/>
            </LineChart>
        </ResponsiveContainer>
    )
}