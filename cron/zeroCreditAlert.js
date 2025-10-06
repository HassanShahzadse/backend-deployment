// backend/cron/zeroCreditAlert.js
const cron = require("node-cron");
const pool = require("../db");
const sendEmail = require("../utils/sendEmail");

console.log("✅ Zero Credit Alert cron loaded");

cron.schedule("*/10 * * * *", async () => {
  console.log("🔎 Checking for zero credit balances...");

  try {
    // Get users with remaining credits = 0
    const { rows } = await pool.query(
      `SELECT 
        upc.user_id, 
        COALESCE(upc.total_purchased, 0) AS total_purchased,
        COALESCE(uuc.total_usage, 0) AS total_usage,
        upc.last_zero_alert_at,
        u.email, 
        u.company_name
       FROM public.user_purchased_counters upc
       JOIN public.users u ON u.id = upc.user_id
       LEFT JOIN public.user_usage_counters uuc ON uuc.user_id = upc.user_id
       WHERE (COALESCE(upc.total_purchased, 0) - COALESCE(uuc.total_usage, 0)) <= 0
         AND COALESCE(upc.total_purchased, 0) > 0`
    );

    const now = new Date();

    for (const row of rows) {
      const remaining = row.total_purchased - row.total_usage;
      const lastSent = row.last_zero_alert_at ? new Date(row.last_zero_alert_at) : null;
      const hoursSince = lastSent ? (now - lastSent) / (1000 * 60 * 60) : Infinity;

      // Send if never sent OR last sent >= 24 hours
      if (!lastSent || hoursSince >= 24) {
        try {
          await sendEmail(
            row.email,
            "🚨 All Credits Spent - Service Paused",
            "zeroCreditAlert",
            {
              User_Name: row.company_name || "Valued Customer",
              RECHARGE_LINK: `${process.env.FRONTEND_URL}/payment`
            }
          );

          // Update last_zero_alert_at so we don't spam
          await pool.query(
            `UPDATE public.user_purchased_counters
             SET last_zero_alert_at = $1
             WHERE user_id = $2`,
            [now.toISOString(), row.user_id]
          );

          console.log(`🚨 Zero credit alert sent to ${row.email}`);
        } catch (err) {
          console.error(`❌ Failed to send zero-credit email to ${row.email}:`, err.message || err);
        }
      }
    }
  } catch (err) {
    console.error("🚨 DB error in zeroCreditAlert:", err.message || err);
  }
});
