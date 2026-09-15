"use client"

import React, { useEffect, useState } from "react"
import { useCurrency } from "@/context/CurrencyContext"

type Goal = {
    id: string
    name: string
    targetAmount: number
    currentAmount: number
    targetDate: string
    color: string
    icon: string
}

export default function GoalsPage() {
    const { format } = useCurrency()
    const [goals, setGoals] = useState<Goal[]>([])
    const [loading, setLoading] = useState(true)
    const [showAddModal, setShowAddModal] = useState(false)
    const [depositModal, setDepositModal] = useState<{ id: string; name: string } | null>(null)
    const [depositAmount, setDepositAmount] = useState("")
    const [depositType, setDepositType] = useState<"deposit" | "withdraw">("deposit")

    const [form, setForm] = useState({
        name: "",
        targetAmount: "",
        currentAmount: "",
        targetDate: "",
        color: "#10B981",
        icon: "🎯",
    })

    const fetchGoals = async () => {
        try {
            const res = await fetch("/api/goals")
            const data = await res.json()
            if (res.ok) setGoals(data)
        } catch {
            console.error("Failed to load goals")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchGoals()
    }, [])

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                if (showAddModal) setShowAddModal(false)
                if (depositModal) {
                    setDepositModal(null)
                    setDepositAmount("")
                }
            }
        }
        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [showAddModal, depositModal])

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const res = await fetch("/api/goals", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            })
            const data = await res.json()
            if (res.ok) {
                setGoals((prev) => [...prev, data])
                setShowAddModal(false)
                setForm({
                    name: "",
                    targetAmount: "",
                    currentAmount: "",
                    targetDate: "",
                    color: "#10B981",
                    icon: "🎯",
                })
            }
        } catch {
            alert("Failed to create goal")
        }
    }

    const handleDeposit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!depositModal) return

        try {
            const res = await fetch(`/api/goals/${depositModal.id}/deposit`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: depositAmount, type: depositType }),
            })
            const data = await res.json()
            if (res.ok) {
                setGoals((prev) => prev.map((g) => (g.id === depositModal.id ? data : g)))
                setDepositModal(null)
                setDepositAmount("")
            }
        } catch {
            alert("Failed to update goal amount")
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this goal?")) return
        try {
            const res = await fetch(`/api/goals/${id}`, { method: "DELETE" })
            if (res.ok) setGoals((prev) => prev.filter((g) => g.id !== id))
        } catch {
            alert("Failed to delete goal")
        }
    }

    const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0)
    const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0)
    const overallProgress = totalTarget > 0 ? Math.min((totalSaved / totalTarget) * 100, 100) : 0

    return (
        <div className="space-y-5 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Savings Goals</h1>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        Set milestones and track progress toward your dreams
                    </p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="self-start sm:self-auto flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-medium px-3.5 py-2 rounded-lg transition shadow-sm cursor-pointer"
                >
                    <span className="font-bold text-base leading-none">+</span>
                    <span>New Goal</span>
                </button>
            </div>

            {/* Overview Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
                <div className="flex items-center justify-between gap-3 mb-2.5">
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Total Saved Across Goals</p>
                        <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-0.5">
                            {format(totalSaved)}{" "}
                            <span className="text-xs sm:text-sm font-normal text-gray-400 dark:text-gray-500">/ {format(totalTarget)}</span>
                        </p>
                    </div>
                    <span className="text-base sm:text-lg font-bold text-indigo-600 dark:text-indigo-400">
                        {overallProgress.toFixed(1)}%
                    </span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 sm:h-3 overflow-hidden">
                    <div
                        className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${overallProgress}%` }}
                    />
                </div>
            </div>

            {/* Goals Grid */}
            {loading ? (
                <div className="text-center py-12 text-gray-400">Loading goals...</div>
            ) : goals.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-8 sm:p-12 text-center border border-gray-100 dark:border-gray-700">
                    <p className="text-3xl mb-2">🎯</p>
                    <h3 className="font-semibold text-gray-800 dark:text-white">No savings goals yet</h3>
                    <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 mt-1 mb-4">
                        Create a goal like "Emergency Fund", "New Car", or "Vacation".
                    </p>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="text-xs sm:text-sm bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-lg font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition cursor-pointer"
                    >
                        Create Your First Goal
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
                    {goals.map((goal) => {
                        const percentage = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
                        const remaining = Math.max(0, goal.targetAmount - goal.currentAmount)
                        const daysLeft = Math.ceil(
                            (new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)
                        )
                        const dailyTarget = daysLeft > 0 ? remaining / daysLeft : remaining

                        return (
                            <div
                                key={goal.id}
                                className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 shadow-xs border border-gray-100 dark:border-gray-700 flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <span
                                                className="w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0"
                                                style={{ backgroundColor: `${goal.color}20` }}
                                            >
                                                {goal.icon}
                                            </span>
                                            <div className="min-w-0">
                                                <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm sm:text-base truncate">{goal.name}</h3>
                                                <p className="text-xs text-gray-400 dark:text-gray-500">
                                                    Target: {new Date(goal.targetDate).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(goal.id)}
                                            className="text-gray-400 hover:text-red-500 text-xs p-1.5 cursor-pointer"
                                            title="Delete Goal"
                                        >
                                            ✕
                                        </button>
                                    </div>

                                    <div className="flex justify-between items-baseline mb-1.5">
                                        <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                                            {format(goal.currentAmount)}
                                        </span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            Goal: {format(goal.targetAmount)}
                                        </span>
                                    </div>

                                    {/* Progress bar */}
                                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden mb-2">
                                        <div
                                            className="h-2.5 rounded-full transition-all duration-500"
                                            style={{
                                                width: `${percentage}%`,
                                                backgroundColor: goal.color,
                                            }}
                                        />
                                    </div>

                                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                                        <span>{percentage.toFixed(0)}% reached</span>
                                        <span>{remaining > 0 ? `${format(remaining)} left` : "🎉 Completed!"}</span>
                                    </div>
                                </div>

                                {/* Footer info & action */}
                                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between text-xs">
                                    <div className="text-gray-500 dark:text-gray-400">
                                        {remaining > 0 && daysLeft > 0 && (
                                            <span>Save <strong className="text-gray-800 dark:text-gray-200">{format(dailyTarget)}</strong>/day</span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => setDepositModal({ id: goal.id, name: goal.name })}
                                        className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium px-3 py-1.5 rounded-lg transition cursor-pointer"
                                    >
                                        + Add / Withdraw
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Add Goal Modal */}
            {/* Add Goal Modal */}
            {/* Add Goal Modal */}
            {showAddModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setShowAddModal(false)
                        }
                    }}
                >
                    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-700/80 overflow-hidden transform transition-all my-auto max-h-[92dvh] flex flex-col">
                        {/* Header */}
                        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-gray-100 dark:border-gray-700/60 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50 shrink-0">
                            <div className="flex items-center gap-2 sm:gap-2.5">
                                <span className="text-xl">🎯</span>
                                <div>
                                    <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">Create Savings Goal</h2>
                                    <p className="text-[11px] sm:text-xs text-gray-400 dark:text-gray-500">Plan and track your next milestone</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <kbd className="hidden sm:inline-block text-[10px] font-semibold px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                    ESC to close
                                </kbd>
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg p-1.5 sm:p-1 rounded-lg transition cursor-pointer"
                                    title="Close (Esc)"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleCreate} className="p-4 sm:p-6 space-y-3.5 sm:space-y-4 overflow-y-auto flex-1">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Goal Name *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Emergency Fund, Vacation"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Target Amount *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        placeholder="5000"
                                        value={form.targetAmount}
                                        onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
                                        className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Current Amount
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={form.currentAmount}
                                        onChange={(e) => setForm({ ...form, currentAmount: e.target.value })}
                                        className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Target Date *</label>
                                <input
                                    type="date"
                                    required
                                    value={form.targetDate}
                                    onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
                                    className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Icon</label>
                                    <input
                                        type="text"
                                        value={form.icon}
                                        onChange={(e) => setForm({ ...form, icon: e.target.value })}
                                        className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl text-gray-900 dark:text-white text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Theme Color</label>
                                    <div className="flex items-center h-[42px]">
                                        <input
                                            type="color"
                                            value={form.color}
                                            onChange={(e) => setForm({ ...form, color: e.target.value })}
                                            className="w-full h-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl p-1 cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-100 dark:border-gray-700/40">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 sm:flex-none px-4 py-2.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700/60 rounded-xl transition cursor-pointer text-center"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 sm:flex-none px-5 py-2.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow transition cursor-pointer text-center"
                                >
                                    Create Goal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Deposit / Withdraw Modal */}
            {depositModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setDepositModal(null)
                            setDepositAmount("")
                        }
                    }}
                >
                    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm shadow-2xl border border-gray-100 dark:border-gray-700/80 overflow-hidden transform transition-all my-auto max-h-[92dvh] flex flex-col">
                        {/* Header */}
                        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-gray-100 dark:border-gray-700/60 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50 shrink-0">
                            <div className="flex items-center gap-2 sm:gap-2.5">
                                <span className="text-xl">💰</span>
                                <div>
                                    <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                                        {depositModal.name}
                                    </h2>
                                    <p className="text-[11px] sm:text-xs text-gray-400 dark:text-gray-500">Adjust saved amount</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <kbd className="hidden sm:inline-block text-[10px] font-semibold px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                    ESC
                                </kbd>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setDepositModal(null)
                                        setDepositAmount("")
                                    }}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg p-1.5 sm:p-1 rounded-lg transition cursor-pointer"
                                    title="Close (Esc)"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleDeposit} className="p-4 sm:p-6 space-y-3.5 sm:space-y-4 overflow-y-auto flex-1">
                            <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-xl">
                                <button
                                    type="button"
                                    onClick={() => setDepositType("deposit")}
                                    className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                                        depositType === "deposit"
                                            ? "bg-green-600 text-white shadow-sm"
                                            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                    }`}
                                >
                                    + Deposit
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setDepositType("withdraw")}
                                    className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                                        depositType === "withdraw"
                                            ? "bg-red-500 text-white shadow-sm"
                                            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                    }`}
                                >
                                    - Withdraw
                                </button>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Amount *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    placeholder="0.00"
                                    value={depositAmount}
                                    onChange={(e) => setDepositAmount(e.target.value)}
                                    className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-100 dark:border-gray-700/40">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setDepositModal(null)
                                        setDepositAmount("")
                                    }}
                                    className="flex-1 sm:flex-none px-4 py-2.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700/60 rounded-xl transition cursor-pointer text-center"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 sm:flex-none px-5 py-2.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow transition cursor-pointer text-center"
                                >
                                    Confirm
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
