"use client"

import React, { useEffect, useState, useRef } from "react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { useCurrency } from "@/context/CurrencyContext"
import { useToast } from "@/context/ToastContext"

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
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [overallStats, setOverallStats] = useState<{ totalIncome: number; totalExpense: number }>({
    totalIncome: 0,
    totalExpense: 0,
  })
  const [search, setSearch] = useState("")
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
  const isFetchingRef = useRef(false)
  const [accounts, setAccounts] = useState<any[]>([])
  const [downloadingPdf, setDownloadingPdf] = useState(false)
  const [userProfile, setUserProfile] = useState<{ name: string; email: string } | null>(null)

  const [form, setForm] = useState({
    amount: "",
    type: "expense",
    description: "",
    date: new Date().toISOString().split("T")[0],
    categoryId: "",
    accountId: ""
  })

  const { format, currency } = useCurrency();
  const { toast } = useToast();

  const getPdfCurrencySymbol = (code: string) => {
    switch (code) {
      case "INR":
        return "Rs."
      case "USD":
        return "$"
      case "EUR":
        return "€"
      case "GBP":
        return "£"
      case "JPY":
        return "¥"
      case "AUD":
        return "A$"
      case "CAD":
        return "C$"
      default:
        return code
    }
  }

  const formatPdfAmount = (
    amount: number,
    options?: { showSign?: boolean; type?: "income" | "expense" | "balance" }
  ) => {
    const sym = getPdfCurrencySymbol(currency.code)
    const formattedNum = Math.abs(amount).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })

    if (options?.showSign) {
      if (options.type === "income" || (options.type === "balance" && amount > 0)) {
        return `+ ${sym} ${formattedNum}`
      }
      if (options.type === "expense" || (options.type === "balance" && amount < 0)) {
        return `- ${sym} ${formattedNum}`
      }
    }
    return `${sym} ${formattedNum}`
  }

  const pdfFormat = (amount: number) => {
    return formatPdfAmount(amount)
  }

  const fetchTransactions = async (pageToFetch = page, limitToFetch = limit) => {
    if (isFetchingRef.current) return
    isFetchingRef.current = true
    setLoading(true)
    setError("")

    try {
      const params = new URLSearchParams()
      if (filterType) params.append("type", filterType)
      if (filterMonth) params.append("month", filterMonth)
      if (search.trim()) params.append("search", search.trim())
      params.append("page", pageToFetch.toString())
      params.append("limit", limitToFetch.toString())

      const res = await fetch(`/api/transactions?${params.toString()}`)
      const data = await res.json()

      if (res.ok) {
        const items: Transaction[] = data.transactions || (Array.isArray(data) ? data : [])
        setTransactions(items)
        setPage(pageToFetch)
        const calculatedTotal = data.total ?? items.length
        setTotalCount(calculatedTotal)
        setTotalPages(data.totalPages || Math.max(1, Math.ceil(calculatedTotal / limitToFetch)))
        if (data.stats) {
          setOverallStats(data.stats)
        }
      } else {
        setError(data.error || "Failed to load transactions")
      }
    } catch {
      setError("Failed to load transactions")
    } finally {
      isFetchingRef.current = false
      setLoading(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === page || loading) return
    fetchTransactions(newPage, limit)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      if (page <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages)
      } else if (page >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(1, "...", page - 1, page, page + 1, "...", totalPages)
      }
    }
    return pages
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
    fetchCategories()
    fetchAccounts()
    fetch("/api/user")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.name || data?.email) {
          setUserProfile({ name: data.name || "Personal Account", email: data.email || "" })
        }
      })
      .catch(() => {})
  }, [])

  // Refetch page 1 whenever filters, search query, or limit changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTransactions(1, limit)
    }, 200)
    return () => clearTimeout(timer)
  }, [filterMonth, filterType, search, limit])

  // Handle external transaction added events (e.g. from QuickAdd)
  useEffect(() => {
    const handleTxAdded = () => fetchTransactions(1, limit)
    window.addEventListener("transactionAdded", handleTxAdded)
    return () => window.removeEventListener("transactionAdded", handleTxAdded)
  }, [filterMonth, filterType, search, limit])

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


  const getAllTransactionsForExport = async (): Promise<Transaction[]> => {
    try {
      const params = new URLSearchParams()
      if (filterType) params.append("type", filterType)
      if (filterMonth) params.append("month", filterMonth)
      if (search.trim()) params.append("search", search.trim())
      const res = await fetch(`/api/transactions?${params.toString()}`)
      const data = await res.json()
      if (Array.isArray(data)) return data
      if (data.transactions) return data.transactions
    } catch {}
    return transactions
  }

  //  --- 1. EXPORT TO CSV ---
  const handleExportCSV = async () => {
    if (transactions.length === 0) return;

    const dataToExport = await getAllTransactionsForExport()
    if (dataToExport.length === 0) return;

    const headers = ["Date", "Description", "Category", "Type", "Amount"]
    const rows = dataToExport.map((t) => [
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
          toast({ type: "success", message: "Transaction updated", description: `${data.description || data.type} saved successfully.` })
        } else {
          setTransactions((prev) => {
            const filtered = prev.filter((t) => t.id !== data.id)
            return [data, ...filtered]
          })
          setTotalCount((prev) => prev + 1)
          if (data.type === "income") {
            setOverallStats((prev) => ({ ...prev, totalIncome: prev.totalIncome + data.amount }))
          } else {
            setOverallStats((prev) => ({ ...prev, totalExpense: prev.totalExpense + data.amount }))
          }
          toast({ type: "success", message: "Transaction added", description: `${format(data.amount)} ${data.type} recorded.` })
        }
        setShowModal(false)
        setEditId(null)
        setForm({
          amount: "", type: "expense", description: "",
          date: new Date().toISOString().split("T")[0], categoryId: "", accountId: ""
        })
      } else {
        setFormError(data.error)
        toast({ type: "error", message: "Failed to save", description: data.error })
      }
    } catch {
      setFormError("Something went wrong")
      toast({ type: "error", message: "Something went wrong", description: "Please try again." })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    const deleted = transactions.find((t) => t.id === id)
    // Optimistic removal
    setTransactions((prev) => prev.filter((t) => t.id !== id))
    setTotalCount((prev) => Math.max(0, prev - 1))
    if (deleted) {
      if (deleted.type === "income") {
        setOverallStats((prev) => ({ ...prev, totalIncome: Math.max(0, prev.totalIncome - deleted.amount) }))
      } else {
        setOverallStats((prev) => ({ ...prev, totalExpense: Math.max(0, prev.totalExpense - deleted.amount) }))
      }
    }
    setDeleteId(null)

    try {
      const res = await fetch(`/api/transactions?id=${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      toast({
        type: "info",
        message: "Transaction deleted",
        description: deleted?.description || "Transaction removed.",
        undoAction: async () => {
          // Re-fetch to restore
          await fetchTransactions(page, limit)
        },
      })
    } catch {
      // Rollback on failure
      await fetchTransactions(page, limit)
      toast({ type: "error", message: "Delete failed", description: "Could not delete the transaction." })
    }
  }

  const handleDownloadPDF = async () => {
    if (transactions.length === 0 || downloadingPdf) return
    setDownloadingPdf(true)

    try {
      const exportData = await getAllTransactionsForExport()
      if (exportData.length === 0) {
        toast({
          type: "info",
          message: "No transactions found",
          description: "There are no transactions to export for the selected filter.",
        })
        return
      }

      const doc = new jsPDF()

      // 1. Calculate actual totals for this exported dataset
      const exportIncome = exportData
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0)
      const exportExpense = exportData
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0)
      const exportBalance = exportIncome - exportExpense

      // Formatted period title
      let periodTitle = "All Time Activity"
      if (filterMonth) {
        const [y, m] = filterMonth.split("-")
        if (y && m) {
          const d = new Date(parseInt(y), parseInt(m) - 1, 1)
          periodTitle = d.toLocaleDateString("en-US", { month: "long", year: "numeric" })
        }
      }

      // 2. Executive Header Banner
      // Deep navy background card matching logo (#0C144C)
      doc.setFillColor(12, 20, 76)
      doc.roundedRect(14, 12, 182, 34, 3, 3, "F")

      // Embed Official Logo Image
      let textStartX = 36
      try {
        const logoDataUrl = await new Promise<string | null>((resolve) => {
          const img = new Image()
          img.crossOrigin = "anonymous"
          img.onload = () => {
            try {
              const canvas = document.createElement("canvas")
              canvas.width = 640
              canvas.height = 512
              const ctx = canvas.getContext("2d")
              if (ctx) {
                ctx.drawImage(img, 0, 0, 640, 512)
                resolve(canvas.toDataURL("image/png"))
              } else {
                resolve(null)
              }
            } catch {
              resolve(null)
            }
          }
          img.onerror = () => resolve(null)
          img.src = "/logo.svg"
        })

        if (logoDataUrl) {
          doc.addImage(logoDataUrl, "PNG", 18, 14, 26, 20.8)
          textStartX = 48
        } else {
          doc.setFillColor(244, 165, 21)
          doc.roundedRect(20, 18, 12, 12, 2.5, 2.5, "F")
          doc.setTextColor(12, 20, 76)
          doc.setFont("helvetica", "bold")
          doc.setFontSize(9)
          doc.text("SG", 23.5, 25.8)
          textStartX = 36
        }
      } catch {
        textStartX = 36
      }

      // Brand Title & Statement Type
      doc.setFont("helvetica", "bold")
      doc.setFontSize(14)
      doc.setTextColor(255, 255, 255)
      doc.text("SG-FINANCE", textStartX, 23)

      doc.setFont("helvetica", "normal")
      doc.setFontSize(8)
      doc.setTextColor(244, 165, 21) // Amber #F4A515 from logo
      doc.text("Since 2020  •  Official Financial Activity Statement", textStartX, 28)

      const accountName = userProfile?.name || "Personal Account"
      const accountEmail = userProfile?.email ? ` • ${userProfile.email}` : ""
      doc.setFontSize(7.5)
      doc.setTextColor(203, 213, 225) // Slate-300
      doc.text(`Account: ${accountName}${accountEmail}`, textStartX, 34)

      // Header Right: Period & Default Currency Badge
      doc.setFont("helvetica", "bold")
      doc.setFontSize(11)
      doc.setTextColor(255, 255, 255)
      doc.text(periodTitle, 190, 22.5, { align: "right" })

      doc.setFont("helvetica", "normal")
      doc.setFontSize(8)
      doc.setTextColor(199, 210, 254) // Indigo-200
      doc.text(`Default Currency: ${currency.name} (${currency.code})`, 190, 28, { align: "right" })

      doc.setFontSize(7.5)
      doc.setTextColor(148, 163, 184) // Slate-400
      const genDate = new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
      doc.text(`Generated: ${genDate}`, 190, 34, { align: "right" })

      // 3. Metadata Strip
      doc.setFont("helvetica", "bold")
      doc.setFontSize(8)
      doc.setTextColor(71, 85, 105) // Slate-600
      doc.text("FINANCIAL SUMMARY", 14, 52)

      const metaFilterItems = [
        filterType ? `Type: ${filterType.toUpperCase()}` : "All Types",
        search ? `Search: "${search}"` : null,
        `${exportData.length} ${exportData.length === 1 ? "Transaction" : "Transactions"}`,
      ].filter(Boolean)
      doc.setFont("helvetica", "normal")
      doc.setFontSize(8)
      doc.setTextColor(100, 116, 139)
      doc.text(metaFilterItems.join("  •  "), 196, 52, { align: "right" })

      // 4. Three Modern Metric Summary Cards
      const cardWidth = 57.3
      const cardHeight = 21
      const cardY = 56

      // Card 1: TOTAL INCOME
      doc.setFillColor(240, 253, 244) // Emerald-50
      doc.setDrawColor(187, 247, 208) // Emerald-200
      doc.setLineWidth(0.3)
      doc.roundedRect(14, cardY, cardWidth, cardHeight, 2.5, 2.5, "FD")

      doc.setFont("helvetica", "bold")
      doc.setFontSize(7.5)
      doc.setTextColor(22, 101, 52) // Emerald-800
      doc.text("TOTAL INCOME", 18, cardY + 6.5)

      doc.setFontSize(11)
      doc.setTextColor(21, 128, 61) // Emerald-700
      doc.text(
        formatPdfAmount(exportIncome, { showSign: true, type: "income" }),
        18,
        cardY + 15
      )

      // Card 2: TOTAL EXPENSES
      const card2X = 14 + cardWidth + 5
      doc.setFillColor(254, 242, 242) // Rose-50
      doc.setDrawColor(254, 202, 202) // Rose-200
      doc.roundedRect(card2X, cardY, cardWidth, cardHeight, 2.5, 2.5, "FD")

      doc.setFont("helvetica", "bold")
      doc.setFontSize(7.5)
      doc.setTextColor(153, 27, 27) // Rose-800
      doc.text("TOTAL EXPENSES", card2X + 4, cardY + 6.5)

      doc.setFontSize(11)
      doc.setTextColor(220, 38, 38) // Rose-600
      doc.text(
        formatPdfAmount(exportExpense, { showSign: true, type: "expense" }),
        card2X + 4,
        cardY + 15
      )

      // Card 3: NET BALANCE / SURPLUS
      const card3X = card2X + cardWidth + 5
      const isNetPositive = exportBalance >= 0

      if (isNetPositive) {
        doc.setFillColor(238, 242, 255) // Indigo-50
        doc.setDrawColor(199, 210, 254) // Indigo-200
      } else {
        doc.setFillColor(255, 247, 237) // Amber-50
        doc.setDrawColor(254, 215, 170) // Amber-200
      }
      doc.roundedRect(card3X, cardY, cardWidth, cardHeight, 2.5, 2.5, "FD")

      doc.setFont("helvetica", "bold")
      doc.setFontSize(7.5)
      doc.setTextColor(isNetPositive ? 55 : 154, isNetPositive ? 48 : 52, isNetPositive ? 163 : 18)
      doc.text(isNetPositive ? "NET BALANCE" : "NET DEFICIT", card3X + 4, cardY + 6.5)

      doc.setFontSize(11)
      doc.setTextColor(isNetPositive ? 67 : 194, isNetPositive ? 56 : 65, isNetPositive ? 202 : 12)
      doc.text(
        formatPdfAmount(exportBalance, { showSign: true, type: "balance" }),
        card3X + 4,
        cardY + 15
      )

      // 5. Transaction Statement Table
      autoTable(doc, {
        startY: 83,
        head: [["Date", "Description", "Category", "Account", "Type", "Amount"]],
        body: exportData.map((t) => {
          const formattedDate = new Date(t.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
          const desc = t.description?.trim() || "—"
          const cat = t.category?.name || "General"
          const acc = t.account?.name || "Default"
          const isIncome = t.type === "income"
          const typeLabel = isIncome ? "Income" : "Expense"
          const amountStr = formatPdfAmount(t.amount, {
            showSign: true,
            type: isIncome ? "income" : "expense",
          })
          return [formattedDate, desc, cat, acc, typeLabel, amountStr]
        }),
        theme: "striped",
        styles: {
          fontSize: 8.5,
          cellPadding: { top: 3.5, right: 3.5, bottom: 3.5, left: 3.5 },
          textColor: [51, 65, 85],
          lineColor: [241, 245, 249],
          lineWidth: 0.1,
          font: "helvetica",
        },
        headStyles: {
          fillColor: [15, 23, 42], // Midnight slate header
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 8,
          halign: "left",
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: "auto" },
          2: { cellWidth: 28 },
          3: { cellWidth: 24 },
          4: { cellWidth: 22, halign: "center" },
          5: { cellWidth: 34, halign: "right", fontStyle: "bold" },
        },
        didParseCell: (data) => {
          if (data.section === "body") {
            const rowData = exportData[data.row.index]
            if (rowData) {
              // Amount column
              if (data.column.index === 5) {
                if (rowData.type === "income") {
                  data.cell.styles.textColor = [22, 101, 52] // Emerald-700
                } else {
                  data.cell.styles.textColor = [220, 38, 38] // Rose-600
                }
              }
              // Type column
              if (data.column.index === 4) {
                if (rowData.type === "income") {
                  data.cell.styles.textColor = [22, 101, 52]
                  data.cell.styles.fontStyle = "bold"
                } else {
                  data.cell.styles.textColor = [153, 27, 27]
                }
              }
            }
          }
        },
      })

      // 6. Professional Page Footers
      const pageCount = (doc as any).internal.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        const pageHeight = doc.internal.pageSize.height

        // Top divider line for footer
        doc.setDrawColor(226, 232, 240) // Slate-200
        doc.setLineWidth(0.3)
        doc.line(14, pageHeight - 12, 196, pageHeight - 12)

        // Left audit trail text
        doc.setFont("helvetica", "normal")
        doc.setFontSize(7.5)
        doc.setTextColor(148, 163, 184) // Slate-400
        doc.text(
          "SG-Finance • Automated Financial Tracking Statement • Confidential",
          14,
          pageHeight - 7
        )

        // Right pagination & currency info
        doc.setTextColor(100, 116, 139) // Slate-500
        doc.text(
          `Page ${i} of ${pageCount}  •  ${currency.code} (${currency.symbol})`,
          196,
          pageHeight - 7,
          { align: "right" }
        )
      }

      const filenamePeriod = filterMonth || new Date().toISOString().slice(0, 7)
      doc.save(`SG-Finance-Transactions-${filenamePeriod}.pdf`)

      toast({
        type: "success",
        message: "PDF Statement Exported",
        description: `Exported ${exportData.length} transactions formatted in ${currency.code}.`,
      })
    } catch (err) {
      console.error("Failed to generate PDF:", err)
      toast({
        type: "error",
        message: "PDF Export Failed",
        description: "An unexpected error occurred while generating the PDF statement.",
      })
    } finally {
      setDownloadingPdf(false)
    }
  }

  const totalIncome =
    overallStats.totalIncome ||
    transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
  const totalExpense =
    overallStats.totalExpense ||
    transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

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
            disabled={transactions.length === 0 || downloadingPdf}
            className="flex cursor-pointer items-center justify-center gap-1.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-xs sm:text-sm font-medium px-2.5 sm:px-3 py-2 rounded-lg transition shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
            title="Download PDF Statement"
          >
            {downloadingPdf ? (
              <svg className="w-4 h-4 animate-spin text-indigo-600 dark:text-indigo-400" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
              </svg>
            )}
            <span className="hidden sm:inline">{downloadingPdf ? "Exporting..." : "Download PDF"}</span>
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

      {/* Filters & Search */}
      <div className="flex items-center gap-2 sm:gap-3 mb-4 flex-wrap">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[180px] sm:min-w-[240px]">
          <input
            type="text"
            placeholder="Search description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg pl-8 pr-7 py-2 text-xs sm:text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
          />
          <svg className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m1.35-5.65a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs cursor-pointer"
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="flex-1 sm:flex-none border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-gray-700 dark:text-gray-200 outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
        >
          <option value="">All types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        <input
          type="month"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          className="flex-1 sm:flex-none border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-gray-700 dark:text-gray-200 outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
        />

        {(filterType || filterMonth || search) && (
          <button
            onClick={() => { setFilterType(""); setFilterMonth(""); setSearch("") }}
            className="text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 hover:underline px-1 py-1 font-medium cursor-pointer"
          >
            Clear
          </button>
        )}

        {totalCount > 0 && (
          <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto hidden sm:inline">
            Showing {transactions.length} of {totalCount}
          </span>
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
          <div className="py-16 flex flex-col items-center justify-center text-center px-6">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-indigo-500 dark:text-indigo-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">No transactions yet</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-4 max-w-xs">
              {filterType || filterMonth || search ? "No transactions match your current filters. Try adjusting them." : "Add your first income or expense to start tracking your finances."}
            </p>
            {!filterType && !filterMonth && !search && (
              <button
                onClick={() => { setForm({ amount: "", type: "expense", description: "", date: new Date().toISOString().split("T")[0], categoryId: "", accountId: "" }); setShowModal(true) }}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition shadow-sm cursor-pointer"
              >
                <span className="text-base font-bold leading-none">+</span>
                Add first transaction
              </button>
            )}
          </div>
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
          <div className="py-12 flex flex-col items-center justify-center text-center px-6">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">No transactions yet</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
              {filterType || filterMonth || search ? "No results for your filters." : "Start by adding your first transaction."}
            </p>
            {!filterType && !filterMonth && !search && (
              <button
                onClick={() => { setForm({ amount: "", type: "expense", description: "", date: new Date().toISOString().split("T")[0], categoryId: "", accountId: "" }); setShowModal(true) }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition cursor-pointer"
              >
                <span className="font-bold">+</span> Add transaction
              </button>
            )}
          </div>
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

      {/* ── PAGINATION BAR ── */}
      {totalCount > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 pb-6 px-1 border-t border-gray-100 dark:border-gray-700/60">
          
          {/* Showing info & page size */}
          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            <span>
              Showing <span className="font-semibold text-gray-800 dark:text-gray-200">{(page - 1) * limit + 1}</span>–<span className="font-semibold text-gray-800 dark:text-gray-200">{Math.min(page * limit, totalCount)}</span> of <span className="font-semibold text-gray-800 dark:text-gray-200">{totalCount}</span>
            </span>

            <div className="flex items-center gap-1.5 pl-3 border-l border-gray-200 dark:border-gray-700">
              <label htmlFor="limit-select" className="text-gray-400">Rows:</label>
              <select
                id="limit-select"
                value={limit}
                onChange={(e) => {
                  const newLimit = parseInt(e.target.value, 10)
                  setLimit(newLimit)
                  setPage(1)
                  fetchTransactions(1, newLimit)
                }}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-xs text-gray-700 dark:text-gray-200 outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          {/* Navigation: Prev, Page numbers, Next */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* Previous Page Arrow Button */}
            <button
              type="button"
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1 || loading}
              className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-xs cursor-pointer"
              aria-label="Previous page"
              title="Previous page"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline">Prev</span>
            </button>

            {/* Page Number Buttons */}
            <div className="flex items-center gap-1">
              {getPageNumbers().map((p, idx) => (
                p === "..." ? (
                  <span key={`dots-${idx}`} className="px-1 text-xs text-gray-400">...</span>
                ) : (
                  <button
                    key={`page-${p}`}
                    type="button"
                    onClick={() => handlePageChange(p as number)}
                    disabled={loading}
                    className={`min-w-8 h-8 px-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      page === p
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
                    }`}
                  >
                    {p}
                  </button>
                )
              ))}
            </div>

            {/* Next Page Arrow Button */}
            <button
              type="button"
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages || loading}
              className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-xs cursor-pointer"
              aria-label="Next page"
              title="Next page"
            >
              <span className="hidden sm:inline">Next</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

        </div>
      )}

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
                  onClick={() => setForm({ ...form, type: "income", categoryId: "" })}
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

              {/* Category (expense only) and Account */}
              <div className={`grid gap-3 ${ form.type === "expense" ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1" }`}>
                {/* Category — only shown for expenses */}
                {form.type === "expense" && (
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
                )}

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Wallet / Account <span className="text-gray-400 font-normal">(Optional)</span>
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