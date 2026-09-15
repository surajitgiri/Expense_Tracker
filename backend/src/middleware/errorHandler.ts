import { Request, Response, NextFunction, ErrorRequestHandler } from "express"
import { ZodError } from "zod"

export class AppError extends Error {
  statusCode: number
  isOperational: boolean

  constructor(message: string, statusCode = 400) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true
    Error.captureStackTrace(this, this.constructor)
  }
}

export const errorHandler: ErrorRequestHandler = (
  err: any,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  if (res.headersSent) {
    return next(err)
  }

  // 1. Zod Validation Errors
  if (err instanceof ZodError) {
    const message = err.errors[0]?.message || "Validation failed"
    res.status(400).json({
      success: false,
      error: message,
    })
    return
  }

  // 2. Custom Application Errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
    })
    return
  }

  // 3. Prisma Known Request Errors
  if (err.code === "P2002") {
    res.status(409).json({
      success: false,
      error: "A record with this information already exists.",
    })
    return
  }

  if (err.code === "P2025") {
    res.status(404).json({
      success: false,
      error: "Requested record was not found.",
    })
    return
  }

  if (err.code === "P2003") {
    res.status(400).json({
      success: false,
      error: "Invalid reference to a related record.",
    })
    return
  }

  // 4. Fallback / Unexpected Server Errors
  console.error("Unhandled Server Error:", err)
  const statusCode = typeof err.statusCode === "number" && err.statusCode >= 400 ? err.statusCode : 500
  const message =
    statusCode >= 500
      ? "An unexpected internal server error occurred."
      : err.message || "Something went wrong."

  res.status(statusCode).json({
    success: false,
    error: message,
  })
}
