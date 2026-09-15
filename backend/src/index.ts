import "dotenv/config"
import express from "express"
import cors from "cors"
import { authMiddleware } from "./middleware/auth"
import authRouter from "./routes/auth"
import userRouter from "./routes/user"
import transactionsRouter from "./routes/transactions"
import categoriesRouter from "./routes/categories"
import budgetRouter from "./routes/budget"
import analyticsRouter from "./routes/analytics"
import notificationsRouter from "./routes/notifications"
import subscriptionsRouter from "./routes/subscriptions"
import accountsRouter from "./routes/accounts"
import goalsRouter from "./routes/goals"
import { errorHandler } from "./middleware/errorHandler"
import { initCronJobs } from "./services/cron"

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
)
app.use(express.json())

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() })
})

// Public Auth routes
app.use("/api/auth", authRouter)
app.use("/api", authRouter)

// Protected routes
app.use("/api/user", authMiddleware, userRouter)
app.use("/api/transactions", authMiddleware, transactionsRouter)
app.use("/api/categories", authMiddleware, categoriesRouter)
app.use("/api/budget", authMiddleware, budgetRouter)
app.use("/api/analytics", authMiddleware, analyticsRouter)
app.use("/api/notifications", authMiddleware, notificationsRouter)
app.use("/api/subscriptions", authMiddleware, subscriptionsRouter)
app.use("/api/accounts", authMiddleware, accountsRouter)
app.use("/api/goals", authMiddleware, goalsRouter)

// 404 handler for undefined API routes
app.use("/api/*", (_req, res) => {
  res.status(404).json({ success: false, error: "API endpoint not found" })
})

// Centralized Error Handling Middleware
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`)
  initCronJobs()
})

export default app
