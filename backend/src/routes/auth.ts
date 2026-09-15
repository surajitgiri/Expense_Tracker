import { Router, Request, Response } from "express"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { prisma } from "../lib/prisma"
import { generateToken, hashToken } from "../lib/token"
import { sendVerificationEmail, sendForgotPassWordEmail } from "../lib/mail"
import { authLimiter } from "../middleware/rateLimiter"

const router = Router()

const getJwtSecret = () =>
  process.env.JWT_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  "expense_tracker_secret_key"

// POST /api/auth/login
router.post("/login", authLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      res.status(400).json({ error: "Missing credentials" })
      return
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      res.status(400).json({ error: "User not found" })
      return
    }

    if (!user.isVerified) {
      res
        .status(403)
        .json({ error: "please verify your email before logging in" })
      return
    }

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      res.status(400).json({ error: "Invalid password" })
      return
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      getJwtSecret(),
      { expiresIn: "30d" }
    )

    res.cookie("token", token, {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: false,
      sameSite: "lax",
      path: "/",
    })

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    })
  } catch (error) {
    console.error("POST /auth/login error:", error)
    res.status(500).json({ error: "Something went wrong" })
  }
})

// POST /api/auth/register or /api/register
router.post("/register", authLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body

    if (!email || !password || !name) {
      res.status(400).json({ error: "Missing fields" })
      return
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      res.status(400).json({ error: "User already exists" })
      return
    }

    const hashedpass = await bcrypt.hash(password, 10)

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedpass,
        name,
      },
    })

    const rawToken = generateToken()
    const hashedToken = hashToken(rawToken)

    await prisma.user.update({
      where: { id: newUser.id },
      data: {
        verifyToken: hashedToken,
        verifyTokenExpiry: new Date(Date.now() + 60 * 60 * 1000),
      },
    })

    try {
      await sendVerificationEmail(newUser.email, rawToken)
    } catch (mailError) {
      console.error("Email sending failed:", mailError)
    }

    res.status(201).json({
      message: "Registration successful! Please check your email to verify.",
    })
  } catch (error) {
    console.error("POST /register error:", error)
    res.status(500).json({ error: "Something went wrong" })
  }
})

// GET /api/auth/verify-email
router.get("/verify-email", async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.query.token as string

    if (!token) {
      res.status(400).json({ error: "Token is missing" })
      return
    }

    const hashedToken = hashToken(token)

    const user = await prisma.user.findFirst({
      where: {
        verifyToken: hashedToken,
      },
    })

    if (!user) {
      res.status(400).json({ error: "Invalid token" })
      return
    }

    if (!user.verifyTokenExpiry || user.verifyTokenExpiry < new Date()) {
      res
        .status(400)
        .json({ error: "Token has expired. Please register again" })
      return
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verifyToken: null,
        verifyTokenExpiry: null,
      },
    })

    res.json({ message: "Email verified successfully" })
  } catch (error) {
    console.error("Verify email error:", error)
    res.status(500).json({ error: "Something went wrong" })
  }
})

// POST /api/auth/forgot-password
router.post("/forgot-password", authLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body

    if (!email) {
      res.status(400).json({ error: "Email is required" })
      return
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      res.status(200).json({
        message: "If this email exists, a reset link has been sent",
      })
      return
    }

    const rawToken = generateToken()
    const hashedToken = hashToken(rawToken)

    await prisma.user.update({
      where: { email },
      data: {
        resetToken: hashedToken,
        resetTokenExpiry: new Date(Date.now() + 30 * 60 * 1000),
      },
    })

    try {
      await sendForgotPassWordEmail(email, rawToken)
    } catch (mailError) {
      console.error("Email sending failed:", mailError)
    }

    res.status(200).json({
      message: "If this email exists, a reset link has been sent.",
    })
  } catch (error) {
    console.error("Forgot password error:", error)
    res.status(500).json({ error: "Something went wrong" })
  }
})

// POST /api/auth/reset-password
router.post("/reset-password", async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, password } = req.body

    if (!token || !password) {
      res.status(400).json({ error: "password and token are required" })
      return
    }

    if (password.length < 6) {
      res
        .status(400)
        .json({ error: "password must contain at least 6 characters" })
      return
    }

    const hashedToken = hashToken(token)

    const user = await prisma.user.findFirst({
      where: {
        resetToken: hashedToken,
      },
    })

    if (!user) {
      res.status(400).json({ error: "Invalid token" })
      return
    }

    if (!user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      res
        .status(400)
        .json({ error: "Token has Expired. please request a new one." })
      return
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    })

    res.status(200).json({ message: "Password reset successfully" })
  } catch (error) {
    console.error("Reset password error:", error)
    res.status(500).json({ error: "Something went wrong" })
  }
})

export default router
