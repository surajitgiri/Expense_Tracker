import { Router, Response } from "express"
import { prisma } from "../lib/prisma"
import { AuthenticatedRequest } from "../middleware/auth"

const router = Router()

// GET /api/notifications
router.get("/", async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" })
      return
    }

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    })

    res.json(notifications)
  } catch (error) {
    console.error("GET /notifications error:", error)
    res.status(500).json({ error: "Something went wrong" })
  }
})

// PATCH /api/notifications
router.patch("/", async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" })
      return
    }

    const { id } = req.body

    if (!id) {
      await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      })
    } else {
      await prisma.notification.update({
        where: { id, userId },
        data: { isRead: true },
      })
    }

    res.json({ success: true })
  } catch (error) {
    console.error("PATCH /notifications error:", error)
    res.status(500).json({ error: "Something went wrong" })
  }
})

// POST /api/notifications/test-digest
// Triggers an immediate monthly financial digest email for testing
router.post("/test-digest", async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id
    if (!userId) {
      res.status(401).json({ success: false, error: "Unauthorized" })
      return
    }

    const { generateAndSendDigestForUser } = await import("../services/monthlyDigest")
    const result = await generateAndSendDigestForUser(userId)

    if (!result.success) {
      res.status(400).json({ success: false, error: result.error })
      return
    }

    res.json({
      success: true,
      message: "Monthly Financial Digest email has been sent successfully!",
      digest: result.data,
    })
  } catch (error: any) {
    console.error("POST /notifications/test-digest error:", error)
    res.status(500).json({ success: false, error: error?.message || "Something went wrong" })
  }
})

export default router

