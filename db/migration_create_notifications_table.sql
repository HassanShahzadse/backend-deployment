CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  category VARCHAR(100) DEFAULT 'Notification',
  icon_type VARCHAR(50) DEFAULT 'info',
  action_url TEXT,
  actions JSONB DEFAULT '[]',
  seen BOOLEAN DEFAULT false,
  archived BOOLEAN DEFAULT false,
  is_global BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 3: Create tracking table for global notifications
CREATE TABLE IF NOT EXISTS notification_seen (
  id SERIAL PRIMARY KEY,
  notification_id INTEGER REFERENCES notifications(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  seen_at TIMESTAMP,
  archived_at TIMESTAMP,
  UNIQUE (notification_id, user_id)
);