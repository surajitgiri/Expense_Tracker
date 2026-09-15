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
          <h2 className="text-sm text-gray-500 dark:text-gray-400">Monthly Net Balance</h2>
          <p
            className={`text-2xl font-bold mt-2 ${
              netBalance >= 0 ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"
            }`}
          >
            {format(netBalance)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-sm text-gray-500 dark:text-gray-400">Monthly Expenses</h2>
          <p className="text-2xl font-bold text-red-500 dark:text-red-400 mt-2">-{format(totalExpense)}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-sm text-gray-500 dark:text-gray-400">Monthly Income</h2>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">+{format(totalIncome)}</p>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5 border border-gray-100 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Recent Transactions</h2>

        {recentTransactions.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">No transactions this month</p>
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