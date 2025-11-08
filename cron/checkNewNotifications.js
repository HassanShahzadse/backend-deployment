// backend/cron/checkNewNotifications.js
const pool = require("../db");

console.log("✅ New Notifications Checker cron loaded");

// Check for new notifications every second
// Note: Checking every second is very frequent. Consider using WebSockets for real-time updates
// or increasing the interval to 5-10 seconds for better performance
setInterval(async () => {
  try {
    // Get all unread notifications that haven't been processed
    // This query gets notifications that are new (created in the last 2 seconds to catch new ones)
    // Handles both user-specific and global notifications
    const { rows } = await pool.query(
      `SELECT 
        n.id,
        n.user_id,
        n.title,
        n.message,
        n.category,
        n.icon_type,
        n.action_url,
        n.actions,
        n.is_global,
        n.created_at,
        u.email,
        u.company_name
      FROM notifications n
      LEFT JOIN users u ON u.id = n.user_id
      WHERE n.created_at > NOW() - INTERVAL '2 seconds'
        AND (
          -- For user-specific notifications, check seen and archived fields
          (n.is_global = false AND n.seen = false AND n.archived = false)
          OR
          -- For global notifications, they are always considered "new" until seen by users
          (n.is_global = true)
        )
      ORDER BY n.created_at DESC`
    );

    if (rows.length > 0) {
      console.log(`🔔 Found ${rows.length} new notification(s)`);
      
      // Log new notifications (in production, you might want to emit WebSocket events here)
      for (const notification of rows) {
        if (notification.is_global) {
          console.log(`  - [GLOBAL] ${notification.title}`);
        } else {
          console.log(`  - User ${notification.user_id} (${notification.email || 'N/A'}): ${notification.title}`);
        }
      }
    }
  } catch (err) {
    console.error("🚨 Error checking for new notifications:", err.message || err);
  }
}, 1000); 

