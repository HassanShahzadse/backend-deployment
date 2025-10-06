-- Add alert tracking columns to user_purchased_counters table
-- These track when we last sent alert emails to avoid spam

-- Add last_low_alert_at column (for low credit warnings)
ALTER TABLE user_purchased_counters 
ADD COLUMN IF NOT EXISTS last_low_alert_at TIMESTAMP;

-- Add last_zero_alert_at column (for zero credit warnings)
ALTER TABLE user_purchased_counters 
ADD COLUMN IF NOT EXISTS last_zero_alert_at TIMESTAMP;

-- Comments explaining the columns
COMMENT ON COLUMN user_purchased_counters.last_low_alert_at IS 'Timestamp of last low credit alert email sent to user';
COMMENT ON COLUMN user_purchased_counters.last_zero_alert_at IS 'Timestamp of last zero credit alert email sent to user';
