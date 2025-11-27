const cron = require("node-cron");
const pool = require("../db");
const sendEmail = require("../utils/sendEmail");
const checkNotificationPreferences = require("../utils/checkNotificationPreferences");

console.log("✅ Daily Credit Report cron loaded");

cron.schedule("0 0 * * *", async () => {
  // Runs every day at midnight (server time)
  console.log("📅 Running Daily Credit Report cron...");

  try {
    const result = await pool.query(`
      SELECT 
        u.id, 
        u.email, 
        u.company_name,
        COALESCE(upc.total_purchased, 0) AS total_purchased,
        COALESCE(uuc.total_usage, 0) AS total_usage,
        COALESCE(uuc.daily_usage, 0) AS daily_usage
      FROM users u
      LEFT JOIN user_purchased_counters upc ON upc.user_id = u.id
      LEFT JOIN user_usage_counters uuc ON uuc.user_id = u.id
    `);

    for (const user of result.rows) {
      const totalRemaining = Math.max(user.total_purchased - user.total_usage, 0);
      
      try {
        // Check if user wants to receive email notifications
        const wantsEmails = await checkNotificationPreferences(user.id, "email_notifications");
        
        if (wantsEmails) {
          await sendEmail(
            user.email,
            "Your Daily Credit Usage Report",
            "dailyCreditReport", // template name
            {
              User_Name: user.company_name || "Valued Customer",
              CURRENT_BALANCE: totalRemaining,
              DAILY_USAGE: user.daily_usage || 0,
              FRONTEND_URL: process.env.FRONTEND_URL,
            }
          );
        }
      } catch (err) {
        console.error(`❌ Failed to send to ${user.email}:`, err.message);
      }
    }
  } catch (err) {
    console.error("🚨 DB error in dailyCreditReport:", err);
  }
});
