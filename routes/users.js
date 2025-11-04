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


module.exports = router;
