import { Router, Response } from "express"
import { prisma } from "../lib/prisma"
import { AuthenticatedRequest } from "../middleware/auth"

const router = Router()

// GET /api/accounts - List all accounts with summary metrics
router.get("/", async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" })
            return
        }

        const accounts = await prisma.account.findMany({
            where: { userId },
            orderBy: { createdAt: "asc" },
        })

        const netWorth = accounts.reduce((sum, acc) => {
            // Subtract credit card debt from net worth
            return acc.type === "Credit Card" ? sum - acc.balance : sum + acc.balance
        }, 0)

        const bankBalance = accounts
            .filter((a) => a.type === "Bank" || a.type === "Savings")
            .reduce((sum, a) => sum + a.balance, 0)

        const cashBalance = accounts
            .filter((a) => a.type === "Cash")
            .reduce((sum, a) => sum + a.balance, 0)

        res.json({ accounts, netWorth, bankBalance, cashBalance })
    } catch (error) {
        console.error("GET /accounts error:", error)
        res.status(500).json({ error: "Something went wrong" })
    }
})

// POST /api/accounts - Create a new account
router.post("/", async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" })
            return
        }

        const { name, type, balance, color } = req.body

        if (!name || !type) {
            res.status(400).json({ error: "Name and type are required" })
            return
        }

        const account = await prisma.account.create({
            data: {
                name,
                type,
                balance: parseFloat(balance || 0),
                color: color || "#4F46E5",
                userId,
            },
        })

        res.status(201).json(account)
    } catch (error) {
        console.error("POST /accounts error:", error)
        res.status(500).json({ error: "Something went wrong" })
    }
})

// PATCH /api/accounts/:id - Update account
router.patch("/:id", async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" })
            return
        }

        const { id } = req.params
        const { name, type, balance, color } = req.body

        const existing = await prisma.account.findUnique({ where: { id } })
        if (!existing || existing.userId !== userId) {
            res.status(404).json({ error: "Account not found" })
            return
        }

        const updated = await prisma.account.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(type && { type }),
                ...(balance !== undefined && { balance: parseFloat(balance) }),
                ...(color && { color }),
            },
        })

        res.json(updated)
    } catch (error) {
        console.error("PATCH /accounts/:id error:", error)
        res.status(500).json({ error: "Something went wrong" })
    }
})

// DELETE /api/accounts/:id
router.delete("/:id", async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" })
            return
        }

        const { id } = req.params
        const existing = await prisma.account.findUnique({ where: { id } })
        if (!existing || existing.userId !== userId) {
            res.status(404).json({ error: "Account not found" })
            return
        }

        await prisma.account.delete({ where: { id } })
        res.json({ message: "Account deleted successfully" })
    } catch (error) {
        console.error("DELETE /accounts/:id error:", error)
        res.status(500).json({ error: "Something went wrong" })
    }
})

export default router
