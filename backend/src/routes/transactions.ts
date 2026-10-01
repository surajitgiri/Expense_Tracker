import { Router, Response, NextFunction } from "express"
import { prisma } from "../lib/prisma"
import { AuthenticatedRequest } from "../middleware/auth"
import { createNotification } from "../lib/notification"
import { validate } from "../middleware/validate"
import {
  createTransactionSchema,
  updateTransactionSchema,
} from "../schemas/transaction.schema"

const router = Router()

// GET /api/transactions
router.get("/", async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" })
      return
    }

    const category = req.query.category as string | undefined
    const type = req.query.type as string | undefined
    const month = req.query.month as string | undefined
    const search = req.query.search as string | undefined
    const pageParam = req.query.page as string | undefined
    const limitParam = req.query.limit as string | undefined

    const where: any = {
      userId,
      ...(category && { categoryId: category }),
      ...(type && { type }),
      ...(month && {
        date: {
          gte: new Date(`${month}-01`),
          lte: new Date(
            new Date(`${month}-01`).setMonth(
              new Date(`${month}-01`).getMonth() + 1
            )
          ),
        },
      }),
      ...(search && {
        description: {
          contains: search,
          mode: "insensitive",
        },
      }),
    }

    // If pagination requested
    if (pageParam !== undefined || limitParam !== undefined) {
      const page = Math.max(1, parseInt(pageParam || "1", 10) || 1)
      const limit = Math.max(1, Math.min(100, parseInt(limitParam || "15", 10) || 15))
      const skip = (page - 1) * limit

      const [transactions, total, incomeSum, expenseSum] = await Promise.all([
        prisma.transaction.findMany({
          where,
          include: { category: true, account: true },
          orderBy: { date: "desc" },
          skip,
          take: limit,
        }),
        prisma.transaction.count({ where }),
        prisma.transaction.aggregate({
          where: { ...where, type: "income" },
          _sum: { amount: true },
        }),
        prisma.transaction.aggregate({
          where: { ...where, type: "expense" },
          _sum: { amount: true },
        }),
      ])

      const totalPages = Math.ceil(total / limit)
      const hasMore = page < totalPages

      res.json({
        transactions,
        total,
        page,
        limit,
        totalPages,
        hasMore,
        stats: {
          totalIncome: incomeSum._sum.amount || 0,
          totalExpense: expenseSum._sum.amount || 0,
        },
      })
      return
    }

    // Default unpaginated query (for dashboard and exports)
    const transactions = await prisma.transaction.findMany({
      where,
      include: { category: true, account: true },
      orderBy: { date: "desc" },
    })

    res.json(transactions)
  } catch (error) {
    next(error)
  }
})

// POST /api/transactions
router.post(
  "/",
  validate(createTransactionSchema),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id
      if (!userId) {
        res.status(401).json({ success: false, error: "Unauthorized" })
        return
      }

      const { amount, type, description, date, categoryId, accountId } = req.body
      const parsedAmount = typeof amount === "number" ? amount : parseFloat(amount)

      // Use a Prisma transaction to atomically create the transaction AND update account balance
      const [transaction] = await prisma.$transaction(async (tx) => {
        const newTx = await tx.transaction.create({
          data: {
            amount: parsedAmount,
            type,
            description: description ? description.trim() : "",
            date: new Date(date),
            categoryId,
            accountId: accountId || null,
            userId,
          },
          include: { category: true, account: true },
        })

        // Adjust account balance: income → +amount, expense → -amount
        if (accountId) {
          await tx.account.update({
            where: { id: accountId },
            data: {
              balance: {
                increment: type === "income" ? parsedAmount : -parsedAmount,
              },
            },
          })
        }

        return [newTx]
      })

      await createNotification({
        userId,
        message: "Transaction added successfully",
        type: "success",
      })

      res.status(201).json(transaction)
    } catch (error) {
      next(error)
    }
  }
)

// PUT /api/transactions
router.put(
  "/",
  validate(updateTransactionSchema),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id
      if (!userId) {
        res.status(401).json({ success: false, error: "Unauthorized" })
        return
      }

      const { id, amount, type, description, date, categoryId, accountId } = req.body

      const existing = await prisma.transaction.findUnique({ where: { id } })
      if (!existing || existing.userId !== userId) {
        res.status(404).json({ success: false, error: "Transaction not found" })
        return
      }

      const newAmount = amount !== undefined
        ? (typeof amount === "number" ? amount : parseFloat(amount))
        : existing.amount
      const newType = type !== undefined ? type : existing.type
      const newAccountId = accountId !== undefined ? (accountId || null) : existing.accountId

      // Use a Prisma transaction to atomically update the transaction AND rebalance accounts
      const [updated] = await prisma.$transaction(async (tx) => {
        // 1. Reverse the old balance effect on the old account
        if (existing.accountId) {
          await tx.account.update({
            where: { id: existing.accountId },
            data: {
              balance: {
                increment: existing.type === "income" ? -existing.amount : existing.amount,
              },
            },
          })
        }

        // 2. Apply the new balance effect on the new account
        if (newAccountId) {
          await tx.account.update({
            where: { id: newAccountId },
            data: {
              balance: {
                increment: newType === "income" ? newAmount : -newAmount,
              },
            },
          })
        }

        // 3. Update the transaction record
        const updatedTx = await tx.transaction.update({
          where: { id },
          data: {
            ...(amount !== undefined && { amount: newAmount }),
            ...(type !== undefined && { type }),
            ...(description !== undefined && { description: description ? description.trim() : "" }),
            ...(date !== undefined && { date: new Date(date) }),
            ...(categoryId !== undefined && { categoryId }),
            ...(accountId !== undefined && { accountId: newAccountId }),
          },
          include: { category: true, account: true },
        })

        return [updatedTx]
      })

      res.json(updated)
    } catch (error) {
      next(error)
    }
  }
)

// DELETE /api/transactions
router.delete("/", async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id
    if (!userId) {
      res.status(401).json({ success: false, error: "Unauthorized" })
      return
    }

    const id = req.query.id as string | undefined
    if (!id) {
      res.status(400).json({ success: false, error: "Missing transaction id" })
      return
    }

    const existing = await prisma.transaction.findUnique({ where: { id } })
    if (!existing || existing.userId !== userId) {
      res.status(404).json({ success: false, error: "Transaction not found" })
      return
    }

    // Atomically delete the transaction AND reverse its effect on account balance
    await prisma.$transaction(async (tx) => {
      await tx.transaction.delete({ where: { id } })

      // Reverse the balance: income was +, so reverse with -; expense was -, so reverse with +
      if (existing.accountId) {
        await tx.account.update({
          where: { id: existing.accountId },
          data: {
            balance: {
              increment: existing.type === "income" ? -existing.amount : existing.amount,
            },
          },
        })
      }
    })

    res.json({ success: true, message: "Deleted successfully" })
  } catch (error) {
    next(error)
  }
})

export default router
