import { Router, Response } from "express"
import bcrypt from "bcrypt"
import { prisma } from "../lib/prisma"
import { AuthenticatedRequest } from "../middleware/auth"

const router = Router()

// GET /api/user
router.get("/", async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" })
      return
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        theme: true,
        _count: {
          select: {
            transaction: true,
            budgets: true,
            categories: true,
          },
        },
      },
    })

    if (!user) {
      res.status(404).json({ error: "User not found" })
      return
    }

    res.json(user)
  } catch (error) {
    console.error("GET /user error:", error)
    res.status(500).json({ error: "Something went wrong" })
  }
})

// PATCH /api/user
router.patch("/", async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" })
      return
    }

    const { name, email, theme, currentPassword, newPassword } = req.body

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      res.status(404).json({ error: "User not found" })
      return
    }

    if (newPassword) {
      if (!currentPassword) {
        res.status(400).json({
          error: "Current password is required to set a new password",
        })
        return
      }

      const isValid = await bcrypt.compare(currentPassword, user.password)
      if (!isValid) {
        res.status(400).json({ error: "Current password is incorrect" })
        return
      }

      if (newPassword.length < 6) {
        res
          .status(400)
          .json({ error: "New Password length should be greater than 6" })
        return
      }
    }

    if (email && email !== user.email) {
      const emailTaken = await prisma.user.findUnique({ where: { email } })
      if (emailTaken) {
        res.status(400).json({ error: "Email already exists" })
        return
      }
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(theme && { theme }),
        ...(newPassword && {
          password: await bcrypt.hash(newPassword, 10),
        }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        theme: true,
      },
    })

    res.json(updated)
  } catch (error) {
    console.error("PATCH /user error:", error)
    res.status(500).json({ error: "Something went wrong" })
  }
})

// DELETE /api/user
router.delete("/", async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" })
      return
    }

    await prisma.transaction.deleteMany({ where: { userId } })
    await prisma.budget.deleteMany({ where: { userId } })
    await prisma.category.deleteMany({ where: { userId } })
    await prisma.notification.deleteMany({ where: { userId } })
    await prisma.user.delete({ where: { id: userId } })

    res.json({ message: "Account deleted successfully" })
  } catch (error) {
    console.error("DELETE /user error:", error)
    res.status(500).json({ error: "Something went wrong" })
  }
})

export default router
