// backend/cron/lowCreditAlert.js
const cron = require("node-cron");
const pool = require("../db");
const sendEmail = require("../utils/sendEmail");

console.log("✅ Low Credit Alert cron loaded");

cron.schedule("* * * * *", async () => {
  console.log("🔎 Checking low credit balances...");

  try {
    // Get users with remaining credits < 10000
    const { rows } = await pool.query(
      `SELECT 
        upc.user_id, 
        COALESCE(upc.total_purchased, 0) AS total_purchased,
        COALESCE(uuc.total_usage, 0) AS total_usage,
        upc.last_low_alert_at,
        u.email, 
        u.company_name
       FROM public.user_purchased_counters upc
       JOIN public.users u ON u.id = upc.user_id
       LEFT JOIN public.user_usage_counters uuc ON uuc.user_id = upc.user_id
       WHERE (COALESCE(upc.total_purchased, 0) - COALESCE(uuc.total_usage, 0)) < $1
         AND (COALESCE(upc.total_purchased, 0) - COALESCE(uuc.total_usage, 0)) > 0`,
      [10000]
    );

    const now = new Date();

    for (const row of rows) {
      const remaining = row.total_purchased - row.total_usage;
      const lastSent = row.last_low_alert_at ? new Date(row.last_low_alert_at) : null;
      const hoursSince = lastSent ? (now - lastSent) / (1000 * 60 * 60) : Infinity;

      // Send if never sent OR last sent >= 24 hours
      if (!lastSent || hoursSince >= 24) {
        try {
          await sendEmail(
            row.email,
            "⚠️ Low Credit Balance Alert",
            "lowCreditAlert",
            {
              User_Name: row.company_name || "Valued Customer",
              CURRENT_BALANCE: remaining,
              RECHARGE_LINK: `${process.env.FRONTEND_URL}/payment`
            }
          );

          // Update last_low_alert_at so we don't spam
          await pool.query(
            `UPDATE public.user_purchased_counters
             SET last_low_alert_at = $1
             WHERE user_id = $2`,
            [now.toISOString(), row.user_id]
          );

          console.log(`⚠️ Low credit alert sent to ${row.email} (${remaining} credits remaining)`);
        } catch (err) {
          console.error(`❌ Failed to send low-credit email to ${row.email}:`, err.message || err);
        }
      }
    }
  } catch (err) {
    console.error("🚨 DB error in lowCreditAlert:", err.message || err);
  }
});
