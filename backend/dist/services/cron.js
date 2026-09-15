"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initCronJobs = initCronJobs;
const node_cron_1 = __importDefault(require("node-cron"));
const monthlyDigest_1 = require("./monthlyDigest");
function initCronJobs() {
    // Schedule: At 09:00 AM on the 1st day of every month: "0 9 1 * *"
    node_cron_1.default.schedule("0 9 1 * *", async () => {
        console.log("🗓️ [Cron] 1st of the month: Dispatching Monthly Financial Digests...");
        try {
            await (0, monthlyDigest_1.sendMonthlyDigestsToAllUsers)();
        }
        catch (err) {
            console.error("[Cron] Error running monthly digest job:", err);
        }
    });
    console.log("⏰ Cron jobs initialized (Monthly Financial Digest scheduled for 1st of every month at 09:00 AM)");
}
