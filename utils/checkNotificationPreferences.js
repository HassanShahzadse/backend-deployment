// backend/utils/checkNotificationPreferences.js
const pool = require("../db");

/**
 * Check if user has enabled specific notification type
 * @param {string} userId - User ID
 * @param {string} notificationType - 'email_notifications', 'security_alerts', or 'marketing_emails'
 * @returns {boolean} - true if user wants to receive this type of notification
 */
async function checkNotificationPreferences(userId, notificationType) {
  try {
    const result = await pool.query(
      `SELECT ${notificationType} FROM user_preferences WHERE user_id = $1`,
      [userId]
    );

    // If no preferences found, assume user wants notifications (default behavior)
    if (result.rows.length === 0) {
      return true;
    }

    return result.rows[0][notificationType] === true;
  } catch (err) {
    console.error(`Error checking notification preferences for user ${userId}:`, err.message);
    // On error, default to sending (fail-safe)
    return true;
  }
}

module.exports = checkNotificationPreferences;

