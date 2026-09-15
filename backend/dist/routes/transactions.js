"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const notification_1 = require("../lib/notification");
const validate_1 = require("../middleware/validate");
const transaction_schema_1 = require("../schemas/transaction.schema");
const router = (0, express_1.Router)();
// GET /api/transactions
router.get("/", async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const category = req.query.category;
        const type = req.query.type;
        const month = req.query.month;
        const transactions = await prisma_1.prisma.transaction.findMany({
            where: {
                userId,
                ...(category && { categoryId: category }),
                ...(type && { type }),
                ...(month && {
                    date: {
                        gte: new Date(`${month}-01`),
                        lte: new Date(new Date(`${month}-01`).setMonth(new Date(`${month}-01`).getMonth() + 1)),
                    },
                }),
            },
            include: { category: true },
            orderBy: { date: "desc" },
        });
        res.json(transactions);
    }
    catch (error) {
        next(error);
    }
});
// POST /api/transactions
router.post("/", (0, validate_1.validate)(transaction_schema_1.createTransactionSchema), async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ success: false, error: "Unauthorized" });
            return;
        }
        const { amount, type, description, date, categoryId, accountId } = req.body;
        const transaction = await prisma_1.prisma.transaction.create({
            data: {
                amount: typeof amount === "number" ? amount : parseFloat(amount),
                type,
                description,
                date: new Date(date),
                categoryId,
                accountId: accountId || null,
                userId,
            },
            include: { category: true, account: true },
        });
        await (0, notification_1.createNotification)({
            userId,
            message: "Transaction added successfully",
            type: "success",
        });
        res.status(201).json(transaction);
    }
    catch (error) {
        next(error);
    }
});
// PUT /api/transactions
router.put("/", (0, validate_1.validate)(transaction_schema_1.updateTransactionSchema), async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ success: false, error: "Unauthorized" });
            return;
        }
        const { id, amount, type, description, date, categoryId, accountId } = req.body;
        const existing = await prisma_1.prisma.transaction.findUnique({ where: { id } });
        if (!existing || existing.userId !== userId) {
            res.status(404).json({ success: false, error: "Transaction not found" });
            return;
        }
        const updated = await prisma_1.prisma.transaction.update({
            where: { id },
            data: {
                ...(amount !== undefined && { amount: typeof amount === "number" ? amount : parseFloat(amount) }),
                ...(type !== undefined && { type }),
                ...(description !== undefined && { description }),
                ...(date !== undefined && { date: new Date(date) }),
                ...(categoryId !== undefined && { categoryId }),
                ...(accountId !== undefined && { accountId: accountId || null }),
            },
            include: { category: true, account: true },
        });
        res.json(updated);
    }
    catch (error) {
        next(error);
    }
});
// DELETE /api/transactions
router.delete("/", async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ success: false, error: "Unauthorized" });
            return;
        }
        const id = req.query.id;
        if (!id) {
            res.status(400).json({ success: false, error: "Missing transaction id" });
            return;
        }
        const existing = await prisma_1.prisma.transaction.findUnique({ where: { id } });
        if (!existing || existing.userId !== userId) {
            res.status(404).json({ success: false, error: "Transaction not found" });
            return;
        }
        await prisma_1.prisma.transaction.delete({ where: { id } });
        res.json({ success: true, message: "Deleted successfully" });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
