const express = require("express");
const router = express.Router();
const pool = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authenticateToken = require("../middleware/auth");

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
    vat_id, // 1. Dodano ovdje
  } = req.body;

  try {
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await pool.query(
      `INSERT INTO users 
      (email, password, company_name, primary_address, billing_email, payment_provider, tax_percentage, vat_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, email, created_at`,
      [
        email,
        hashedPassword,
        company_name,
        primary_address,
        billing_email,
        payment_provider,
        tax_percentage,
        vat_id,
      ]
    );

    res.status(201).json(newUser.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login korisnika
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

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
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.rows[0].id,
        email: user.rows[0].email,
        company_name: user.rows[0].company_name,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Dohvati podatke prijavljenog korisnika
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, email, company_name, primary_address, billing_email, 
              payment_provider, tax_percentage, vat_id, created_at 
       FROM users WHERE id = $1`,
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
