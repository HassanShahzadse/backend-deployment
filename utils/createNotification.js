// backend/utils/createNotification.js
// Helper function to create notifications for users
const pool = require("../db");

/**
 * Create a notification for a user
 * @param {Object} options - Notification options
 * @param {string} [options.user_id] - User ID (null for global notifications)
 * @param {string} options.title - Notification title
 * @param {string} options.message - Notification message
 * @param {string} [options.category] - Category badge (default: "Notification")
 * @param {string} [options.icon_type] - Icon type (default: "info")
 * @param {string} [options.action_url] - Optional action URL
 * @param {Array} [options.actions] - Array of action buttons [{label, type, primary}]
 * @param {boolean} [options.is_global] - Whether this is a global notification (default: false)
 * @returns {Promise<Object>} Created notification
 */
async function createNotification({
  user_id,
  title,
  message,
  category = "Notification",
  icon_type = "info",
  action_url = null,
  actions = [],
  is_global = false,
}) {
  try {
    if (!title || !message) {
      throw new Error("title and message are required");
    }

    // Determine if this is a global notification
    const global = is_global === true || user_id === null;
    const finalUserId = global ? null : user_id;

    if (!global && !finalUserId) {
      throw new Error("user_id is required for user-specific notifications");
    }

    const { rows } = await pool.query(
      `INSERT INTO notifications (
        user_id, title, message, category, icon_type, action_url, actions, is_global
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        finalUserId,
        title,
        message,
        category,
        icon_type,
        action_url,
        actions ? JSON.stringify(actions) : "[]",
        global,
      ]
    );

    return rows[0];
  } catch (error) {
    throw error;
  }
}

/**
 * Create notifications for multiple users
 * @param {Array<Object>} notifications - Array of notification objects
 * @returns {Promise<Array>} Created notifications
 */
async function createBulkNotifications(notifications) {
  try {
    const results = [];
    for (const notification of notifications) {
      try {
        const created = await createNotification(notification);
        results.push(created);
      } catch (error) {
        // Silently skip failed notifications and continue with others
      }
    }
    return results;
  } catch (error) {
    throw error;
  }
}

module.exports = { createNotification, createBulkNotifications };

