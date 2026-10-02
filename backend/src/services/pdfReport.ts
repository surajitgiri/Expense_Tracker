import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import path from "path"
import fs from "fs"

export interface PdfTransactionItem {
  date: Date | string
  description: string | null
  type: string
  amount: number
  category?: { name: string } | null
  account?: { name: string } | null
}

export interface GenerateMonthlyPdfParams {
  user: {
    name: string | null
    email: string
    currency?: string | null
  }
  monthName: string
  year: number
  transactions: PdfTransactionItem[]
  totalIncome: number
  totalExpense: number
  netBalance: number
  currencyCode?: string
}

const getPdfCurrencySymbol = (code: string = "INR") => {
  switch (code.toUpperCase()) {
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
  currencyCode: string = "INR",
  options?: { showSign?: boolean; type?: "income" | "expense" | "balance" }
) => {
  const sym = getPdfCurrencySymbol(currencyCode)
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

const getLogoBase64 = (): string | null => {
  const possiblePaths = [
    path.join(__dirname, "../assets/logo-icon.png"),
    path.join(__dirname, "../../src/assets/logo-icon.png"),
    path.join(process.cwd(), "src/assets/logo-icon.png"),
    path.join(process.cwd(), "backend/src/assets/logo-icon.png"),
    path.join(process.cwd(), "../public/logo-icon.png"),
    path.join(process.cwd(), "public/logo-icon.png"),
  ]

  for (const p of possiblePaths) {
    try {
      if (fs.existsSync(p)) {
        return fs.readFileSync(p).toString("base64")
      }
    } catch {}
  }
  return null
}

/**
 * Generates an executive-grade Monthly Financial Statement PDF as a Buffer.
 */
export async function generateMonthlyReportPdf(params: GenerateMonthlyPdfParams): Promise<Buffer> {
  const {
    user,
    monthName,
    year,
    transactions,
    totalIncome,
    totalExpense,
    netBalance,
    currencyCode = "INR",
  } = params

  const doc = new jsPDF()

  // 1. Executive Header Banner
  // Deep navy background matching logo (#0C144C)
  doc.setFillColor(12, 20, 76)
  doc.roundedRect(14, 12, 182, 34, 3, 3, "F")

  // Embed Official Logo Emblem
  let textStartX = 36
  const logoBase64 = getLogoBase64()
  if (logoBase64) {
    try {
      doc.addImage(`data:image/png;base64,${logoBase64}`, "PNG", 18, 15, 22, 22)
      textStartX = 46
    } catch {
      textStartX = 36
    }
  }

  // Brand Title & Tagline
  doc.setFont("helvetica", "bold")
  doc.setFontSize(14)
  doc.setTextColor(255, 255, 255)
  doc.text("SG-FINANCE", textStartX, 23)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.setTextColor(244, 165, 21) // Amber #F4A515
  doc.text("Since 2020  •  Official Monthly Financial Statement", textStartX, 28)

  const accountName = user.name || "Personal Account"
  const accountEmail = user.email ? ` • ${user.email}` : ""
  doc.setFontSize(7.5)
  doc.setTextColor(203, 213, 225) // Slate-300
  doc.text(`Account: ${accountName}${accountEmail}`, textStartX, 34)

  // Header Right: Month & Currency Details
  const periodLabel = `${monthName} ${year}`
  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  doc.setTextColor(255, 255, 255)
  doc.text(periodLabel, 190, 22.5, { align: "right" })

  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.setTextColor(199, 210, 254) // Indigo-200
  doc.text(`Currency: ${currencyCode} (${getPdfCurrencySymbol(currencyCode)})`, 190, 28, { align: "right" })

  doc.setFontSize(7.5)
  doc.setTextColor(148, 163, 184) // Slate-400
  const genDate = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
  doc.text(`Generated: ${genDate}`, 190, 34, { align: "right" })

  // 2. Financial Summary Meta Bar
  doc.setFont("helvetica", "bold")
  doc.setFontSize(8)
  doc.setTextColor(71, 85, 105) // Slate-600
  doc.text("FINANCIAL SUMMARY", 14, 52)

  const countStr = `${transactions.length} ${transactions.length === 1 ? "Transaction" : "Transactions"}`
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.setTextColor(100, 116, 139)
  doc.text(countStr, 196, 52, { align: "right" })

  // 3. Three Modern KPI Summary Cards
  const cardWidth = 57.3
  const cardHeight = 21
  const cardY = 56

  // Card 1: TOTAL EARNED
  doc.setFillColor(240, 253, 244) // Emerald-50
  doc.setDrawColor(187, 247, 208) // Emerald-200
  doc.setLineWidth(0.3)
  doc.roundedRect(14, cardY, cardWidth, cardHeight, 2.5, 2.5, "FD")

  doc.setFont("helvetica", "bold")
  doc.setFontSize(7.5)
  doc.setTextColor(22, 101, 52) // Emerald-800
  doc.text("TOTAL EARNED", 18, cardY + 6.5)

  doc.setFontSize(11)
  doc.setTextColor(21, 128, 61) // Emerald-700
  doc.text(
    formatPdfAmount(totalIncome, currencyCode, { showSign: true, type: "income" }),
    18,
    cardY + 15
  )

  // Card 2: TOTAL SPENT
  const card2X = 14 + cardWidth + 5
  doc.setFillColor(254, 242, 242) // Rose-50
  doc.setDrawColor(254, 202, 202) // Rose-200
  doc.roundedRect(card2X, cardY, cardWidth, cardHeight, 2.5, 2.5, "FD")

  doc.setFont("helvetica", "bold")
  doc.setFontSize(7.5)
  doc.setTextColor(153, 27, 27) // Rose-800
  doc.text("TOTAL SPENT", card2X + 4, cardY + 6.5)

  doc.setFontSize(11)
  doc.setTextColor(220, 38, 38) // Rose-600
  doc.text(
    formatPdfAmount(totalExpense, currencyCode, { showSign: true, type: "expense" }),
    card2X + 4,
    cardY + 15
  )

  // Card 3: NET SAVINGS / BALANCE
  const card3X = card2X + cardWidth + 5
  const isNetPositive = netBalance >= 0

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
  doc.text(isNetPositive ? "NET SAVINGS" : "NET DEFICIT", card3X + 4, cardY + 6.5)

  doc.setFontSize(11)
  doc.setTextColor(isNetPositive ? 67 : 194, isNetPositive ? 56 : 65, isNetPositive ? 202 : 12)
  doc.text(
    formatPdfAmount(netBalance, currencyCode, { showSign: true, type: "balance" }),
    card3X + 4,
    cardY + 15
  )

  // 4. Transactions Table
  const tableRows = transactions.length > 0
    ? transactions.map((t) => {
        const d = new Date(t.date)
        const dateStr = isNaN(d.getTime())
          ? "—"
          : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        const desc = t.description?.trim() || "—"
        const cat = t.category?.name || "General"
        const acc = t.account?.name || "Main"
        const isIncome = t.type.toLowerCase() === "income"
        const typeLabel = isIncome ? "Income" : "Expense"
        const amountStr = formatPdfAmount(t.amount, currencyCode, {
          showSign: true,
          type: isIncome ? "income" : "expense",
        })
        return [dateStr, desc, cat, acc, typeLabel, amountStr]
      })
    : [["—", "No transactions recorded for this period", "—", "—", "—", formatPdfAmount(0, currencyCode)]]

  autoTable(doc, {
    startY: 83,
    head: [["Date", "Description", "Category", "Account", "Type", "Amount"]],
    body: tableRows,
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
      fillColor: [12, 20, 76], // Brand deep navy
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
      if (data.section === "body" && transactions.length > 0) {
        const rowData = transactions[data.row.index]
        if (rowData) {
          const isIncome = rowData.type.toLowerCase() === "income"
          if (data.column.index === 5) {
            data.cell.styles.textColor = isIncome ? [22, 101, 52] : [220, 38, 38]
          }
          if (data.column.index === 4) {
            data.cell.styles.textColor = isIncome ? [22, 101, 52] : [153, 27, 27]
            data.cell.styles.fontStyle = isIncome ? "bold" : "normal"
          }
        }
      }
    },
  })

  // 5. Multi-Page Footers
  const pageCount = (doc as any).internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    const pageHeight = doc.internal.pageSize.height

    doc.setDrawColor(226, 232, 240)
    doc.setLineWidth(0.3)
    doc.line(14, pageHeight - 12, 196, pageHeight - 12)

    doc.setFont("helvetica", "normal")
    doc.setFontSize(7.5)
    doc.setTextColor(148, 163, 184)
    doc.text(
      "SG-Finance • Automated Financial Tracking Statement • Confidential",
      14,
      pageHeight - 7
    )

    doc.setTextColor(100, 116, 139)
    doc.text(
      `Page ${i} of ${pageCount}  •  ${currencyCode} (${getPdfCurrencySymbol(currencyCode)})`,
      196,
      pageHeight - 7,
      { align: "right" }
    )
  }

  const pdfArrayBuffer = doc.output("arraybuffer")
  return Buffer.from(pdfArrayBuffer)
}
