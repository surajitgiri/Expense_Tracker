import { z } from "zod"

export const createTransactionSchema = z.object({
  amount: z.coerce
    .number({ invalid_type_error: "Amount must be a number" })
    .positive("Amount must be a positive number"),
  type: z.enum(["income", "expense"], {
    errorMap: () => ({ message: "Type must be either 'income' or 'expense'" }),
  }),
  description: z
    .string()
    .trim()
    .optional()
    .default(""),
  date: z
    .string({ required_error: "Date is required" })
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Date must be a valid ISO date string",
    }),
  categoryId: z
    .string({ required_error: "Category ID is required" })
    .min(1, "Category ID cannot be empty"),
  accountId: z.string().optional().nullable(),
})

export const updateTransactionSchema = z.object({
  id: z
    .string({ required_error: "Transaction ID is required" })
    .min(1, "Transaction ID cannot be empty"),
  amount: z.coerce
    .number({ invalid_type_error: "Amount must be a number" })
    .positive("Amount must be a positive number")
    .optional(),
  type: z.enum(["income", "expense"], {
    errorMap: () => ({ message: "Type must be either 'income' or 'expense'" }),
  }).optional(),
  description: z
    .string()
    .trim()
    .optional(),
  date: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Date must be a valid ISO date string",
    })
    .optional(),
  categoryId: z.string().min(1).optional(),
  accountId: z.string().optional().nullable(),
})

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>
