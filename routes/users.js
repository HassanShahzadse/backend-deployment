const express = require("express");
const router = express.Router();
const pool = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid"); // dodano za generiranje api_key
const authenticateToken = require("../middleware/auth");
const sendEmail = require("../utils/sendEmail"); 

// Registracija korisnika
router.post("/register", async (req, res) => {
  const {
    email,
    password,
    company_name,
    primary_address,
    billing_email,
    payment_provider,
    tax_percentage,
    vat_id,
  } = req.body;

  try {
    // Provjera postoji li već korisnik
    const existingUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash lozinke
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generiraj API ključ (UUID v4 format)
    const api_key = uuidv4();

    // Generiraj unique_invoice_number (10-digit unique code)
    const unique_invoice_number = Math.floor(1000000000 + Math.random() * 9000000000).toString();

    // Unos novog korisnika
    const newUser = await pool.query(
      `INSERT INTO users 
       (email, password, company_name, primary_address, billing_email, 
        payment_provider, tax_percentage, vat_id, api_key, unique_invoice_number)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, email, company_name, api_key, created_at`,
      [
        email,
        hashedPassword,
        company_name,
        primary_address,
        billing_email,
        payment_provider,
        tax_percentage,
        vat_id,
        api_key,
        unique_invoice_number,
      ]
    );

    res.status(201).json(newUser.rows[0]);
  } catch (err) {
    console.error("Registration error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Login korisnika
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (user.rows.length === 0) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user.rows[0].id, email: user.rows[0].email },
      process.env.JWT_SECRET,
      { expiresIn: "3h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.rows[0].id,
        email: user.rows[0].email,
        company_name: user.rows[0].company_name,
        api_key: user.rows[0].api_key, // uključeno dohvaćanje api_key-a
      },
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ error: err.message });
  }
});


// Dohvati podatke prijavljenog korisnika
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, email, company_name, primary_address, billing_email, 
              payment_provider, tax_percentage, vat_id, api_key, created_at 
       FROM users WHERE id = $1`,
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Fetch user error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Update user profile (account information)
router.patch("/profile", authenticateToken, async (req, res) => {
  const { company_name, primary_address } = req.body;

  try {
    // Build dynamic update query based on provided fields
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (company_name !== undefined) {
      updates.push(`company_name = $${paramCount}`);
      values.push(company_name);
      paramCount++;
    }

    if (primary_address !== undefined) {
      updates.push(`primary_address = $${paramCount}`);
      values.push(primary_address);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    // Add user_id to values array
    values.push(req.user.userId);

    const query = `
      UPDATE users 
      SET ${updates.join(", ")} 
      WHERE id = $${paramCount}
      RETURNING id, email, company_name, primary_address, billing_email, 
                payment_provider, tax_percentage, vat_id, api_key, created_at
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      message: "Profile updated successfully",
      user: result.rows[0]
    });
  } catch (err) {
    console.error("Update profile error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Forgot password - Generate reset token and send email
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (user.rows.length === 0) {
      // Don't reveal if user exists for security
      return res.json({
        message: "If that email exists, a password reset link has been sent.",
      });
    }
    
   
    const userId = user.rows[0].id;

    // Generate JWT reset token (expires in 1 hour)
    const resetToken = jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
   
    
    // Send reset link email - encode the token for URL safety
    const encodedToken = encodeURIComponent(resetToken);
    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password/${encodedToken}`;

    await sendEmail(
      email,
      "Reset Your Password",
      "passwordReset",
      {
        User_Name: user.rows[0].company_name || "Valued Customer",
        RESET_LINK: resetUrl,
      }
    );

    res.json({
      message: "If that email exists, a password reset link has been sent.",
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ error: "Failed to process password reset request" });
  }
});

// Reset password - Validate token and update password
router.post("/reset-password/:token", async (req, res) => {
  let { token } = req.params;
  const { password } = req.body;

  try {
    if (!password || password.length < 6) {
      return res.status(400).json({
        error: "Password is required and must be at least 6 characters",
      });
    }
  
    // Decode the token in case it was URL-encoded
    try {
      token = decodeURIComponent(token);
    } catch (decodeErr) {
      // If decoding fails, use token as-is (might not be encoded)
      console.log("Token decode warning:", decodeErr.message);
    }

     let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(400).json({ error: "Token has expired. Please request a new password reset link." });
      }
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    const userId = decoded.userId;

    console.log("Resetting password for user ID:", userId);

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password
    await pool.query("UPDATE users SET password = $1 WHERE id = $2", [
      hashedPassword,
      userId,
    ]);

    res.json({
      message: "Password updated successfully",
    });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ error: "Failed to reset password" });
  }
});

// Report suspicious login
// POST /api/users/security/report-suspicious-login
router.post("/security/report-suspicious-login", authenticateToken, async (req, res) => {
  try {
    const { notification_id, login_details } = req.body;
    const userId = req.user.userId;

    // Log the security report (you can create a security_reports table if needed)
    // For now, we'll just log it and potentially invalidate sessions
    console.log(`🚨 Security Alert: User ${userId} reported suspicious login`, {
      notification_id,
      login_details,
      reported_at: new Date().toISOString()
    });

    // You can add logic here to:
    // 1. Invalidate all active sessions for the user
    // 2. Send an email alert
    // 3. Log to a security_reports table
    // 4. Mark the notification as reported

    // Example: Mark notification as seen/archived after reporting
    if (notification_id) {
      try {
        await pool.query(
          `UPDATE notification_seen 
           SET seen_at = CURRENT_TIMESTAMP, archived_at = CURRENT_TIMESTAMP
           WHERE notification_id = $1 AND user_id = $2`,
          [notification_id, userId]
        );
      } catch (notifErr) {
        console.error("Error updating notification:", notifErr.message);
      }
    }

    res.json({
      message: "Suspicious login reported successfully. We've logged this incident and will investigate.",
      reported: true
    });
  } catch (err) {
    console.error("Report suspicious login error:", err.message);
    res.status(500).json({ error: "Failed to report suspicious login" });
  }
});

// Get user notification preferences
router.get("/preferences/notifications", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Try to fetch existing preferences
    let preferences = await pool.query(
      `SELECT email_notifications, security_alerts, marketing_emails, 
              created_at, updated_at
       FROM user_preferences 
       WHERE user_id = $1`,
      [userId]
    );

    // If no preferences exist, create default ones
    if (preferences.rows.length === 0) {
      const newPreferences = await pool.query(
        `INSERT INTO user_preferences 
         (user_id, email_notifications, security_alerts, marketing_emails)
         VALUES ($1, true, true, false)
         RETURNING email_notifications, security_alerts, marketing_emails, 
                   created_at, updated_at`,
        [userId]
      );
      preferences = newPreferences;
    }

    res.json({
      email_notifications: preferences.rows[0].email_notifications,
      security_alerts: preferences.rows[0].security_alerts,
      marketing_emails: preferences.rows[0].marketing_emails
    });
  } catch (err) {
    console.error("Get notification preferences error:", err.message);
    res.status(500).json({ error: "Failed to fetch notification preferences" });
  }
});

// Update user notification preferences
router.patch("/preferences/notifications", authenticateToken, async (req, res) => {
  const { email_notifications, security_alerts, marketing_emails } = req.body;

  try {
    const userId = req.user.userId;

    // Build dynamic update query based on provided fields
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (email_notifications !== undefined) {
      if (typeof email_notifications !== "boolean") {
        return res.status(400).json({ error: "email_notifications must be a boolean" });
      }
      updates.push(`email_notifications = $${paramCount}`);
      values.push(email_notifications);
      paramCount++;
    }

    if (security_alerts !== undefined) {
      if (typeof security_alerts !== "boolean") {
        return res.status(400).json({ error: "security_alerts must be a boolean" });
      }
      updates.push(`security_alerts = $${paramCount}`);
      values.push(security_alerts);
      paramCount++;
    }

    if (marketing_emails !== undefined) {
      if (typeof marketing_emails !== "boolean") {
        return res.status(400).json({ error: "marketing_emails must be a boolean" });
      }
      updates.push(`marketing_emails = $${paramCount}`);
      values.push(marketing_emails);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    // Add updated_at and user_id
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(userId);

    const query = `
      UPDATE user_preferences 
      SET ${updates.join(", ")} 
      WHERE user_id = $${paramCount}
      RETURNING email_notifications, security_alerts, marketing_emails
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User preferences not found" });
    }

    res.json({
      message: "Notification preferences updated successfully",
      preferences: result.rows[0]
    });
  } catch (err) {
    console.error("Update notification preferences error:", err.message);
    res.status(500).json({ error: "Failed to update notification preferences" });
  }
});

// Get user security settings
router.get("/preferences/security", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Try to fetch existing preferences
    let preferences = await pool.query(
      `SELECT two_factor_enabled, auto_session_timeout, 
              created_at, updated_at
       FROM user_preferences 
       WHERE user_id = $1`,
      [userId]
    );

    // If no preferences exist, create default ones
    if (preferences.rows.length === 0) {
      const newPreferences = await pool.query(
        `INSERT INTO user_preferences 
         (user_id, two_factor_enabled, auto_session_timeout)
         VALUES ($1, false, false)
         RETURNING two_factor_enabled, auto_session_timeout, 
                   created_at, updated_at`,
        [userId]
      );
      preferences = newPreferences;
    }

    res.json({
      two_factor_enabled: preferences.rows[0].two_factor_enabled,
      auto_session_timeout: preferences.rows[0].auto_session_timeout
    });
  } catch (err) {
    console.error("Get security settings error:", err.message);
    res.status(500).json({ error: "Failed to fetch security settings" });
  }
});

// Update user security settings
router.patch("/preferences/security", authenticateToken, async (req, res) => {
  const { two_factor_enabled, auto_session_timeout } = req.body;

  try {
    const userId = req.user.userId;

    // Build dynamic update query based on provided fields
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (two_factor_enabled !== undefined) {
      if (typeof two_factor_enabled !== "boolean") {
        return res.status(400).json({ error: "two_factor_enabled must be a boolean" });
      }
      updates.push(`two_factor_enabled = $${paramCount}`);
      values.push(two_factor_enabled);
      paramCount++;
    }

    if (auto_session_timeout !== undefined) {
      if (typeof auto_session_timeout !== "boolean") {
        return res.status(400).json({ error: "auto_session_timeout must be a boolean" });
      }
      updates.push(`auto_session_timeout = $${paramCount}`);
      values.push(auto_session_timeout);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    // Add updated_at and user_id
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(userId);

    const query = `
      UPDATE user_preferences 
      SET ${updates.join(", ")} 
      WHERE user_id = $${paramCount}
      RETURNING two_factor_enabled, auto_session_timeout
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User preferences not found" });
    }

    // If 2FA is being enabled, send OTP email
    if (two_factor_enabled === true) {
      try {
        const userRes = await pool.query(
          `SELECT email, company_name FROM users WHERE id = $1`,
          [userId]
        );
        const user = userRes.rows[0];

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        await sendEmail(
          user.email,
          "Two-Factor Authentication Enabled",
          "twoFactorEnabled",
          {
            User_Name: user.company_name || "Valued Customer",
            OTP_CODE: otp
          }
        );
      } catch (emailErr) {
        console.error("❌ Failed to send 2FA email:", emailErr.message);
        // Don't fail the update if email fails
      }
    }

    res.json({
      message: "Security settings updated successfully",
      settings: result.rows[0]
    });
  } catch (err) {
    console.error("Update security settings error:", err.message);
    res.status(500).json({ error: "Failed to update security settings" });
  }
});

module.exports = router;
