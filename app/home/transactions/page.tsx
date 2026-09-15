"use client"

import React, { useEffect, useState, useRef } from "react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { useCurrency } from "@/context/CurrencyContext"

// Inside TransactionsPage():

type Category = {
  id: string
  name: string
  color: string
  icon?: string
}

type Transaction = {
  id: string
  amount: number
  type: "income" | "expense"
  description: string
  date: string
  category: Category
  accountId?: string | null
  account?: { id: string; name: string; type: string } | null
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

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [accounts, setAccounts] = useState<any[]>([])

  const [form, setForm] = useState({
    amount: "",
    type: "expense",
    description: "",
    date: new Date().toISOString().split("T")[0],
    categoryId: "",
    accountId: ""
  })

  const { format, currency } = useCurrency();

  const pdfFormat = (amount: number) => {
    return `${currency.code} ${amount.toFixed(2)}`
  }

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
    try {
      const res = await fetch("/api/categories")
      const data = await res.json()
      if (res.ok) {
        const catList = Array.isArray(data) ? data : data.categories || []
        setCategories(catList)
      }
    } catch {}
  }

  const fetchAccounts = async () => {
    try {
      const res = await fetch("/api/accounts")
      const data = await res.json()
      if (res.ok) {
        const accList = Array.isArray(data) ? data : data.accounts || []
        setAccounts(accList)
      }
    } catch {}
  }

  useEffect(() => {
    fetchTransactions()
    fetchCategories()
    fetchAccounts()

    window.addEventListener("transactionAdded", fetchTransactions)
    return () => window.removeEventListener("transactionAdded", fetchTransactions)
  }, [filterMonth, filterType])

  // ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showModal) {
        setShowModal(false)
        setEditId(null)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [showModal])


  //  --- 1. EXPORT TO CSV ---
  const handleExportCSV = () => {
    if (transactions.length === 0) return;

    const headers = ["Date", "Description", "Category", "Type", "Amount"]
    const rows = transactions.map((t) => [
      `"${new Date(t.date).toISOString().split("T")[0]}"`,
      `"${(t.description || "").replace(/"/g, '""')}"`,
      `"${(t.category?.name || "").replace(/"/g, '""')}"`,
      `"${t.type}"`,
      t.amount,
    ])

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `transactions-${filterMonth || "all"}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const text = await file.text()
    const lines = text.split("\n").filter((line) => line.trim().length > 0)
    if (lines.length < 2) {
      alert("CSV file is empty or missing data rows.")
      return
    }

    const dataRows = lines.slice(1)
    let importedCount = 0

    for (const row of dataRows) {
      const cols = row.split(",").map((col) => col.trim().replace(/^"|"$/g, ""))
      const [date, description, categoryName, type, amount] = cols

      if (!amount || isNaN(parseFloat(amount))) continue

      const matchedCategory =
        categories.find(
          (c) => c.name.toLowerCase() === (categoryName || "").toLowerCase()
        ) || categories[0]

      if (!matchedCategory) continue

      try {
        await fetch("/api/transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: date || new Date().toISOString().split("T")[0],
            description: description || "Imported transaction",
            categoryId: matchedCategory.id,
            type: type?.toLowerCase() === "income" ? "income" : "expense",
            amount: parseFloat(amount),
          }),
        })
        importedCount++
      } catch (err) {
        console.error("Failed to import row:", row, err)
      }
    }

    if (fileInputRef.current) fileInputRef.current.value = ""
    await fetchTransactions()
    alert(`Successfully imported ${importedCount} transactions!`)
  }

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
          date: new Date().toISOString().split("T")[0], categoryId: "", accountId: ""
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
    doc.text(`Total Income:  ${pdfFormat(totalIncome)}`, 14, 42)
    doc.text(`Total Expense: ${pdfFormat(totalExpense)}`, 14, 50)
    doc.text(`Balance:       ${pdfFormat(totalIncome - totalExpense)}`, 14, 58)

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
        `${t.type === "income" ? "+" : "-"}${pdfFormat(t.amount)}`,
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
    <div className="space-y-4 md:space-y-6 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 mb-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Transactions</h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage and track your income and expenses</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Hidden file input for CSV Import */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportCSV}
            accept=".csv"
            className="hidden"
          />

          {/* Import CSV Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex cursor-pointer items-center justify-center gap-1.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-xs sm:text-sm font-medium px-2.5 sm:px-3 py-2 rounded-lg transition shadow-xs"
            title="Import from CSV"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M16 8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span className="hidden sm:inline">Import CSV</span>
          </button>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            disabled={transactions.length === 0}
            className="flex cursor-pointer items-center justify-center gap-1.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-xs sm:text-sm font-medium px-2.5 sm:px-3 py-2 rounded-lg transition shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
            title="Export to CSV"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          {/* Download PDF Button */}
          <button
            onClick={handleDownloadPDF}
            disabled={transactions.length === 0}
            className="flex cursor-pointer items-center justify-center gap-1.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-xs sm:text-sm font-medium px-2.5 sm:px-3 py-2 rounded-lg transition shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
            title="Download PDF"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
            </svg>
            <span className="hidden sm:inline">Download PDF</span>
          </button>

          <button
            onClick={() => {
              setEditId(null)
              setForm({
                amount: "",
                type: "expense",
                description: "",
                date: new Date().toISOString().split("T")[0],
                categoryId: categories[0]?.id || "",
                accountId: "",
              })
              setShowModal(true)
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-medium px-3.5 py-2 rounded-lg transition shadow-sm cursor-pointer"
          >
            <span className="text-base leading-none font-bold">+</span>
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-5">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-[11px] sm:text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-1 font-medium">Income</p>
          <p className="text-sm sm:text-lg md:text-xl font-bold text-green-600 dark:text-green-400 truncate">+{format(totalIncome)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-[11px] sm:text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-1 font-medium">Expenses</p>
          <p className="text-sm sm:text-lg md:text-xl font-bold text-red-500 dark:text-red-400 truncate">-{format(totalExpense)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-[11px] sm:text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-1 font-medium">Balance</p>
          <p className={`text-sm sm:text-lg md:text-xl font-bold truncate ${totalIncome - totalExpense >= 0 ? "text-indigo-600 dark:text-indigo-400" : "text-red-500 dark:text-red-400"}`}>
            {format(totalIncome - totalExpense)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 sm:gap-3 mb-4 flex-wrap">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="flex-1 sm:flex-none border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-gray-700 dark:text-gray-200 outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        <input
          type="month"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          className="flex-1 sm:flex-none border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-gray-700 dark:text-gray-200 outline-none focus:ring-2 focus:ring-indigo-500"
        />

        {(filterType || filterMonth) && (
          <button
            onClick={() => { setFilterType(""); setFilterMonth("") }}
            className="text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 hover:underline px-1 py-1 font-medium cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg px-4 py-2 mb-4">{error}</p>
      )}

      {/* ── DESKTOP TABLE — hidden on mobile ── */}
      <div className="hidden md:block bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">No transactions found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-left">
              <tr>
                <th className="px-5 py-3 font-medium">Description</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium text-right">Amount</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
              {transactions.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                  <td className="px-5 py-3 text-gray-800 dark:text-gray-200">{t.description || "—"}</td>
                  <td className="px-5 py-3">
                    <span
                      className="px-2 py-1 rounded-full text-xs font-medium"
                      style={{ backgroundColor: t.category?.color + "22", color: t.category?.color }}
                    >
                      {t.category?.name}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-500 dark:text-gray-400">
                    {new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${t.type === "income" ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300" : "bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-300"}`}>
                      {t.type}
                    </span>
                  </td>
                  <td className={`px-5 py-3 text-right font-medium ${t.type === "income" ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}>
                    {t.type === "income" ? "+" : "-"}{format(t.amount)}
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
                            date: t.date.split("T")[0], categoryId: t.category?.id || "",
                            accountId: t.accountId || ""
                          })
                        }}
                        className="text-blue-500 hover:text-blue-700 text-xs font-medium transition cursor-pointer"
                      >Edit</button>
                      {deleteId === t.id ? (
                        <span className="flex gap-2">
                          <button onClick={() => handleDelete(t.id)} className="text-red-500 hover:underline text-xs cursor-pointer">Confirm</button>
                          <button onClick={() => setDeleteId(null)} className="text-gray-400 hover:underline text-xs cursor-pointer">Cancel</button>
                        </span>
                      ) : (
                        <button onClick={() => setDeleteId(t.id)} className="text-gray-400 hover:text-red-500 text-xs transition cursor-pointer">Delete</button>
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
            <div key={t.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-xs p-3.5 sm:p-4 transition">

              {/* Top row: description + amount */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{t.description || "—"}</p>
                <p className={`text-sm font-bold shrink-0 ${t.type === "income" ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}>
                  {t.type === "income" ? "+" : "-"}{format(t.amount)}
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
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${t.type === "income" ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300" : "bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-300"}`}>
                  {t.type}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>

              {/* Bottom row: actions */}
              <div className="flex items-center justify-end gap-3 border-t border-gray-100 dark:border-gray-700/60 pt-2.5">
                <button
                  onClick={() => {
                    setEditId(t.id)
                    setShowModal(true)
                    setForm({
                      amount: t.amount.toString(), type: t.type,
                      description: t.description || "",
                      date: t.date.split("T")[0], categoryId: t.category?.id || "",
                      accountId: t.accountId || ""
                    })
                  }}
                  className="text-blue-500 hover:text-blue-700 text-xs font-medium cursor-pointer"
                >Edit</button>

                {deleteId === t.id ? (
                  <span className="flex gap-2">
                    <button onClick={() => handleDelete(t.id)} className="text-red-500 text-xs hover:underline cursor-pointer">Confirm</button>
                    <button onClick={() => setDeleteId(null)} className="text-gray-400 text-xs hover:underline cursor-pointer">Cancel</button>
                  </span>
                ) : (
                  <button onClick={() => setDeleteId(t.id)} className="text-gray-400 hover:text-red-500 text-xs cursor-pointer">Delete</button>
                )}
              </div>

            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowModal(false)
              setEditId(null)
            }
          }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl border border-gray-100 dark:border-gray-700/80 overflow-hidden transform transition-all my-auto max-h-[92dvh] flex flex-col">
            
            {/* Header */}
            <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-gray-100 dark:border-gray-700/60 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50 shrink-0">
              <div className="flex items-center gap-2 sm:gap-2.5">
                <span className="text-xl">⚡</span>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                    {editId ? "Edit Transaction" : "Quick Add Transaction"}
                  </h2>
                  <p className="text-[11px] sm:text-xs text-gray-400 dark:text-gray-500">
                    Record an expense or income instantly
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <kbd className="hidden sm:inline-block text-[10px] font-semibold px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                  ESC to close
                </kbd>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditId(null)
                  }}
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

              {/* Type Switcher: Expense vs Income */}
              <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, type: "expense" })}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    form.type === "expense"
                      ? "bg-red-500 text-white shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  Expense 💸
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, type: "income" })}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    form.type === "income"
                      ? "bg-green-600 text-white shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  Income 💰
                </button>
              </div>

              {/* Amount and Date in 2 columns */}
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
                      type="number"
                      step="0.01"
                      required
                      placeholder="0.00"
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })}
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
                    required
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
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
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
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
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    required
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon || "📦"} {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Wallet / Account (Optional)
                  </label>
                  <select
                    value={form.accountId || ""}
                    onChange={(e) => setForm({ ...form, accountId: e.target.value })}
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

              {/* Actions Footer */}
              <div className="pt-3 sm:pt-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-2 shrink-0 border-t border-gray-100 dark:border-gray-700/40">
                <span className="hidden sm:inline-block text-[11px] text-gray-400 dark:text-gray-500">
                  Tip: Press <kbd className="font-semibold text-gray-600 dark:text-gray-300">Enter</kbd> to save
                </span>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setEditId(null)
                    }}
                    className="flex-1 sm:flex-none px-4 py-2.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition cursor-pointer text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 sm:flex-none px-5 py-2.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer text-center"
                  >
                    {submitting ? "Saving..." : editId ? "Save Changes" : "Add Transaction"}
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  )
}