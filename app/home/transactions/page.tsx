"use client"

import React, { useEffect, useState } from "react"
import jsPDF from "jspdf"
import autoTable from  "jspdf-autotable"

type Category = {
  id: string
  name: string
  color: string
}

type Transaction = {
  id: string
  amount: number
  type: "income" | "expense"
  description: string
  date: string
  category: Category
}

export default function TransactionPage() {

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [filterType, setFilterType] = useState("")
  const [filterMonth, setFilterMonth] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState("")

  const [form, setForm] = useState({
    amount: "",
    type: "expense",
    description: "",
    date: new Date().toISOString().split("T")[0],
    categoryId: ""
  })

  const fetchTransactions = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterType) params.append("type", filterType)
      if (filterMonth) params.append("month", filterMonth)
      const res = await fetch(`/api/transactions?${params.toString()}`)
      const data = await res.json()
      if (res.ok) setTransactions(data)
      else setError(data.error)
    } catch {
      setError("Failed to load transactions")
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    const res = await fetch("/api/categories")
    const data = await res.json()
    if (res.ok) setCategories(data)
  }

  useEffect(() => {
    fetchTransactions()
    fetchCategories()
  }, [filterMonth, filterType])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError("")
    setSubmitting(true)
    try {
      const res = await fetch("/api/transactions", {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, id: editId }),
      })
      const data = await res.json()
      if (res.ok) {
        if (editId) {
          setTransactions((prev) => prev.map((t) => (t.id === editId ? data : t)))
        } else {
          setTransactions((prev) => [data, ...prev])
        }
        setShowModal(false)
        setEditId(null)
        setForm({
          amount: "", type: "expense", description: "",
          date: new Date().toISOString().split("T")[0], categoryId: ""
        })
      } else {
        setFormError(data.error)
      }
    } catch {
      setFormError("Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/transactions?id=${id}`, { method: "DELETE" })
      if (res.ok) setTransactions((prev) => prev.filter((t) => t.id !== id))
    } catch {
      setError("Failed to delete")
    } finally {
      setDeleteId(null)
    }
  }

  const handleDownloadPDF = () => {
  const doc = new jsPDF()

  // Title
  doc.setFontSize(18)
  doc.setTextColor(40, 40, 40)
  doc.text("Transaction Report", 14, 20)

  // Subtitle — month
  doc.setFontSize(11)
  doc.setTextColor(120, 120, 120)
  doc.text(
    `Month: ${filterMonth || new Date().toISOString().slice(0, 7)}`,
    14, 30
  )

  // Summary
  doc.setFontSize(11)
  doc.setTextColor(40, 40, 40)
  doc.text(`Total Income:  $${totalIncome.toFixed(2)}`,  14, 42)
  doc.text(`Total Expense: $${totalExpense.toFixed(2)}`, 14, 50)
  doc.text(`Balance:       $${(totalIncome - totalExpense).toFixed(2)}`, 14, 58)

  // Table
  autoTable(doc, {
    startY: 68,
    head: [["Date", "Description", "Category", "Type", "Amount"]],
    body: transactions.map((t) => [
      new Date(t.date).toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric",
      }),
      t.description || "—",
      t.category?.name || "—",
      t.type.charAt(0).toUpperCase() + t.type.slice(1),
      `${t.type === "income" ? "+" : "-"}$${t.amount.toFixed(2)}`,
    ]),
    styles: {
      fontSize: 10,
      cellPadding: 4,
    },
    headStyles: {
      fillColor: [79, 70, 229],
      textColor: 255,
      fontStyle: "bold",
    },
    bodyStyles: {
      textColor: [40, 40, 40],
    },
    alternateRowStyles: {
      fillColor: [245, 245, 255],
    },
    columnStyles: {
      4: { halign: "right" },
    },
  })

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(9)
    doc.setTextColor(150)
    doc.text(
      `Page ${i} of ${pageCount} — Generated on ${new Date().toLocaleDateString()}`,
      14,
      doc.internal.pageSize.height - 10
    )
  }

  doc.save(`transactions-${filterMonth || new Date().toISOString().slice(0, 7)}.pdf`)
}

  const totalIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
  const totalExpense = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl md:text-2xl font-semibold text-gray-800">Transactions</h1>
        <div className="flex items-center gap-3">

            {/**for download */}
          <button
           onClick={handleDownloadPDF}
            disabled={transactions.length === 0}
            className="flex cursor-pointer items-center gap-2 border border-gray-400 text-gray-600 hover:bg-gray-50 text-sm font-medium px-4 py-2 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
            </svg>
            <span className="hidden sm:inline">Download PDF</span>
          </button>

          <button
          onClick={() => { setEditId(null); setShowModal(true) }}
          className="bg-indigo-600 cursor-pointer hover:bg-indigo-700 text-white text-sm font-medium px-3 py-2 md:px-4 rounded-lg transition"
        >
          + Add 
        </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-2 md:gap-4 mb-6">
        <div className="bg-white rounded-xl p-3 md:p-4 shadow-sm border border-gray-100">
          <p className="text-xs md:text-sm text-gray-500 mb-1">Income</p>
          <p className="text-base md:text-xl font-semibold text-green-600">+${totalIncome.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl p-3 md:p-4 shadow-sm border border-gray-100">
          <p className="text-xs md:text-sm text-gray-500 mb-1">Expenses</p>
          <p className="text-base md:text-xl font-semibold text-red-500">-${totalExpense.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl p-3 md:p-4 shadow-sm border border-gray-100">
          <p className="text-xs md:text-sm text-gray-500 mb-1">Balance</p>
          <p className={`text-base md:text-xl font-semibold ${totalIncome - totalExpense >= 0 ? "text-indigo-600" : "text-red-500"}`}>
            ${(totalIncome - totalExpense).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 md:gap-3 mb-4">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="">All types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        <input
          type="month"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-indigo-400"
        />

        {(filterType || filterMonth) && (
          <button
            onClick={() => { setFilterType(""); setFilterMonth("") }}
            className="text-sm text-gray-400 hover:text-gray-600 underline"
          >
            Clear
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-4 py-2 mb-4">{error}</p>
      )}

      {/* ── DESKTOP TABLE — hidden on mobile ── */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">No transactions found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="px-5 py-3 font-medium">Description</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium text-right">Amount</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {transactions.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-3 text-gray-700">{t.description || "—"}</td>
                  <td className="px-5 py-3">
                    <span
                      className="px-2 py-1 rounded-full text-xs font-medium"
                      style={{ backgroundColor: t.category?.color + "22", color: t.category?.color }}
                    >
                      {t.category?.name}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-500">
                    {new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${t.type === "income" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                      {t.type}
                    </span>
                  </td>
                  <td className={`px-5 py-3 text-right font-medium ${t.type === "income" ? "text-green-600" : "text-red-500"}`}>
                    {t.type === "income" ? "+" : "-"}${t.amount.toFixed(2)}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => {
                          setEditId(t.id)
                          setShowModal(true)
                          setForm({
                            amount: t.amount.toString(), type: t.type,
                            description: t.description || "",
                            date: t.date.split("T")[0], categoryId: t.category?.id || ""
                          })
                        }}
                        className="text-blue-500 hover:text-blue-700 text-xs font-medium transition"
                      >Edit</button>
                      {deleteId === t.id ? (
                        <span className="flex gap-2">
                          <button onClick={() => handleDelete(t.id)} className="text-red-500 hover:underline text-xs">Confirm</button>
                          <button onClick={() => setDeleteId(null)} className="text-gray-400 hover:underline text-xs">Cancel</button>
                        </span>
                      ) : (
                        <button onClick={() => setDeleteId(t.id)} className="text-gray-400 hover:text-red-500 text-xs transition">Delete</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── MOBILE CARDS — hidden on desktop ── */}
      <div className="md:hidden flex flex-col gap-3">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">No transactions found.</div>
        ) : (
          transactions.map((t) => (
            <div key={t.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">

              {/* Top row: description + amount */}
              <div className="flex items-start justify-between mb-2">
                <p className="text-sm font-medium text-gray-800">{t.description || "—"}</p>
                <p className={`text-sm font-semibold ${t.type === "income" ? "text-green-600" : "text-red-500"}`}>
                  {t.type === "income" ? "+" : "-"}${t.amount.toFixed(2)}
                </p>
              </div>

              {/* Middle row: category + type + date */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{ backgroundColor: t.category?.color + "22", color: t.category?.color }}
                >
                  {t.category?.name}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${t.type === "income" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                  {t.type}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>

              {/* Bottom row: actions */}
              <div className="flex items-center justify-end gap-3 border-t border-gray-50 pt-2">
                <button
                  onClick={() => {
                    setEditId(t.id)
                    setShowModal(true)
                    setForm({
                      amount: t.amount.toString(), type: t.type,
                      description: t.description || "",
                      date: t.date.split("T")[0], categoryId: t.category?.id || ""
                    })
                  }}
                  className="text-blue-500 hover:text-blue-700 text-xs font-medium"
                >Edit</button>

                {deleteId === t.id ? (
                  <span className="flex gap-2">
                    <button onClick={() => handleDelete(t.id)} className="text-red-500 text-xs hover:underline">Confirm</button>
                    <button onClick={() => setDeleteId(null)} className="text-gray-400 text-xs hover:underline">Cancel</button>
                  </span>
                ) : (
                  <button onClick={() => setDeleteId(t.id)} className="text-gray-400 hover:text-red-500 text-xs">Delete</button>
                )}
              </div>

            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-end md:items-center justify-center z-50 px-0 md:px-4">
          <div className="bg-white rounded-t-2xl md:rounded-2xl shadow-xl w-full md:max-w-md p-6">

            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              {editId ? "Edit Transaction" : "Add Transaction"}
            </h2>

            {formError && (
              <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-4 py-2 mb-3">{formError}</p>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

              {/* Row 1: Amount + Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-600">Amount</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-black outline-none focus:ring-2 focus:ring-indigo-400"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-600">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-black outline-none focus:ring-2 focus:ring-indigo-400"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>

              </div>

              {/* Category */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-600">Category</label>
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-black outline-none focus:ring-2 focus:ring-indigo-400"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-600">Description</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-black outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="Optional note"
                />
              </div>

              {/* Date */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-600">Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-black outline-none focus:ring-2 focus:ring-indigo-400"
                  required
                />
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mt-2">

                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditId(null);
                  }}
                  className="flex-1 font-semibold border border-gray-300 text-gray-600 rounded-lg py-2.5 text-sm hover:bg-gray-100 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2.5 text-sm transition disabled:opacity-60"
                >
                  {submitting ? "Saving..." : "Save"}
                </button>

              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  )
}