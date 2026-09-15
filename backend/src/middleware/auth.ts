import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"

export interface AuthenticatedUser {
  id: string
  email: string
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser
}

function parseCookie(cookieHeader?: string): Record<string, string> {
  const list: Record<string, string> = {}
  if (!cookieHeader) return list

  cookieHeader.split(";").forEach((cookie) => {
    const parts = cookie.split("=")
    const key = parts[0]?.trim()
    const val = parts.slice(1).join("=").trim()
    if (key) list[key] = decodeURIComponent(val)
  })

  return list
}

export function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    let token: string | undefined

    // 1. Check Authorization header
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1]
    }

    // 2. Check Cookie header
    if (!token && req.headers.cookie) {
      const cookies = parseCookie(req.headers.cookie)
      token = cookies["token"]
    }

    if (!token) {
      res.status(401).json({ error: "Unauthorized" })
      return
    }

    const secret =
      process.env.JWT_SECRET ||
      process.env.NEXTAUTH_SECRET ||
      "expense_tracker_secret_key"

    const decoded = jwt.verify(token, secret) as AuthenticatedUser

    if (!decoded || !decoded.id) {
      res.status(401).json({ error: "Unauthorized" })
      return
    }

    req.user = decoded
    next()
  } catch (error) {
    res.status(401).json({ error: "Unauthorized" })
  }
}
