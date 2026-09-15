"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const notification_1 = require("../lib/notification");
const router = (0, express_1.Router)();
// GET /api/budget
router.get("/", async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const month = req.query.month || new Date().toISOString().slice(0, 7);
        const budgets = await prisma_1.prisma.budget.findMany({
            where: {
                userId,
                month,
            },
            include: { category: true },
            orderBy: { category: { name: "asc" } },
        });
        const budgetWithSpent = await Promise.all(budgets.map(async (budget) => {
            const spent = await prisma_1.prisma.transaction.aggregate({
                where: {
                    userId,
                    categoryId: budget.categoryId,
                    type: "expense",
                    date: {
                        gte: new Date(`${month}-01`),
                        lt: new Date(new Date(`${month}-01`).setMonth(new Date(`${month}-01`).getMonth() + 1)),
                    },
                },
                _sum: { amount: true },
            });
            const spentamount = spent._sum.amount || 0;
            if (spentamount > budget.limit) {
                await (0, notification_1.createNotification)({
                    userId,
                    message: `You exceeded your budget for ${budget.category.name}`,
                    type: "warning",
                });
            }
            return {
                ...budget,
                spent: spentamount,
                remaining: budget.limit - spentamount,
                percentage: Math.min((spentamount / budget.limit) * 100, 100),
            };
        }));
        res.json(budgetWithSpent);
    }
    catch (error) {
        console.error("GET /budget error:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
});
// POST /api/budget
router.post("/", async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const { categoryId, limit, month } = req.body;
        if (!categoryId || !limit || !month) {
            res.status(400).json({ error: "Missing fields" });
            return;
        }
        const numLimit = parseFloat(limit);
        if (numLimit <= 0) {
            res.status(400).json({ error: "Limit must be greater than 0" });
            return;
        }
        const existing = await prisma_1.prisma.budget.findFirst({
            where: {
                userId,
                categoryId,
                month,
            },
        });
        if (existing) {
            res.status(400).json({
                error: "Budget already exists for this category and month",
            });
            return;
        }
        const budget = await prisma_1.prisma.budget.create({
            data: {
                categoryId,
                limit: numLimit,
                month,
                userId,
            },
        });
        res.status(201).json(budget);
    }
    catch (error) {
        console.error("POST /budget error:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
});
// PATCH /api/budget
router.patch("/", async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const { id, limit } = req.body;
        if (!id || !limit) {
            res.status(400).json({ error: "Missing fields" });
            return;
        }
        const numLimit = parseFloat(limit);
        if (numLimit <= 0) {
            res.status(400).json({ error: "Limit must be greater than 0" });
            return;
        }
        const existing = await prisma_1.prisma.budget.findUnique({ where: { id } });
        if (!existing || existing.userId !== userId) {
            res.status(404).json({ error: "Not found" });
            return;
        }
        const updated = await prisma_1.prisma.budget.update({
            where: { id },
            data: { limit: numLimit },
            include: { category: true },
        });
        res.json(updated);
    }
    catch (error) {
        console.error("PATCH /budget error:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
});
// DELETE /api/budget
router.delete("/", async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const id = req.query.id;
        if (!id) {
            res.status(400).json({ error: "missing budget id" });
            return;
        }
        const existing = await prisma_1.prisma.budget.findUnique({ where: { id } });
        if (!existing || existing.userId !== userId) {
            res.status(404).json({ error: "Not found" });
            return;
        }
        await prisma_1.prisma.budget.delete({ where: { id } });
        res.json({ message: "Budget deleted successfully" });
    }
    catch (error) {
        console.error("DELETE /budget error:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
});
exports.default = router;
