"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const notification_1 = require("../lib/notification");
const router = (0, express_1.Router)();
// GET /api/goals - List all goals
router.get("/", async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const goals = await prisma_1.prisma.savingsGoal.findMany({
            where: { userId },
            orderBy: { targetDate: "asc" },
        });
        res.json(goals);
    }
    catch (error) {
        console.error("GET /goals error:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
});
// POST /api/goals - Create a new goal
router.post("/", async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const { name, targetAmount, currentAmount, targetDate, color, icon } = req.body;
        if (!name || !targetAmount || !targetDate) {
            res.status(400).json({ error: "Name, target amount, and target date are required" });
            return;
        }
        const goal = await prisma_1.prisma.savingsGoal.create({
            data: {
                name,
                targetAmount: parseFloat(targetAmount),
                currentAmount: parseFloat(currentAmount || 0),
                targetDate: new Date(targetDate),
                color: color || "#10B981",
                icon: icon || "🎯",
                userId,
            },
        });
        res.status(201).json(goal);
    }
    catch (error) {
        console.error("POST /goals error:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
});
// POST /api/goals/:id/deposit - Add or withdraw money from a goal
router.post("/:id/deposit", async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const { id } = req.params;
        const { amount, type } = req.body; // type: "deposit" | "withdraw"
        const parsedAmount = parseFloat(amount);
        if (!parsedAmount || parsedAmount <= 0) {
            res.status(400).json({ error: "Amount must be greater than 0" });
            return;
        }
        const existing = await prisma_1.prisma.savingsGoal.findUnique({ where: { id } });
        if (!existing || existing.userId !== userId) {
            res.status(404).json({ error: "Goal not found" });
            return;
        }
        const newAmount = type === "withdraw"
            ? Math.max(0, existing.currentAmount - parsedAmount)
            : existing.currentAmount + parsedAmount;
        const updated = await prisma_1.prisma.savingsGoal.update({
            where: { id },
            data: { currentAmount: newAmount },
        });
        // Check if milestone achieved
        if (type !== "withdraw" && newAmount >= existing.targetAmount) {
            await (0, notification_1.createNotification)({
                userId,
                message: `🎉 Congratulations! You reached your savings goal: "${existing.name}"!`,
                type: "success",
            });
        }
        res.json(updated);
    }
    catch (error) {
        console.error("POST /goals/:id/deposit error:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
});
// DELETE /api/goals/:id
router.delete("/:id", async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const { id } = req.params;
        const existing = await prisma_1.prisma.savingsGoal.findUnique({ where: { id } });
        if (!existing || existing.userId !== userId) {
            res.status(404).json({ error: "Goal not found" });
            return;
        }
        await prisma_1.prisma.savingsGoal.delete({ where: { id } });
        res.json({ message: "Goal deleted successfully" });
    }
    catch (error) {
        console.error("DELETE /goals/:id error:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
});
exports.default = router;
