"use client"

import React, { useEffect, useRef, useState } from "react"
import { useCurrency } from "@/context/CurrencyContext"

interface Category {
  id: string
  name: string
  icon?: string
}

interface Account {
  id: string
  name: string
  type: string
  balance: number
}

export default function QuickAddModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [successMsg, setSuccessMsg] = useState("")

  const { currency } = useCurrency()

  // Form State
  const [type, setType] = useState<"expense" | "income">("expense")
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [accountId, setAccountId] = useState("")
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))

  const amountInputRef = useRef<HTMLInputElement>(null)

  // 1. Global Keyboard Listener (Ctrl+K / Cmd+K / Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle modal on Ctrl + K or Cmd + K
      if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      } else if (e.key === "Escape" && isOpen) {
        setIsOpen(false)
      }
    }

    const handleCustomOpen = () => setIsOpen(true)

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("openQuickAdd", handleCustomOpen)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("openQuickAdd", handleCustomOpen)
    }
  }, [isOpen])

  // 2. Load Categories & Accounts when modal opens & autofocus
  useEffect(() => {
    if (!isOpen) {
      setError("")
      setSuccessMsg("")
      return
    }

    // Auto-focus amount field
    setTimeout(() => {
      amountInputRef.current?.focus()
    }, 50)

    const fetchData = async () => {
      setLoading(true)
      try {
        const [catRes, accRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/accounts"),
        ])

        if (catRes.ok) {
          const catData = await catRes.json()
          const catList = Array.isArray(catData) ? catData : catData.categories || []
          setCategories(catList)
          if (catList.length > 0 && !categoryId) {
            setCategoryId(catList[0].id)
          }
        }

        if (accRes.ok) {
          const accData = await accRes.json()
          const accList = Array.isArray(accData) ? accData : accData.accounts || []
          setAccounts(accList)
        }
      } catch (err) {
        console.error("Failed to load categories/accounts for Quick Add:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [isOpen])

  // 3. Handle Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccessMsg("")

    const parsedAmount = parseFloat(amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Please enter a positive amount")
      return
    }

    if (!categoryId) {
      setError("Please select a category")
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parsedAmount,
          type,
          description: description.trim(),
          date: new Date(date).toISOString(),
          categoryId,
          accountId: accountId || null,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to add transaction")
        return
      }

      // Success!
      setSuccessMsg("Transaction added successfully!")
      window.dispatchEvent(new CustomEvent("transactionAdded", { detail: data }))

      // Reset form
      setAmount("")
      setDescription("")

      // Close modal shortly
      setTimeout(() => {
        setIsOpen(false)
        setSuccessMsg("")
      }, 500)
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred")
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsOpen(false)
      }}
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl border border-gray-100 dark:border-gray-700/80 overflow-hidden transform transition-all my-auto max-h-[92dvh] flex flex-col">
        
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-gray-100 dark:border-gray-700/60 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50 shrink-0">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <span className="text-xl">⚡</span>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">Quick Add Transaction</h2>
              <p className="text-[11px] sm:text-xs text-gray-400 dark:text-gray-500">Record an expense or income instantly</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <kbd className="hidden sm:inline-block text-[10px] font-semibold px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
              ESC to close
            </kbd>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg p-1.5 sm:p-1 rounded-lg transition cursor-pointer"
              title="Close (Esc)"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3.5 sm:space-y-4 overflow-y-auto flex-1">
          
          {/* Feedback alerts */}
          {error && (
            <div className="p-3 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="p-3 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900/60 rounded-xl">
              {successMsg}
            </div>
          )}

          {/* Type Toggle: Expense vs Income */}
          <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setType("expense")}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                type === "expense"
                  ? "bg-red-500 text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Expense 💸
            </button>
            <button
              type="button"
              onClick={() => setType("income")}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                type === "income"
                  ? "bg-green-600 text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Income 💰
            </button>
          </div>

          {/* Amount and Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Amount ({currency.symbol}) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-sm font-semibold text-gray-400">
                  {currency.symbol}
                </span>
                <input
                  ref={amountInputRef}
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-8 pr-3 py-2.5 text-sm font-semibold border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description <span className="text-gray-400 dark:text-gray-500 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Grocery store, Uber ride (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category and Account selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.length === 0 ? (
                  <option value="">{loading ? "Loading..." : "General"}</option>
                ) : (
                  categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon || "📦"} {c.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Wallet / Account (Optional)
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Default / Unspecified</option>
                {(Array.isArray(accounts) ? accounts : []).map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.type === "Bank" ? "🏦" : acc.type === "Cash" ? "💵" : "💳"} {acc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 sm:pt-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-2 shrink-0 border-t border-gray-100 dark:border-gray-700/40">
            <span className="hidden sm:inline-block text-[11px] text-gray-400 dark:text-gray-500">
              Tip: Press <kbd className="font-semibold text-gray-600 dark:text-gray-300">Enter</kbd> to save
            </span>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex-1 sm:flex-none px-4 py-2.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 sm:flex-none px-5 py-2.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer text-center"
              >
                {submitting ? "Adding..." : "Add Transaction"}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  )
}
