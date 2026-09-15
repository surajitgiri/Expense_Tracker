"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function parseCookie(cookieHeader) {
    const list = {};
    if (!cookieHeader)
        return list;
    cookieHeader.split(";").forEach((cookie) => {
        const parts = cookie.split("=");
        const key = parts[0]?.trim();
        const val = parts.slice(1).join("=").trim();
        if (key)
            list[key] = decodeURIComponent(val);
    });
    return list;
}
function authMiddleware(req, res, next) {
    try {
        let token;
        // 1. Check Authorization header
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1];
        }
        // 2. Check Cookie header
        if (!token && req.headers.cookie) {
            const cookies = parseCookie(req.headers.cookie);
            token = cookies["token"];
        }
        if (!token) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const secret = process.env.JWT_SECRET ||
            process.env.NEXTAUTH_SECRET ||
            "expense_tracker_secret_key";
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        if (!decoded || !decoded.id) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(401).json({ error: "Unauthorized" });
    }
}
