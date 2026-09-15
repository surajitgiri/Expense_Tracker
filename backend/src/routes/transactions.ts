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

    const transactions = await prisma.transaction.findMany({
      where: {
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
      },
      include: { category: true },
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

      const transaction = await prisma.transaction.create({
        data: {
          amount: typeof amount === "number" ? amount : parseFloat(amount),
          type,
          description: description ? description.trim() : "",
          date: new Date(date),
          categoryId,
          accountId: accountId || null,
          userId,
        },
        include: { category: true, account: true },
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

      const updated = await prisma.transaction.update({
        where: { id },
        data: {
          ...(amount !== undefined && { amount: typeof amount === "number" ? amount : parseFloat(amount) }),
          ...(type !== undefined && { type }),
          ...(description !== undefined && { description: description ? description.trim() : "" }),
          ...(date !== undefined && { date: new Date(date) }),
          ...(categoryId !== undefined && { categoryId }),
          ...(accountId !== undefined && { accountId: accountId || null }),
        },
        include: { category: true, account: true },
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

    await prisma.transaction.delete({ where: { id } })

    res.json({ success: true, message: "Deleted successfully" })
  } catch (error) {
    next(error)
  }
})

export default router
