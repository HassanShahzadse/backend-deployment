-- Create two_factor_otp table for storing temporary OTP codes during login
-- This table stores OTP codes with expiration for 2FA authentication

CREATE TABLE IF NOT EXISTS two_factor_otp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  otp_code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45)
);

-- Create index for faster lookups by user_id
CREATE INDEX IF NOT EXISTS idx_two_factor_otp_user_id ON two_factor_otp(user_id);

-- Create index for cleanup queries on expires_at
CREATE INDEX IF NOT EXISTS idx_two_factor_otp_expires_at ON two_factor_otp(expires_at);

-- Comments explaining the table and columns
COMMENT ON TABLE two_factor_otp IS 'Stores temporary OTP codes for two-factor authentication during login';
COMMENT ON COLUMN two_factor_otp.user_id IS 'Reference to the user who requested the OTP';
COMMENT ON COLUMN two_factor_otp.otp_code IS '6-digit one-time password code';
COMMENT ON COLUMN two_factor_otp.expires_at IS 'Timestamp when the OTP expires (typically 5 minutes from creation)';
COMMENT ON COLUMN two_factor_otp.used IS 'Flag indicating if the OTP has been used successfully';
COMMENT ON COLUMN two_factor_otp.ip_address IS 'IP address from which the OTP was requested for security logging';

