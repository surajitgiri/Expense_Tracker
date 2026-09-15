import { Request, Response, NextFunction } from "express"
import { AnyZodObject, ZodError } from "zod"

export const validate =
  (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync(req.body)
      req.body = parsed
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        const firstIssue = error.errors[0]?.message || "Invalid input data"
        res.status(400).json({
          success: false,
          error: firstIssue,
        })
        return
      }
      next(error)
    }
  }
