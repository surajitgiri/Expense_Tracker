"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_1 = require("./middleware/auth");
const auth_2 = __importDefault(require("./routes/auth"));
const user_1 = __importDefault(require("./routes/user"));
const transactions_1 = __importDefault(require("./routes/transactions"));
const categories_1 = __importDefault(require("./routes/categories"));
const budget_1 = __importDefault(require("./routes/budget"));
const analytics_1 = __importDefault(require("./routes/analytics"));
const notifications_1 = __importDefault(require("./routes/notifications"));
const subscriptions_1 = __importDefault(require("./routes/subscriptions"));
const accounts_1 = __importDefault(require("./routes/accounts"));
const goals_1 = __importDefault(require("./routes/goals"));
const errorHandler_1 = require("./middleware/errorHandler");
const cron_1 = require("./services/cron");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
}));
app.use(express_1.default.json());
// Health check
app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});
// Public Auth routes
app.use("/api/auth", auth_2.default);
app.use("/api", auth_2.default);
// Protected routes
app.use("/api/user", auth_1.authMiddleware, user_1.default);
app.use("/api/transactions", auth_1.authMiddleware, transactions_1.default);
app.use("/api/categories", auth_1.authMiddleware, categories_1.default);
app.use("/api/budget", auth_1.authMiddleware, budget_1.default);
app.use("/api/analytics", auth_1.authMiddleware, analytics_1.default);
app.use("/api/notifications", auth_1.authMiddleware, notifications_1.default);
app.use("/api/subscriptions", auth_1.authMiddleware, subscriptions_1.default);
app.use("/api/accounts", auth_1.authMiddleware, accounts_1.default);
app.use("/api/goals", auth_1.authMiddleware, goals_1.default);
// 404 handler for undefined API routes
app.use("/api/*", (_req, res) => {
    res.status(404).json({ success: false, error: "API endpoint not found" });
});
// Centralized Error Handling Middleware
app.use(errorHandler_1.errorHandler);
app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
    (0, cron_1.initCronJobs)();
});
exports.default = app;
