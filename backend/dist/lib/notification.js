"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotification = createNotification;
const prisma_1 = require("./prisma");
async function createNotification({ userId, message, type = "info" }) {
    return prisma_1.prisma.notification.create({
        data: {
            userId,
            message,
            type,
        },
    });
}
