import { Router, Response } from "express"
import { prisma } from "../lib/prisma"
import { AuthenticatedRequest } from "../middleware/auth"

const router = Router()

// GET /api/categories
router.get("/", async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" })
      return
    }

    const categories = await prisma.category.findMany({
      where: { userId },
      orderBy: { name: "asc" },
    })

    res.json(categories)
  } catch (error) {
    console.error("GET /categories error:", error)
    res.status(500).json({ error: "Something went wrong" })
  }
})

// POST /api/categories
router.post("/", async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" })
      return
    }

    const { name, color, icon } = req.body

    if (!name || !color) {
      res.status(400).json({ error: "Name and color are required" })
      return
    }

    const existing = await prisma.category.findFirst({
      where: { name, userId },
    })

    if (existing) {
      res.status(400).json({ error: "Category already exists" })
      return
    }

    const category = await prisma.category.create({
      data: {
        name,
        color,
        icon: icon || "📦",
        userId,
      },
    })

    res.status(201).json(category)
  } catch (error) {
    console.error("POST /categories error:", error)
    res.status(500).json({ error: "Something went wrong" })
  }
})

// PATCH /api/categories
router.patch("/", async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" })
      return
    }

    const { id, name, color, icon } = req.body

    if (!id) {
      res.status(400).json({ error: "Missing category id" })
      return
    }

    const existing = await prisma.category.findUnique({ where: { id } })
    if (!existing || existing.userId !== userId) {
      res.status(404).json({ error: "Not found" })
      return
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(color && { color }),
        ...(icon && { icon }),
      },
    })

    res.json(updated)
  } catch (error) {
    console.error("PATCH /categories error:", error)
    res.status(500).json({ error: "Something went wrong" })
  }
})

// DELETE /api/categories
router.delete("/", async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" })
      return
    }

    const id = req.query.id as string | undefined
    if (!id) {
      res.status(400).json({ error: "Missing category id" })
      return
    }

    const existing = await prisma.category.findUnique({
      where: { id },
    })

    if (!existing || existing.userId !== userId) {
      res.status(404).json({ error: "Not found" })
      return
    }

    const transactionCount = await prisma.transaction.count({
      where: { categoryId: id },
    })

    if (transactionCount > 0) {
      res.status(400).json({
        error: `Cannot delete - this category has ${transactionCount} transaction`,
      })
      return
    }

    await prisma.category.delete({
      where: { id },
    })

    res.json({ message: "Category deleted successfully" })
  } catch (error) {
    console.error("DELETE /categories error:", error)
    res.status(500).json({ error: "Something went wrong" })
  }
})

export default router
