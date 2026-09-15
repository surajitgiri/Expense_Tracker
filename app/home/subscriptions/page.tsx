"use client"

import React, { useEffect, useState } from "react"
import { useCurrency } from "@/context/CurrencyContext"

type Category = {
    id: string
    name: string
    color: string
    icon: string
}

type Subscription = {
    id: string
    name: string
    amount: number
    frequency: "weekly" | "monthly" | "yearly"
    startDate: string
    nextDueDate: string
    isActive: boolean
    categoryId: string
    category: Category
}

export default function SubscriptionsPage() {
    const { format } = useCurrency()
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState("")

    const [form, setForm] = useState({
        name: "",
        amount: "",
        frequency: "monthly",
        categoryId: "",
        startDate: new Date().toISOString().split("T")[0],
    })

    const fetchSubscriptions = async () => {
        try {
            const res = await fetch("/api/subscriptions")
            const data = await res.json()
            if (res.ok) setSubscriptions(data)
        } catch {
            setError("Failed to load subscriptions")
        } finally {
            setLoading(false)
        }
    }

    const fetchCategories = async () => {
        try {
            const res = await fetch("/api/categories")
            const data = await res.json()
            if (res.ok) setCategories(data)
        } catch {
            console.error("Failed to load categories")
        }
    }

    useEffect(() => {
        fetchSubscriptions()
        fetchCategories()
    }, [])

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && showModal) {
                setShowModal(false)
            }
        }
        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [showModal])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        setError("")

        try {
            const res = await fetch("/api/subscriptions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            })
            const data = await res.json()

            if (res.ok) {
                setSubscriptions((prev) => [...prev, data])
                setShowModal(false)
                setForm({
                    name: "",
                    amount: "",
                    frequency: "monthly",
                    categoryId: categories[0]?.id || "",
                    startDate: new Date().toISOString().split("T")[0],
                })
            } else {
                setError(data.error || "Failed to create subscription")
            }
        } catch {
            setError("Something went wrong")
        } finally {
            setSubmitting(false)
        }
    }

    const toggleActive = async (id: string, currentStatus: boolean) => {
        try {
            const res = await fetch(`/api/subscriptions/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !currentStatus }),
            })
            const data = await res.json()
            if (res.ok) {
                setSubscriptions((prev) => prev.map((s) => (s.id === id ? data : s)))
            }
        } catch {
            alert("Failed to update status")
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this subscription?")) return

        try {
            const res = await fetch(`/api/subscriptions/${id}`, { method: "DELETE" })
            if (res.ok) {
                setSubscriptions((prev) => prev.filter((s) => s.id !== id))
            }
        } catch {
            alert("Failed to delete subscription")
        }
    }

    // Monthly commitment calculation
    const monthlyTotal = subscriptions
        .filter((s) => s.isActive)
        .reduce((sum, s) => {
            if (s.frequency === "yearly") return sum + s.amount / 12
            if (s.frequency === "weekly") return sum + s.amount * 4.33
            return sum + s.amount
        }, 0)

    return (
        <div className="space-y-5 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                        Subscriptions & Recurring Bills
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        Auto-logs expenses on their due date
                    </p>
                </div>
                <button
                    onClick={() => {
                        if (categories.length > 0 && !form.categoryId) {
                            setForm((prev) => ({ ...prev, categoryId: categories[0].id }))
                        }
                        setShowModal(true)
                    }}
                    className="self-start sm:self-auto flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-medium px-3.5 py-2 rounded-lg transition shadow-sm cursor-pointer whitespace-nowrap"
                >
                    <span className="font-bold text-base leading-none">+</span>
                    <span>Add Subscription</span>
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-5">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                    <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">Est. Monthly Cost</p>
                    <p className="text-sm sm:text-lg md:text-xl font-bold text-indigo-600 dark:text-indigo-400 truncate">{format(monthlyTotal)}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                    <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">Active Bills</p>
                    <p className="text-sm sm:text-lg md:text-xl font-bold text-gray-800 dark:text-white truncate">
                        {subscriptions.filter((s) => s.isActive).length}
                    </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                    <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">Total Tracked</p>
                    <p className="text-sm sm:text-lg md:text-xl font-bold text-gray-800 dark:text-white truncate">{subscriptions.length}</p>
                </div>
            </div>

            {/* Subscriptions Grid */}
            {loading ? (
                <div className="text-center py-12 text-gray-400">Loading subscriptions...</div>
            ) : subscriptions.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-8 sm:p-12 text-center border border-gray-100 dark:border-gray-700">
                    <p className="text-3xl mb-2">📅</p>
                    <h3 className="font-semibold text-gray-800 dark:text-white">No recurring subscriptions yet</h3>
                    <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 mt-1 mb-4">
                        Track Netflix, rent, gym, or utility bills to automate recurring entries.
                    </p>
                    <button
                        onClick={() => setShowModal(true)}
                        className="text-xs sm:text-sm bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-lg font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition cursor-pointer"
                    >
                        Add Your First Subscription
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
                    {subscriptions.map((sub) => {
                        const dueDate = new Date(sub.nextDueDate)
                        const daysLeft = Math.ceil(
                            (dueDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24)
                        )

                        return (
                            <div
                                key={sub.id}
                                className={`rounded-xl p-4 sm:p-5 border transition shadow-xs ${sub.isActive
                                        ? "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700"
                                        : "bg-gray-50/60 dark:bg-gray-800/60 border-gray-200 dark:border-gray-800 opacity-60"
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <span
                                            className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0"
                                            style={{ backgroundColor: `${sub.category?.color || "#6366f1"}20` }}
                                        >
                                            {sub.category?.icon || "📦"}
                                        </span>
                                        <div className="min-w-0">
                                            <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm sm:text-base truncate">{sub.name}</h3>
                                            <span className="text-xs text-gray-400 dark:text-gray-500 capitalize truncate block">
                                                {sub.category?.name} • {sub.frequency}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">{format(sub.amount)}</p>
                                        <span
                                            className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${sub.isActive
                                                    ? "bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-300"
                                                    : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                                                }`}
                                        >
                                            {sub.isActive ? "Active" : "Paused"}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                    <div className="truncate pr-2">
                                        <span>Next: </span>
                                        <strong className="text-gray-700 dark:text-gray-200 font-medium">
                                            {dueDate.toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                            })}
                                        </strong>
                                        {sub.isActive && (
                                            <span className="ml-1 text-indigo-600 dark:text-indigo-400 font-medium">
                                                ({daysLeft <= 0 ? "Today" : `${daysLeft}d`})
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <button
                                            onClick={() => toggleActive(sub.id, sub.isActive)}
                                            className="text-xs text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium cursor-pointer"
                                        >
                                            {sub.isActive ? "Pause" : "Resume"}
                                        </button>
                                        <span>•</span>
                                        <button
                                            onClick={() => handleDelete(sub.id)}
                                            className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 font-medium cursor-pointer"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Add Subscription Modal */}
            {showModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setShowModal(false)
                        }
                    }}
                >
                    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-700/80 overflow-hidden transform transition-all my-auto max-h-[92dvh] flex flex-col">
                        {/* Header */}
                        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-gray-100 dark:border-gray-700/60 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50 shrink-0">
                            <div className="flex items-center gap-2 sm:gap-2.5">
                                <span className="text-xl">🔁</span>
                                <div>
                                    <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">Add Subscription</h2>
                                    <p className="text-[11px] sm:text-xs text-gray-400 dark:text-gray-500">Track recurring bills & subscriptions</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <kbd className="hidden sm:inline-block text-[10px] font-semibold px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                    ESC to close
                                </kbd>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg p-1.5 sm:p-1 rounded-lg transition cursor-pointer"
                                    title="Close (Esc)"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3.5 sm:space-y-4 overflow-y-auto flex-1">
                            {error && (
                                <div className="p-3 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Netflix, Rent, Gym"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Amount ({format(0).replace(/[0-9.,\s]/g, "") || "₹"}) *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        placeholder="0.00"
                                        value={form.amount}
                                        onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                        className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Frequency
                                    </label>
                                    <select
                                        value={form.frequency}
                                        onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                                        className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="weekly">Weekly</option>
                                        <option value="monthly">Monthly</option>
                                        <option value="yearly">Yearly</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Category
                                </label>
                                <select
                                    required
                                    value={form.categoryId}
                                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                                    className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.icon} {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Start / First Due Date *
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={form.startDate}
                                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                                    className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-100 dark:border-gray-700/40">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 sm:flex-none px-4 py-2.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700/60 rounded-xl transition cursor-pointer text-center"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 sm:flex-none px-5 py-2.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow transition disabled:opacity-50 cursor-pointer text-center"
                                >
                                    {submitting ? "Saving..." : "Save Subscription"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
