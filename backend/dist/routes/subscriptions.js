"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const notification_1 = require("../lib/notification");
const router = (0, express_1.Router)();
// Helper: Calculate next due date according to frequency
function getNextDueDate(currentDue, frequency) {
    const next = new Date(currentDue);
    if (frequency === "weekly") {
        next.setDate(next.getDate() + 7);
    }
    else if (frequency === "yearly") {
        next.setFullYear(next.getFullYear() + 1);
    }
    else {
        // Default: monthly
        next.setMonth(next.getMonth() + 1);
    }
    return next;
}
// Helper: Auto-create transactions for due subscriptions
async function processDueSubscriptions(userId) {
    const now = new Date();
    const dueSubs = await prisma_1.prisma.subscription.findMany({
        where: {
            userId,
            isActive: true,
            nextDueDate: { lte: now }
        },
        include: { category: true },
    });
    for (const sub of dueSubs) {
        let currentDue = new Date(sub.nextDueDate);
        // In case the server was down or multiple cycles were missed
        while (currentDue <= now) {
            await prisma_1.prisma.transaction.create({
                data: {
                    amount: sub.amount,
                    type: "expense",
                    description: `Subscription: ${sub.name}`,
                    date: currentDue,
                    categoryId: sub.categoryId,
                    userId: sub.userId,
                },
            });
            await (0, notification_1.createNotification)({
                userId: sub.userId,
                message: `Renewed subscription: ${sub.name}($${sub.amount.toFixed(2)})`,
                type: "info",
            });
            currentDue = getNextDueDate(currentDue, sub.frequency);
        }
        // Update the subscription's next due date
        await prisma_1.prisma.subscription.update({
            where: { id: sub.id },
            data: { nextDueDate: currentDue },
        });
    }
}
// GET /api/subscriptions - List all subscriptions (triggers auto-billing first)
router.get("/", async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        await processDueSubscriptions(userId);
        const subscriptions = await prisma_1.prisma.subscription.findMany({
            where: { userId },
            include: { category: true },
            orderBy: { nextDueDate: "asc" },
        });
        res.json(subscriptions);
    }
    catch (error) {
        console.error("GET /subscriptions error:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
});
// POST /api/subscriptions - Create a new subscription
router.post("/", async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const { name, amount, frequency, categoryId, startDate } = req.body;
        if (!name || !amount || !frequency || !categoryId || !startDate) {
            res.status(400).json({ error: "Missing required fields" });
            return;
        }
        const parsedAmount = parseFloat(amount);
        if (parsedAmount <= 0) {
            res.status(400).json({ error: "Amount must be greater than 0" });
            return;
        }
        const parsedStart = new Date(startDate);
        let nextDue = new Date(parsedStart);
        const now = new Date();
        // If start date is in the past, calculate initial next due date
        while (nextDue < now) {
            nextDue = getNextDueDate(nextDue, frequency);
        }
        const subscription = await prisma_1.prisma.subscription.create({
            data: {
                name,
                amount: parsedAmount,
                frequency,
                startDate: parsedStart,
                nextDueDate: nextDue,
                categoryId,
                userId,
            },
            include: { category: true },
        });
        res.status(201).json(subscription);
    }
    catch (error) {
        console.error("POST /subscriptions error:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
});
// PATCH /api/subscriptions/:id - Update or toggle active status
router.patch("/:id", async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const { id } = req.params;
        const { name, amount, frequency, categoryId, isActive } = req.body;
        const existing = await prisma_1.prisma.subscription.findUnique({ where: { id } });
        if (!existing || existing.userId !== userId) {
            res.status(404).json({ error: "Subscription not found" });
            return;
        }
        const updated = await prisma_1.prisma.subscription.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(amount && { amount: parseFloat(amount) }),
                ...(frequency && { frequency }),
                ...(categoryId && { categoryId }),
                ...(typeof isActive === "boolean" && { isActive }),
            },
            include: { category: true },
        });
        res.json(updated);
    }
    catch (error) {
        console.error("PATCH /subscriptions/:id error:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
});
router.delete("/:id", async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const { id } = req.params;
        const existing = await prisma_1.prisma.subscription.findUnique({ where: { id } });
        if (!existing || existing.userId !== userId) {
            res.status(404).json({ error: "Subscription not found" });
            return;
        }
        await prisma_1.prisma.subscription.delete({ where: { id } });
        res.json({ message: "Subscription deleted successfully" });
    }
    catch (error) {
        console.error("DELETE /subscriptions/:id error:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
});
exports.default = router;
