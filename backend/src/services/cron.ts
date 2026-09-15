import cron from "node-cron"
import { sendMonthlyDigestsToAllUsers } from "./monthlyDigest"

export function initCronJobs(): void {
  // Schedule: At 09:00 AM on the 1st day of every month: "0 9 1 * *"
  cron.schedule("0 9 1 * *", async () => {
    console.log("🗓️ [Cron] 1st of the month: Dispatching Monthly Financial Digests...")
    try {
      await sendMonthlyDigestsToAllUsers()
    } catch (err) {
      console.error("[Cron] Error running monthly digest job:", err)
    }
  })

  console.log("⏰ Cron jobs initialized (Monthly Financial Digest scheduled for 1st of every month at 09:00 AM)")
}
