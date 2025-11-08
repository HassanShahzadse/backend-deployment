// backend/routes/notifications.js
const express = require("express");
const router = express.Router();
const pool = require("../db");
const authenticateToken = require("../middleware/auth");

// Get all notifications for the authenticated user
// Includes both user-specific notifications and global notifications
router.get("/", authenticateToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;
    // Handle both string "true" and boolean true from query params
    const includeArchived = req.query.include_archived === "true" || req.query.include_archived === true;

    // Build WHERE clause based on include_archived
    let archivedCondition = "";
    if (!includeArchived) {
      archivedCondition = `AND (
        -- For user-specific notifications, check archived field
        (n.is_global = false AND n.archived = false)
        OR
        -- For global notifications, check archived_at in notification_seen
        (n.is_global = true AND (ns.archived_at IS NULL OR ns.id IS NULL))
      )`;
    }

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM notifications n
      LEFT JOIN notification_seen ns ON n.id = ns.notification_id AND ns.user_id = $1
      WHERE (n.user_id = $1 OR n.is_global = true)
      ${archivedCondition}
    `;
    const countResult = await pool.query(countQuery, [req.user.userId]);
    const total = parseInt(countResult.rows[0].total);

    // Get paginated notifications
    const { rows } = await pool.query(
      `SELECT 
        n.id,
        n.user_id,
        n.title,
        n.message,
        n.category,
        n.icon_type,
        -- For global notifications, archived status comes from notification_seen.archived_at
        -- For user-specific notifications, use n.archived
        CASE 
          WHEN n.is_global THEN COALESCE(ns.archived_at IS NOT NULL, false)
          ELSE n.archived
        END as archived,
        n.action_url,
        CASE 
          WHEN n.actions IS NULL THEN '[]'::jsonb
          WHEN jsonb_typeof(n.actions) = 'array' THEN n.actions
          ELSE '[]'::jsonb
        END as actions,
        n.is_global,
        n.created_at,
        n.updated_at,
        -- For user-specific notifications, use the seen field directly
        -- For global notifications, check notification_seen table
        CASE 
          WHEN n.is_global THEN COALESCE(ns.seen_at IS NOT NULL, false)
          ELSE n.seen
        END as seen
      FROM notifications n
      LEFT JOIN notification_seen ns ON n.id = ns.notification_id AND ns.user_id = $1
      WHERE (n.user_id = $1 OR n.is_global = true)
      ${archivedCondition}
      ORDER BY n.created_at DESC
      LIMIT $2 OFFSET $3`,
      [req.user.userId, limit, offset]
    );

    const hasMore = offset + rows.length < total;

    res.json({
      notifications: rows,
      total,
      hasMore,
      limit,
      offset,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// Get a specific notification
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT 
        n.id,
        n.user_id,
        n.title,
        n.message,
        n.category,
        n.icon_type,
        -- For global notifications, archived status comes from notification_seen.archived_at
        -- For user-specific notifications, use n.archived
        CASE 
          WHEN n.is_global THEN COALESCE(ns.archived_at IS NOT NULL, false)
          ELSE n.archived
        END as archived,
        n.action_url,
        CASE 
          WHEN n.actions IS NULL THEN '[]'::jsonb
          WHEN jsonb_typeof(n.actions) = 'array' THEN n.actions
          ELSE '[]'::jsonb
        END as actions,
        n.is_global,
        n.created_at,
        n.updated_at,
        CASE 
          WHEN n.is_global THEN COALESCE(ns.seen_at IS NOT NULL, false)
          ELSE n.seen
        END as seen
      FROM notifications n
      LEFT JOIN notification_seen ns ON n.id = ns.notification_id AND ns.user_id = $2
      WHERE n.id = $1 
        AND (n.user_id = $2 OR n.is_global = true)
        AND (
          -- For user-specific notifications, check archived field
          (n.is_global = false AND n.archived = false)
          OR
          -- For global notifications, check archived_at in notification_seen
          (n.is_global = true AND (ns.archived_at IS NULL OR ns.id IS NULL))
        )`,
      [req.params.id, req.user.userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch notification" });
  }
});

// Mark notification as seen
router.put("/:id/seen", authenticateToken, async (req, res) => {
  try {
    // First check if it's a global notification
    const checkResult = await pool.query(
      `SELECT is_global, user_id FROM notifications WHERE id = $1`,
      [req.params.id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: "Notification not found" });
    }

    const notification = checkResult.rows[0];

    if (notification.is_global) {
      // For global notifications, insert into notification_seen table
      await pool.query(
        `INSERT INTO notification_seen (notification_id, user_id, seen_at)
         VALUES ($1, $2, CURRENT_TIMESTAMP)
         ON CONFLICT (notification_id, user_id) 
         DO UPDATE SET seen_at = COALESCE(notification_seen.seen_at, CURRENT_TIMESTAMP)`,
        [req.params.id, req.user.userId]
      );
    } else {
      // For user-specific notifications, update the seen field
      if (notification.user_id !== req.user.userId) {
        return res.status(403).json({ error: "Not authorized to update this notification" });
      }
      
      await pool.query(
        `UPDATE notifications
         SET seen = true, updated_at = CURRENT_TIMESTAMP
         WHERE id = $1 AND user_id = $2`,
        [req.params.id, req.user.userId]
      );
    }

    // Return the updated notification
    const { rows } = await pool.query(
      `SELECT 
        n.id,
        n.user_id,
        n.title,
        n.message,
        n.category,
        n.icon_type,
        -- For global notifications, archived status comes from notification_seen.archived_at
        -- For user-specific notifications, use n.archived
        CASE 
          WHEN n.is_global THEN COALESCE(ns.archived_at IS NOT NULL, false)
          ELSE n.archived
        END as archived,
        n.action_url,
        CASE 
          WHEN n.actions IS NULL THEN '[]'::jsonb
          WHEN jsonb_typeof(n.actions) = 'array' THEN n.actions
          ELSE '[]'::jsonb
        END as actions,
        n.is_global,
        n.created_at,
        n.updated_at,
        CASE 
          WHEN n.is_global THEN COALESCE(ns.seen_at IS NOT NULL, false)
          ELSE n.seen
        END as seen
      FROM notifications n
      LEFT JOIN notification_seen ns ON n.id = ns.notification_id AND ns.user_id = $2
      WHERE n.id = $1`,
      [req.params.id, req.user.userId]
    );

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to update notification" });
  }
});

// Mark all notifications as read
router.put("/mark-all-read", authenticateToken, async (req, res) => {
  try {
    // Mark user-specific notifications as seen
    const userSpecificResult = await pool.query(
      `UPDATE notifications
       SET seen = true, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $1 AND seen = false AND is_global = false
       RETURNING id`,
      [req.user.userId]
    );

    // Mark all unread global notifications as seen (but not archived)
    // Only mark as seen if they're not already archived
    const globalResult = await pool.query(
      `INSERT INTO notification_seen (notification_id, user_id, seen_at)
       SELECT n.id, $1, CURRENT_TIMESTAMP
       FROM notifications n
       WHERE n.is_global = true
         AND NOT EXISTS (
           SELECT 1 FROM notification_seen ns 
           WHERE ns.notification_id = n.id 
             AND ns.user_id = $1
             AND ns.archived_at IS NOT NULL
         )
       ON CONFLICT (notification_id, user_id) 
       DO UPDATE SET seen_at = COALESCE(notification_seen.seen_at, CURRENT_TIMESTAMP)
       WHERE notification_seen.archived_at IS NULL
       RETURNING notification_id`,
      [req.user.userId]
    );

    res.json({ 
      message: "All notifications marked as read",
      updated: userSpecificResult.rows.length + globalResult.rows.length
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to mark all as read" });
  }
});

// Archive a notification
// Note: For global notifications, archiving is per-user (we track it in notification_seen)
// For user-specific notifications, we update the archived field
router.put("/:id/archive", authenticateToken, async (req, res) => {
  try {
    // Check if notification exists and user has access
    const checkResult = await pool.query(
      `SELECT is_global, user_id FROM notifications WHERE id = $1`,
      [req.params.id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: "Notification not found" });
    }

    const notification = checkResult.rows[0];

    if (notification.is_global) {
      // For global notifications, insert/update notification_seen with archived_at
      await pool.query(
        `INSERT INTO notification_seen (notification_id, user_id, archived_at)
         VALUES ($1, $2, CURRENT_TIMESTAMP)
         ON CONFLICT (notification_id, user_id) 
         DO UPDATE SET archived_at = CURRENT_TIMESTAMP`,
        [req.params.id, req.user.userId]
      );
    } else {
      // For user-specific notifications, update archived field
      if (notification.user_id !== req.user.userId) {
        return res.status(403).json({ error: "Not authorized to archive this notification" });
      }

      await pool.query(
        `UPDATE notifications
         SET archived = true, updated_at = CURRENT_TIMESTAMP
         WHERE id = $1 AND user_id = $2`,
        [req.params.id, req.user.userId]
      );
    }

    // Return the updated notification
    const { rows } = await pool.query(
      `SELECT 
        n.id,
        n.user_id,
        n.title,
        n.message,
        n.category,
        n.icon_type,
        -- For global notifications, archived status comes from notification_seen.archived_at
        -- For user-specific notifications, use n.archived
        CASE 
          WHEN n.is_global THEN COALESCE(ns.archived_at IS NOT NULL, false)
          ELSE n.archived
        END as archived,
        n.action_url,
        CASE 
          WHEN n.actions IS NULL THEN '[]'::jsonb
          WHEN jsonb_typeof(n.actions) = 'array' THEN n.actions
          ELSE '[]'::jsonb
        END as actions,
        n.is_global,
        n.created_at,
        n.updated_at,
        CASE 
          WHEN n.is_global THEN COALESCE(ns.seen_at IS NOT NULL, false)
          ELSE n.seen
        END as seen
      FROM notifications n
      LEFT JOIN notification_seen ns ON n.id = ns.notification_id AND ns.user_id = $2
      WHERE n.id = $1`,
      [req.params.id, req.user.userId]
    );

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to archive notification" });
  }
});

// Unarchive a notification
router.put("/:id/unarchive", authenticateToken, async (req, res) => {
  try {
    // Check if notification exists and user has access
    const checkResult = await pool.query(
      `SELECT is_global, user_id FROM notifications WHERE id = $1`,
      [req.params.id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: "Notification not found" });
    }

    const notification = checkResult.rows[0];

    if (notification.is_global) {
      // For global notifications, set archived_at to NULL in notification_seen
      await pool.query(
        `UPDATE notification_seen 
         SET archived_at = NULL
         WHERE notification_id = $1 AND user_id = $2`,
        [req.params.id, req.user.userId]
      );
    } else {
      // For user-specific notifications, update archived field
      if (notification.user_id !== req.user.userId) {
        return res.status(403).json({ error: "Not authorized to unarchive this notification" });
      }

      await pool.query(
        `UPDATE notifications
         SET archived = false, updated_at = CURRENT_TIMESTAMP
         WHERE id = $1 AND user_id = $2`,
        [req.params.id, req.user.userId]
      );
    }

    // Return the updated notification
    const { rows } = await pool.query(
      `SELECT 
        n.id,
        n.user_id,
        n.title,
        n.message,
        n.category,
        n.icon_type,
        CASE 
          WHEN n.is_global THEN COALESCE(ns.archived_at IS NOT NULL, false)
          ELSE n.archived
        END as archived,
        n.action_url,
        CASE 
          WHEN n.actions IS NULL THEN '[]'::jsonb
          WHEN jsonb_typeof(n.actions) = 'array' THEN n.actions
          ELSE '[]'::jsonb
        END as actions,
        n.is_global,
        n.created_at,
        n.updated_at,
        CASE 
          WHEN n.is_global THEN COALESCE(ns.seen_at IS NOT NULL, false)
          ELSE n.seen
        END as seen
      FROM notifications n
      LEFT JOIN notification_seen ns ON n.id = ns.notification_id AND ns.user_id = $2
      WHERE n.id = $1`,
      [req.params.id, req.user.userId]
    );

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to unarchive notification" });
  }
});

// Create a new notification (admin/system use)
// Can create global notifications (user_id = NULL) or user-specific notifications
router.post("/", authenticateToken, async (req, res) => {
  try {
    const {
      user_id,
      title,
      message,
      category,
      icon_type,
      action_url,
      actions,
      is_global,
    } = req.body;

    // Validate required fields
    if (!title || !message) {
      return res.status(400).json({ error: "Title and message are required" });
    }

    // Determine if this is a global notification
    const global = is_global === true || user_id === null;
    const finalUserId = global ? null : (user_id || req.user.userId);

    const { rows } = await pool.query(
      `INSERT INTO notifications (
        user_id, title, message, category, icon_type, action_url, actions, is_global
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        finalUserId,
        title,
        message,
        category || "Notification",
        icon_type || "info",
        action_url || null,
        actions ? JSON.stringify(actions) : "[]",
        global,
      ]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to create notification" });
  }
});

// Delete a notification
// Only user-specific notifications can be deleted by the user
// Global notifications should be deleted by admins only
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    // Check if notification exists and is user-specific
    const checkResult = await pool.query(
      `SELECT is_global, user_id FROM notifications WHERE id = $1`,
      [req.params.id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: "Notification not found" });
    }

    const notification = checkResult.rows[0];

    if (notification.is_global) {
      return res.status(403).json({ error: "Cannot delete global notifications" });
    }

    if (notification.user_id !== req.user.userId) {
      return res.status(403).json({ error: "Not authorized to delete this notification" });
    }

    const { rows } = await pool.query(
      `DELETE FROM notifications
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [req.params.id, req.user.userId]
    );

    res.json({ message: "Notification deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete notification" });
  }
});

module.exports = router;

