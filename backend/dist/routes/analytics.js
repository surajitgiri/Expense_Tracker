"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const router = (0, express_1.Router)();
// GET /api/analytics
router.get("/", async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const month = req.query.month || new Date().toISOString().slice(0, 7);
        const startDate = new Date(`${month}-01`);
        const endDate = new Date(new Date(`${month}-01`).setMonth(startDate.getMonth() + 1));
        // Total income vs expense
        const totals = await prisma_1.prisma.transaction.groupBy({
            by: ["type"],
            where: {
                userId,
                date: { gte: startDate, lt: endDate },
            },
            _sum: { amount: true },
        });
        // Spending by category
        const byCategory = await prisma_1.prisma.transaction.groupBy({
            by: ["categoryId"],
            where: {
                userId,
                type: "expense",
                date: { gte: startDate, lt: endDate },
            },
            _sum: { amount: true },
        });
        const categoryIds = byCategory.map((b) => b.categoryId);
        const categories = await prisma_1.prisma.category.findMany({
            where: { id: { in: categoryIds } },
        });
        const categoryData = byCategory.map((b) => {
            const cat = categories.find((c) => c.id === b.categoryId);
            return {
                name: cat?.name || "Unknown",
                color: cat?.color || "#6366f1",
                icon: cat?.icon || "📦",
                amount: b._sum.amount || 0,
            };
        });
        // Daily spending trend for the month
        const dailytransactions = await prisma_1.prisma.transaction.findMany({
            where: {
                userId,
                date: { gte: startDate, lt: endDate },
            },
            select: { amount: true, type: true, date: true },
            orderBy: { date: "asc" },
        });
        // Group by day
        const dailyMap = {};
        dailytransactions.forEach((t) => {
            const day = t.date.toISOString().slice(0, 10);
            if (!dailyMap[day])
                dailyMap[day] = { income: 0, expense: 0 };
            if (t.type === "income")
                dailyMap[day].income += t.amount;
            else
                dailyMap[day].expense += t.amount;
        });
        const dailyData = Object.entries(dailyMap).map(([date, values]) => ({
            date,
            ...values,
        }));
        res.json({
            totals,
            categoryData,
            dailyData,
        });
    }
    catch (error) {
        console.error("GET /analytics error:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
});
exports.default = router;
