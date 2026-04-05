"use client";

import { useEffect, useState } from "react";

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
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-3 mb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-800">
            Budget
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Track your spending limits by category
          </p>
        </div>

        {/* Month picker + Add button */}
        <div className="flex items-center gap-2">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="flex-1 md:flex-none border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button
            onClick={openAdd}
            className="bg-indigo-600 cursor-pointer hover:bg-indigo-700 text-white text-sm font-medium px-3 md:px-4 py-2 rounded-lg transition whitespace-nowrap"
          >
            + Add
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-2 md:gap-4 mb-6">
        <div className="bg-white rounded-xl p-3 md:p-4 shadow-sm border border-gray-100">
          <p className="text-xs md:text-sm text-gray-500 mb-1">Total Budget</p>
          <p className="text-base md:text-xl font-semibold text-gray-800">
            ${totalBudget.toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-3 md:p-4 shadow-sm border border-gray-100">
          <p className="text-xs md:text-sm text-gray-500 mb-1">Total Spent</p>
          <p className="text-base md:text-xl font-semibold text-indigo-600">
            ${totalSpent.toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-3 md:p-4 shadow-sm border border-gray-100">
          <p className="text-xs md:text-sm text-gray-500 mb-1">Over Budget</p>
          <p
            className={`text-base md:text-xl font-semibold ${overBudgetCount > 0 ? "text-red-500" : "text-green-600"}`}
          >
            {overBudgetCount}{" "}
            <span className="hidden md:inline">
              {overBudgetCount === 1 ? "category" : "categories"}
            </span>
          </p>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-4 py-2 mb-4">
          {error}
        </p>
      )}

      {/* Budget List */}
      {loading ? (
        <p className="text-sm text-gray-400 text-center py-10">Loading...</p>
      ) : budgets.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-10 text-center">
          <p className="text-gray-400 text-sm">
            No budgets set for this month.
          </p>
          <button
            onClick={openAdd}
            className="mt-3 text-indigo-600 text-sm font-medium hover:underline"
          >
            Add your first budget →
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {budgets.map((budget) => (
            <div
              key={budget.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 md:p-5"
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
                    <p className="text-sm font-medium text-gray-700 truncate">
                      {budget.category.name}
                    </p>
                    <div className="mt-0.5">{getStatusBadge(budget)}</div>
                  </div>
                </div>

                {/* Right: amounts + actions */}
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  {/* Spent / limit */}
                  <p className="text-sm font-semibold text-gray-800 text-right">
                    ${budget.spent.toFixed(2)}
                    <span className="text-gray-400 font-normal">
                      {" "}
                      / ${budget.limit.toFixed(2)}
                    </span>
                  </p>

                  {/* Remaining */}
                  <p className="text-xs text-gray-400">
                    {budget.remaining >= 0
                      ? `$${budget.remaining.toFixed(2)} left`
                      : `$${Math.abs(budget.remaining).toFixed(2)} over`}
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
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${getBarColor(budget.percentage)}`}
                  style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1.5 text-right">
                {budget.percentage.toFixed(0)}% used
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Modal — bottom sheet on mobile, centered on desktop */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-end md:items-center justify-center z-50">
          <div className="bg-white rounded-t-2xl md:rounded-2xl shadow-xl w-full md:max-w-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              {editTarget ? "Edit Budget" : "Add Budget"}
            </h2>

            {formError && (
              <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-4 py-2 mb-3">
                {formError}
              </p>
            )}

            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-4 text-gray-600"
            >
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-black">
                  Category
                </label>
                <select
                  value={form.categoryId}
                  onChange={(e) =>
                    setForm({ ...form, categoryId: e.target.value })
                  }
                  disabled={!!editTarget}
                  className="w-full border border-gray-400 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400 disabled:bg-gray-50 disabled:text-gray-400"
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

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex flex-col gap-1 flex-1">
                  <label className="text-sm font-medium text-black">
                    Month
                  </label>
                  <input
                    type="month"
                    value={form.month}
                    onChange={(e) =>
                      setForm({ ...form, month: e.target.value })
                    }
                    disabled={!!editTarget}
                    className="w-full border border-gray-400 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400 disabled:bg-gray-50 disabled:text-gray-400"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1 flex-1">
                  <label className="text-sm font-medium text-black">
                    Spending Limit ($)
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={form.limit}
                    onChange={(e) =>
                      setForm({ ...form, limit: e.target.value })
                    }
                    className="w-full border border-gray-400 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
                    placeholder="e.g. 500"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-1">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-full sm:flex-1 border border-gray-200 text-gray-600 rounded-lg py-2.5 text-sm hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2.5 text-sm font-medium transition disabled:opacity-60"
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
