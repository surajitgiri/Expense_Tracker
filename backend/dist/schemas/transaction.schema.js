"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTransactionSchema = exports.createTransactionSchema = void 0;
const zod_1 = require("zod");
exports.createTransactionSchema = zod_1.z.object({
    amount: zod_1.z.coerce
        .number({ invalid_type_error: "Amount must be a number" })
        .positive("Amount must be a positive number"),
    type: zod_1.z.enum(["income", "expense"], {
        errorMap: () => ({ message: "Type must be either 'income' or 'expense'" }),
    }),
    description: zod_1.z
        .string()
        .trim()
        .optional()
        .default(""),
    date: zod_1.z
        .string({ required_error: "Date is required" })
        .refine((val) => !isNaN(Date.parse(val)), {
        message: "Date must be a valid ISO date string",
    }),
    categoryId: zod_1.z.string().optional().nullable(),
    accountId: zod_1.z.string().optional().nullable(),
}).superRefine((data, ctx) => {
    // Category is required only for expense transactions
    if (data.type === "expense" && !data.categoryId) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            message: "Category is required for expense transactions",
            path: ["categoryId"],
        });
    }
});
exports.updateTransactionSchema = zod_1.z.object({
    id: zod_1.z
        .string({ required_error: "Transaction ID is required" })
        .min(1, "Transaction ID cannot be empty"),
    amount: zod_1.z.coerce
        .number({ invalid_type_error: "Amount must be a number" })
        .positive("Amount must be a positive number")
        .optional(),
    type: zod_1.z.enum(["income", "expense"], {
        errorMap: () => ({ message: "Type must be either 'income' or 'expense'" }),
    }).optional(),
    description: zod_1.z
        .string()
        .trim()
        .optional(),
    date: zod_1.z
        .string()
        .refine((val) => !isNaN(Date.parse(val)), {
        message: "Date must be a valid ISO date string",
    })
        .optional(),
    categoryId: zod_1.z.string().min(1).optional(),
    accountId: zod_1.z.string().optional().nullable(),
});
