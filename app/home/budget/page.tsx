"use client";

import { useEffect, useState } from "react";
import { useCurrency } from "@/context/CurrencyContext";

type Category = {
  id: string;
  name: string;
  color: string;
  icon: string;
};

type Budget = {
  id: string;
  limit: number;
  month: string;
  spent: number;
  remaining: number;
  percentage: number;
  category: Category;
};

export default function BudgetPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Budget | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7),
  );

  const [form, setForm] = useState({
    categoryId: "",
    limit: "",
    month: new Date().toISOString().slice(0, 7),
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const {format} = useCurrency();

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/budget?month=${selectedMonth}`);
      const data = await res.json();
      if (res.ok) setBudgets(data);
      else setError(data.error);
    } catch {
      setError("Failed to load budgets");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    const res = await fetch("/api/categories");
    const data = await res.json();
    if (res.ok) setCategories(data);
  };

  useEffect(() => {
    fetchBudgets();
    fetchCategories();
  }, [selectedMonth]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showModal) {
        setShowModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showModal]);

  const openAdd = () => {
    setEditTarget(null);
    setForm({ categoryId: "", limit: "", month: selectedMonth });
    setFormError("");
    setShowModal(true);
  };

  const openEdit = (budget: Budget) => {
    setEditTarget(budget);
    setForm({
      categoryId: budget.category.id,
      limit: budget.limit.toString(),
      month: budget.month,
    });
    setFormError("");
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      const isEdit = !!editTarget;
      const res = await fetch("/api/budget", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isEdit ? { id: editTarget.id, limit: form.limit } : form,
        ),
      });
      const data = await res.json();
      if (res.ok) {
        setShowModal(false);
        fetchBudgets();
      } else setFormError(data.error);
    } catch {
      setFormError("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/budget?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) setBudgets((prev) => prev.filter((b) => b.id !== id));
      else setError(data.error);
    } catch {
      setError("Failed to delete budget");
    } finally {
      setDeleteId(null);
    }
  };

  const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const overBudgetCount = budgets.filter((b) => b.spent > b.limit).length;

  const getBarColor = (percentage: number) => {
    if (percentage >= 100) return "bg-red-500";
    if (percentage >= 75) return "bg-amber-400";
    return "bg-indigo-500";
  };

  const getStatusBadge = (budget: Budget) => {
    if (budget.spent > budget.limit)
      return (
        <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-medium">
          Over budget
        </span>
      );
    if (budget.percentage >= 75)
      return (
        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-600 font-medium">
          Near limit
        </span>
      );
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-600 font-medium">
        On track
      </span>
    );
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Budget
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Track your spending limits by category
          </p>
        </div>

        {/* Month picker + Add button */}
        <div className="flex items-center gap-2">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="flex-1 sm:flex-none border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-lg px-3 py-2 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={openAdd}
            className="flex items-center justify-center gap-1 bg-indigo-600 cursor-pointer hover:bg-indigo-700 text-white text-xs sm:text-sm font-medium px-3.5 py-2 rounded-lg transition shadow-sm whitespace-nowrap"
          >
            <span className="text-base leading-none font-bold">+</span>
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-5">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-[11px] sm:text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-1 font-medium">Total Budget</p>
          <p className="text-sm sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white truncate">
            {format(totalBudget)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-[11px] sm:text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-1 font-medium">Total Spent</p>
          <p className="text-sm sm:text-lg md:text-xl font-bold text-indigo-600 dark:text-indigo-400 truncate">
            {format(totalSpent)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-[11px] sm:text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-1 font-medium">Over Budget</p>
          <p
            className={`text-sm sm:text-lg md:text-xl font-bold truncate ${overBudgetCount > 0 ? "text-red-500 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}
          >
            {overBudgetCount}{" "}
            <span className="hidden sm:inline text-xs font-normal">
              {overBudgetCount === 1 ? "category" : "categories"}
            </span>
          </p>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-800 rounded-lg px-4 py-2 mb-4">
          {error}
        </p>
      )}

      {/* Budget List */}
      {loading ? (
        <p className="text-sm text-gray-400 text-center py-10">Loading...</p>
      ) : budgets.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-8 text-center">
          <p className="text-gray-400 text-sm">
            No budgets set for this month.
          </p>
          <button
            onClick={openAdd}
            className="mt-3 text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:underline"
          >
            Add your first budget →
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {budgets.map((budget) => (
            <div
              key={budget.id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-xs p-3.5 sm:p-4 md:p-5"
            >
              {/* Top section */}
              <div className="flex items-start justify-between mb-3 gap-2">
                {/* Left: icon + name + badge */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0"
                    style={{ backgroundColor: budget.category.color + "22" }}
                  >
                    {budget.category.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                      {budget.category.name}
                    </p>
                    <div className="mt-0.5">{getStatusBadge(budget)}</div>
                  </div>
                </div>

                {/* Right: amounts + actions */}
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  {/* Spent / limit */}
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-100 text-right">
                    {format(budget.spent)}
                    <span className="text-gray-400 dark:text-gray-500 font-normal text-xs sm:text-sm">
                      {" "}
                      / {format(budget.limit)}
                    </span>
                  </p>

                  {/* Remaining */}
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {budget.remaining >= 0
                      ? `${format(budget.remaining)} left`
                      : `${format(Math.abs(budget.remaining))} over`}
                  </p>

                  {/* Edit / Delete */}
                  <div className="flex gap-2 mt-0.5">
                    <button
                      onClick={() => openEdit(budget)}
                      className="text-xs text-indigo-500 hover:underline"
                    >
                      Edit
                    </button>
                    {deleteId === budget.id ? (
                      <span className="flex gap-1">
                        <button
                          onClick={() => handleDelete(budget.id)}
                          className="text-xs text-red-500 hover:underline"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteId(null)}
                          className="text-xs text-gray-400 hover:underline"
                        >
                          Cancel
                        </button>
                      </span>
                    ) : (
                      <button
                        onClick={() => setDeleteId(budget.id)}
                        className="text-xs text-gray-400 hover:text-red-500 transition"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${getBarColor(budget.percentage)}`}
                  style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5 text-right font-medium">
                {budget.percentage.toFixed(0)}% used
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowModal(false);
            }
          }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-700/80 overflow-hidden transform transition-all my-auto max-h-[92dvh] flex flex-col">
            {/* Header */}
            <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-gray-100 dark:border-gray-700/60 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50 shrink-0">
              <div className="flex items-center gap-2 sm:gap-2.5">
                <span className="text-xl">🎯</span>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                    {editTarget ? "Edit Budget" : "Add Budget"}
                  </h2>
                  <p className="text-[11px] sm:text-xs text-gray-400 dark:text-gray-500">
                    Set a monthly spending limit
                  </p>
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
              {formError && (
                <div className="p-3 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category *
                </label>
                <select
                  value={form.categoryId}
                  onChange={(e) =>
                    setForm({ ...form, categoryId: e.target.value })
                  }
                  disabled={!!editTarget}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Month *
                  </label>
                  <input
                    type="month"
                    value={form.month}
                    onChange={(e) =>
                      setForm({ ...form, month: e.target.value })
                    }
                    disabled={!!editTarget}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Spending Limit ({format(0).replace(/[0-9.,\s]/g, "") || "₹"}) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={form.limit}
                    onChange={(e) =>
                      setForm({ ...form, limit: e.target.value })
                    }
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. 500"
                    required
                  />
                </div>
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
                  className="flex-1 sm:flex-none px-5 py-2.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow transition disabled:opacity-60 cursor-pointer text-center"
                >
                  {submitting ? "Saving..." : editTarget ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
