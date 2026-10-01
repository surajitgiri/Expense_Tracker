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
  categoryId: z.string().optional().nullable(),
  accountId: z.string().optional().nullable(),
}).superRefine((data, ctx) => {
  // Category is required only for expense transactions
  if (data.type === "expense" && !data.categoryId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Category is required for expense transactions",
      path: ["categoryId"],
    })
  }
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
