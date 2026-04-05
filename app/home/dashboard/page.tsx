"use client"

import { useEffect, useState } from "react"

type Transaction = {
  id: string
  amount: number
  type: "income" | "expense"
  description: string
  date: string
  category: {
    name: string
    color: string
    icon: string
  }
}

type User = {
  name: string
  _count: {
    transactions: number
    budgets: number
    categories: number
  }
}

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const currentMonth = new Date().toISOString().slice(0, 7)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [txRes, userRes] = await Promise.all([
          fetch(`/api/transactions?month=${currentMonth}`),
          fetch("/api/user"),
        ])

        const txData = await txRes.json()
        const userData = await userRes.json()

        if (txRes.ok) setTransactions(txData)
        if (userRes.ok) setUser(userData)
      } catch {
        console.error("Failed to fetch dashboard data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0)

  const netBalance = totalIncome - totalExpense

  const recentTransactions = transactions.slice(0, 5)

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400 text-sm">Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          {greeting()}, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-sm text-gray-500">
          Here your overview for {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">

        <div className="bg-white p-5 rounded-2xl shadow-sm">
          <h2 className="text-sm text-gray-500">Total Balance</h2>
          <p className={`text-2xl font-bold mt-2 ${netBalance >= 0 ? "text-green-600" : "text-red-500"}`}>
            ${netBalance.toFixed(2)}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm">
          <h2 className="text-sm text-gray-500">Monthly Expenses</h2>
          <p className="text-2xl font-bold text-red-500 mt-2">-${totalExpense.toFixed(2)}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm">
          <h2 className="text-sm text-gray-500">Monthly Income</h2>
          <p className="text-2xl font-bold text-blue-600 mt-2">+${totalIncome.toFixed(2)}</p>
        </div>

      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Recent Transactions
        </h2>

        {recentTransactions.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No transactions this month</p>
        ) : (
          <div className="space-y-3">
            {recentTransactions.map((t) => (
              <div key={t.id} className="flex justify-between items-center text-sm border-b pb-2 last:border-0">
                <div className="flex items-center gap-2">
                  <span>{t.category?.icon}</span>
                  <div>
                    <p className="text-gray-600">{t.description || t.category?.name}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      {" · "}{t.category?.name}
                    </p>
                  </div>
                </div>
                <span className={t.type === "income" ? "text-green-600" : "text-red-500"}>
                  {t.type === "income" ? "+" : "-"}${t.amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}