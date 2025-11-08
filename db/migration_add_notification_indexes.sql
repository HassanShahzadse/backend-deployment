-- Add indexes for notification queries to improve performance

-- Index for user-specific notifications with archived and created_at
CREATE INDEX IF NOT EXISTS idx_notifications_user_archived_created 
ON notifications(user_id, archived, created_at DESC) 
WHERE is_global = false;

-- Index for global notifications with created_at
CREATE INDEX IF NOT EXISTS idx_notifications_global_created 
ON notifications(is_global, created_at DESC) 
WHERE is_global = true;

-- Index for notification_seen joins
CREATE INDEX IF NOT EXISTS idx_notification_seen_notification_user 
ON notification_seen(notification_id, user_id);

