"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const router = (0, express_1.Router)();
// GET /api/notifications
router.get("/", async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const notifications = await prisma_1.prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: 10,
        });
        res.json(notifications);
    }
    catch (error) {
        console.error("GET /notifications error:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
});
// PATCH /api/notifications
router.patch("/", async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const { id } = req.body;
        if (!id) {
            await prisma_1.prisma.notification.updateMany({
                where: { userId, isRead: false },
                data: { isRead: true },
            });
        }
        else {
            await prisma_1.prisma.notification.update({
                where: { id, userId },
                data: { isRead: true },
            });
        }
        res.json({ success: true });
    }
    catch (error) {
        console.error("PATCH /notifications error:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
});
// POST /api/notifications/test-digest
// Triggers an immediate monthly financial digest email for testing
router.post("/test-digest", async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ success: false, error: "Unauthorized" });
            return;
        }
        const { generateAndSendDigestForUser } = await Promise.resolve().then(() => __importStar(require("../services/monthlyDigest")));
        const result = await generateAndSendDigestForUser(userId);
        if (!result.success) {
            res.status(400).json({ success: false, error: result.error });
            return;
        }
        res.json({
            success: true,
            message: "Monthly Financial Digest email has been sent successfully!",
            digest: result.data,
        });
    }
    catch (error) {
        console.error("POST /notifications/test-digest error:", error);
        res.status(500).json({ success: false, error: error?.message || "Something went wrong" });
    }
});
exports.default = router;
