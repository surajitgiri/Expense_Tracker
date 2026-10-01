"use client"

import { useCallback, useEffect, useState } from "react"
import { useCurrency } from "@/context/CurrencyContext"

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

type Account = {
  id: string
  name: string
  type: "Bank" | "Cash" | "Credit Card" | "Savings"
  balance: number
  color: string
}

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastMonthIncome, setLastMonthIncome] = useState(0)
  const [lastMonthExpense, setLastMonthExpense] = useState(0)

  const { format } = useCurrency()

  const [accountsData, setAccountsData] = useState<{
    accounts: Account[]
    netWorth: number
    bankBalance: number
    cashBalance: number
  }>({ accounts: [], netWorth: 0, bankBalance: 0, cashBalance: 0 })

  const [showAccountModal, setShowAccountModal] = useState(false)
  const [accountForm, setAccountForm] = useState({
    name: "",
    type: "Bank",
    balance: "",
    color: "#4F46E5",
  })
  const [submittingAccount, setSubmittingAccount] = useState(false)
  const [accountError, setAccountError] = useState("")

  const fetchAccounts = async () => {
    try {
      const res = await fetch("/api/accounts")
      const data = await res.json()
      if (res.ok) {
        setAccountsData(data)
      }
    } catch {
      console.error("Failed to load accounts")
    }
  }

  const fetchData = useCallback(async () => {
    try {
      const currentMonth = new Date().toISOString().slice(0, 7)
      const [txRes, userRes, accRes] = await Promise.all([
        fetch(`/api/transactions?month=${currentMonth}`),
        fetch("/api/user"),
        fetch("/api/accounts"),
      ])

      const txData = await txRes.json()
      const userData = await userRes.json()

      if (txRes.ok) setTransactions(txData)
      if (userRes.ok) setUser(userData)
      if (accRes.ok) {
        const aData = await accRes.json()
        setAccountsData(aData)
      }

      // Fetch last month for trend computation
      try {
        const lastMonthDate = new Date()
        lastMonthDate.setMonth(lastMonthDate.getMonth() - 1)
        const lastMonth = lastMonthDate.toISOString().slice(0, 7)
        const lmRes = await fetch(`/api/transactions?month=${lastMonth}`)
        if (lmRes.ok) {
          const lmData: Transaction[] = await lmRes.json()
          setLastMonthIncome(lmData.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0))
          setLastMonthExpense(lmData.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0))
        }
      } catch {}
    } catch {
      console.error("Failed to fetch dashboard data")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()

    window.addEventListener("transactionAdded", fetchData)
    return () => window.removeEventListener("transactionAdded", fetchData)
  }, [fetchData])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showAccountModal) {
        setShowAccountModal(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [showAccountModal])

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmittingAccount(true)
    setAccountError("")

    try {
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(accountForm),
      })
      const data = await res.json()

      if (res.ok) {
        setShowAccountModal(false)
        setAccountForm({ name: "", type: "Bank", balance: "", color: "#4F46E5" })
        await fetchAccounts()
      } else {
        setAccountError(data.error || "Failed to create account")
      }
    } catch {
      setAccountError("Something went wrong")
    } finally {
      setSubmittingAccount(false)
    }
  }

  const handleDeleteAccount = async (id: string) => {
    if (!confirm("Are you sure you want to delete this account?")) return

    try {
      const res = await fetch(`/api/accounts/${id}`, { method: "DELETE" })
      if (res.ok) {
        await fetchAccounts()
      }
    } catch {
      alert("Failed to delete account")
    }
  }

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0)

  const netBalance = totalIncome - totalExpense
  const recentTransactions = transactions.slice(0, 5)

  // Trend helpers
  const trendPct = (current: number, prev: number) => {
    if (prev === 0) return current > 0 ? 100 : 0
    return Math.round(((current - prev) / prev) * 100)
  }
  const incomeTrend = trendPct(totalIncome, lastMonthIncome)
  const expenseTrend = trendPct(totalExpense, lastMonthExpense)
  const lastMonthBalance = lastMonthIncome - lastMonthExpense
  const balanceTrend = trendPct(netBalance, Math.abs(lastMonthBalance))

  const TrendBadge = ({ pct, inverse = false }: { pct: number; inverse?: boolean }) => {
    const positive = inverse ? pct <= 0 : pct >= 0
    if (pct === 0) return null
    return (
      <span className={`inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
        positive ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                 : "bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400"
      }`}>
        {pct > 0 ? "↑" : "↓"} {Math.abs(pct)}%
      </span>
    )
  }

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  const getAccountTypeIcon = (type: string) => {
    switch (type) {
      case "Bank":
        return "🏦"
      case "Cash":
        return "💵"
      case "Credit Card":
        return "💳"
      case "Savings":
        return "🐷"
      default:
        return "💼"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400 text-sm">Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto transition-colors duration-200">

      {/* Onboarding checklist banner — shown only when user has no data yet */}
      {!loading && transactions.length === 0 && accountsData.accounts.length === 0 && (
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/40 dark:to-blue-950/30 border border-indigo-200/60 dark:border-indigo-800/40 rounded-2xl p-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center shrink-0">
              <span className="text-lg">🚀</span>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-100 mb-1">Get started with SG-Finance</h3>
              <p className="text-xs text-indigo-700/70 dark:text-indigo-300/70 mb-3">Complete these steps to set up your financial workspace:</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { step: "1", label: "Add an account or wallet", done: accountsData.accounts.length > 0, action: () => setShowAccountModal(true) },
                  { step: "2", label: "Record your first transaction", done: transactions.length > 0, action: () => window.dispatchEvent(new CustomEvent("openQuickAdd")) },
                  { step: "3", label: "Set a monthly budget", done: false, action: () => window.location.href = "/home/budget" },
                ].map((item) => (
                  <button key={item.step} onClick={item.action}
                    className={`flex items-center gap-2.5 text-left px-3 py-2.5 rounded-xl border text-xs font-medium transition cursor-pointer ${
                      item.done
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-400"
                        : "bg-white dark:bg-gray-800/60 border-indigo-200/60 dark:border-indigo-700/40 text-gray-700 dark:text-gray-200 hover:border-indigo-400 dark:hover:border-indigo-500"
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                      item.done ? "bg-emerald-500 text-white" : "bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400"
                    }`}>
                      {item.done ? "✓" : item.step}
                    </span>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            {greeting()}, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Here is your overview for{" "}
            {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </p>
        </div>
        <button
          onClick={() => setShowAccountModal(true)}
          className="self-start sm:self-auto bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-medium px-3.5 py-2 rounded-lg transition shadow-sm flex items-center gap-1.5 cursor-pointer"
        >
          <span className="font-bold">+</span> Add Account / Wallet
        </button>
      </div>

      {/* Net Worth & Wallets Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-6">
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-xl p-4 shadow-sm">
          <p className="text-xs text-indigo-200 mb-1 font-medium">Total Net Worth</p>
          <p className="text-2xl font-bold">{format(accountsData.netWorth)}</p>
          <p className="text-xs text-indigo-200 mt-1">
            {accountsData.accounts.length} Accounts & Wallets
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base">🏦</span>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Bank & Savings</p>
          </div>
          <p className="text-xl font-bold text-gray-800 dark:text-white">{format(accountsData.bankBalance)}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base">💵</span>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Cash on Hand</p>
          </div>
          <p className="text-xl font-bold text-gray-800 dark:text-white">{format(accountsData.cashBalance)}</p>
        </div>
      </div>

      {/* Linked Accounts Carousel / List */}
      {accountsData.accounts.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              My Wallets & Accounts
            </h2>
            <button
              onClick={() => setShowAccountModal(true)}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
            >
              + Add New
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {accountsData.accounts.map((acc) => (
              <div
                key={acc.id}
                className="bg-white dark:bg-gray-800 rounded-xl p-3.5 border border-gray-100 dark:border-gray-700 shadow-sm relative group hover:border-gray-200 dark:hover:border-gray-600 transition"
              >
                <div className="flex items-start justify-between mb-1.5">
                  <span className="text-lg">{getAccountTypeIcon(acc.type)}</span>
                  <button
                    onClick={() => handleDeleteAccount(acc.id)}
                    className="text-gray-300 hover:text-red-500 text-xs opacity-0 group-hover:opacity-100 transition cursor-pointer"
                    title="Delete Account"
                  >
                    ✕
                  </button>
                </div>
                <h3 className="font-semibold text-gray-800 dark:text-white text-sm truncate">{acc.name}</h3>
                <span className="text-[11px] text-gray-400 capitalize">{acc.type}</span>
                <p
                  className={`text-sm font-bold mt-1 ${
                    acc.type === "Credit Card" ? "text-amber-500" : "text-gray-900 dark:text-gray-100"
                  }`}
                >
                  {format(acc.balance)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monthly Cash Flow Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm text-gray-500 dark:text-gray-400">Monthly Net Balance</h2>
            <TrendBadge pct={balanceTrend} />
          </div>
          <p className={`text-2xl font-bold mt-1 ${
            netBalance >= 0 ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"
          }`}>
            {format(netBalance)}
          </p>
          <p className="text-[11px] text-gray-400 mt-1">vs {format(lastMonthBalance)} last month</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm text-gray-500 dark:text-gray-400">Monthly Expenses</h2>
            <TrendBadge pct={expenseTrend} inverse />
          </div>
          <p className="text-2xl font-bold text-red-500 dark:text-red-400 mt-1">-{format(totalExpense)}</p>
          <p className="text-[11px] text-gray-400 mt-1">vs {format(lastMonthExpense)} last month</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm text-gray-500 dark:text-gray-400">Monthly Income</h2>
            <TrendBadge pct={incomeTrend} />
          </div>
          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">+{format(totalIncome)}</p>
          <p className="text-[11px] text-gray-400 mt-1">vs {format(lastMonthIncome)} last month</p>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5 border border-gray-100 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Recent Transactions</h2>

        {recentTransactions.length === 0 ? (
          <div className="py-10 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-3 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">No transactions this month</p>
            <p className="text-xs text-gray-400 mb-3">Your recent activity will appear here.</p>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("openQuickAdd"))}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              Add your first transaction →
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentTransactions.map((t) => (
              <div
                key={t.id}
                className="flex justify-between items-center text-sm border-b border-gray-100 dark:border-gray-700/60 pb-2.5 last:border-0"
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <span className="text-base shrink-0">{t.category?.icon || "📦"}</span>
                  <div className="min-w-0">
                    <p className="text-gray-800 dark:text-gray-200 font-medium text-sm truncate">
                      {t.description || t.category?.name}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                      {new Date(t.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                      {" · "}
                      {t.category?.name}
                    </p>
                  </div>
                </div>
                <span
                  className={`font-semibold shrink-0 text-sm ${
                    t.type === "income" ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"
                  }`}
                >
                  {t.type === "income" ? "+" : "-"}
                  {format(t.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Account / Wallet Modal */}
      {showAccountModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAccountModal(false)
            }
          }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-700/80 overflow-hidden transform transition-all my-auto max-h-[92dvh] flex flex-col">
            {/* Header */}
            <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-gray-100 dark:border-gray-700/60 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50 shrink-0">
              <div className="flex items-center gap-2 sm:gap-2.5">
                <span className="text-xl">💳</span>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">Add Account / Wallet</h2>
                  <p className="text-[11px] sm:text-xs text-gray-400 dark:text-gray-500">Track a new bank, cash, or card account</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="hidden sm:inline-block text-[10px] font-semibold px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                  ESC to close
                </kbd>
                <button
                  type="button"
                  onClick={() => setShowAccountModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg p-1.5 sm:p-1 rounded-lg transition cursor-pointer"
                  title="Close (Esc)"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateAccount} className="p-4 sm:p-6 space-y-3.5 sm:space-y-4 overflow-y-auto flex-1">
              {accountError && (
                <div className="p-3 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl">
                  {accountError}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Account / Wallet Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HDFC Bank, Cash Wallet, Credit Card"
                  value={accountForm.name}
                  onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                  <select
                    value={accountForm.type}
                    onChange={(e) => setAccountForm({ ...accountForm, type: e.target.value })}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Bank">🏦 Bank</option>
                    <option value="Cash">💵 Cash</option>
                    <option value="Savings">🐷 Savings</option>
                    <option value="Credit Card">💳 Credit Card</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Initial Balance
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={accountForm.balance}
                    onChange={(e) => setAccountForm({ ...accountForm, balance: e.target.value })}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-100 dark:border-gray-700/40">
                <button
                  type="button"
                  onClick={() => setShowAccountModal(false)}
                  className="flex-1 sm:flex-none px-4 py-2.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700/60 rounded-xl transition cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAccount}
                  className="flex-1 sm:flex-none px-5 py-2.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow transition disabled:opacity-50 cursor-pointer text-center"
                >
                  {submittingAccount ? "Saving..." : "Save Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
