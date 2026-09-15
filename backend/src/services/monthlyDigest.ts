import { prisma } from "../lib/prisma"
import { sendMonthlyDigestEmail, MonthlyDigestData } from "../lib/mail"
import { createNotification } from "../lib/notification"

/**
 * Returns date range and metadata for the previous month relative to `referenceDate`.
 */
export function getPreviousMonthRange(referenceDate: Date = new Date()) {
  const year = referenceDate.getFullYear()
  const month = referenceDate.getMonth() // 0-indexed (0 = Jan, 9 = Oct)

  // 1st of previous month
  const start = new Date(year, month - 1, 1, 0, 0, 0, 0)
  // Last day of previous month
  const end = new Date(year, month, 0, 23, 59, 59, 999)

  const prevMonthNumber = start.getMonth() + 1
  const prevMonthString = `${start.getFullYear()}-${String(prevMonthNumber).padStart(2, "0")}`
  const monthName = start.toLocaleString("en-US", { month: "long" })

  return {
    start,
    end,
    monthString: prevMonthString,
    monthName,
    year: start.getFullYear(),
  }
}

/**
 * Generates and sends a monthly financial digest for a single user.
 */
export async function generateAndSendDigestForUser(
  userId: string,
  referenceDate: Date = new Date()
): Promise<{ success: boolean; data?: MonthlyDigestData; error?: string }> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, isVerified: true },
    })

    if (!user || !user.email) {
      return { success: false, error: "User not found or has no email" }
    }

    const { start, end, monthString, monthName, year } = getPreviousMonthRange(referenceDate)

    // 1. Fetch transactions for the target month
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: start,
          lte: end,
        },
      },
      include: {
        category: true,
      },
    })

    // 2. Fetch budgets for the target month
    const budgets = await prisma.budget.findMany({
      where: {
        userId,
        month: monthString,
      },
    })

    const totalEarned = transactions
      .filter((t) => t.type.toLowerCase() === "income")
      .reduce((sum, t) => sum + t.amount, 0)

    const expenseTransactions = transactions.filter(
      (t) => t.type.toLowerCase() === "expense"
    )

    const totalSpent = expenseTransactions.reduce((sum, t) => sum + t.amount, 0)
    const netSavings = totalEarned - totalSpent

    // 3. Find biggest spending category
    const categorySpending: Record<string, { name: string; amount: number }> = {}
    for (const tx of expenseTransactions) {
      const catName = tx.category?.name || "Uncategorized"
      if (!categorySpending[catName]) {
        categorySpending[catName] = { name: catName, amount: 0 }
      }
      categorySpending[catName].amount += tx.amount
    }

    const sortedCategories = Object.values(categorySpending).sort((a, b) => b.amount - a.amount)
    const topCategory = sortedCategories.length > 0 ? sortedCategories[0] : null

    const biggestCategory =
      topCategory && totalSpent > 0
        ? {
            name: topCategory.name,
            amount: topCategory.amount,
            percentage: (topCategory.amount / totalSpent) * 100,
          }
        : null

    // 4. Budget status
    const totalBudgetLimit = budgets.reduce((sum, b) => sum + b.limit, 0)
    const hasBudget = totalBudgetLimit > 0

    const budgetStatus = {
      hasBudget,
      limit: totalBudgetLimit,
      totalSpent,
      isUnder: totalSpent <= totalBudgetLimit,
      difference: Math.abs(totalBudgetLimit - totalSpent),
      percentage: hasBudget ? (totalSpent / totalBudgetLimit) * 100 : 0,
    }

    const digestData: MonthlyDigestData = {
      monthName,
      year,
      totalEarned,
      totalSpent,
      netSavings,
      biggestCategory,
      budget: budgetStatus,
    }

    // 5. Dispatch email via nodemailer
    await sendMonthlyDigestEmail(user.email, user.name || "User", digestData)

    // 6. Record notification
    await createNotification({
      userId: user.id,
      message: `Monthly Financial Digest for ${monthName} was sent to ${user.email}.`,
      type: "info",
    })

    return { success: true, data: digestData }
  } catch (error: any) {
    console.error(`Error sending digest to user ${userId}:`, error)
    return { success: false, error: error?.message || "Failed to generate digest" }
  }
}

/**
 * Iterates through all verified users and delivers their monthly financial digest.
 */
export async function sendMonthlyDigestsToAllUsers(referenceDate: Date = new Date()) {
  console.log("⏰ Running Monthly Financial Digest job for all users...")

  const users = await prisma.user.findMany({
    where: { isVerified: true },
    select: { id: true, email: true },
  })

  let successCount = 0
  let failureCount = 0

  for (const user of users) {
    const result = await generateAndSendDigestForUser(user.id, referenceDate)
    if (result.success) {
      successCount++
    } else {
      failureCount++
    }
  }

  console.log(
    `✅ Monthly Financial Digest completed: ${successCount} sent, ${failureCount} failed.`
  )

  return { successCount, failureCount, total: users.length }
}
