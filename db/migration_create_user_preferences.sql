-- Create user_preferences table for notification and security settings
-- This table stores per-user preferences for the Profile Settings page

CREATE TABLE IF NOT EXISTS user_preferences (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Notification preferences
  email_notifications BOOLEAN DEFAULT true,
  security_alerts BOOLEAN DEFAULT true,
  marketing_emails BOOLEAN DEFAULT false,
  
  -- Security preferences
  two_factor_enabled BOOLEAN DEFAULT false,
  auto_session_timeout BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Ensure one preference record per user
  UNIQUE(user_id)
);

-- Create index for faster lookups by user_id
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- Comments explaining the columns
COMMENT ON TABLE user_preferences IS 'Stores user notification and security preferences for Profile Settings';
COMMENT ON COLUMN user_preferences.email_notifications IS 'Toggle for receiving general email notifications';
COMMENT ON COLUMN user_preferences.security_alerts IS 'Toggle for receiving security alert notifications';
COMMENT ON COLUMN user_preferences.marketing_emails IS 'Toggle for receiving marketing/promotional emails';
COMMENT ON COLUMN user_preferences.two_factor_enabled IS 'Toggle for two-factor authentication';
COMMENT ON COLUMN user_preferences.auto_session_timeout IS 'Toggle for automatic session timeout after 30 minutes of inactivity';

