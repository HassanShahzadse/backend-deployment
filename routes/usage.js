const express = require("express");
const router = express.Router();
const pool = require("../db");
const authenticateToken = require("../middleware/auth"); // prilagodi put ako treba

// GET /api/usage - dohvaća sve usage zapise za prijavljenog usera
router.get("/", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM api_token_usage 
       WHERE user_id = $1 
       ORDER BY request_timestamp DESC`,
      [req.user.userId]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching usage logs:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/usage - kreira novi usage zapis (poziva isključivo backend)
router.post("/", async (req, res) => {
  const {
    user_id,
    token,
    endpoint,
    method,
    response_status,
    ip_address,
    user_agent,
  } = req.body;

  try {
    // Validacija osnovnih polja
    if (!user_id || !endpoint || !method || !response_status) {
      return res.status(400).json({
        error:
          "Missing required fields: user_id, endpoint, method, or response_status",
      });
    }

    const id = require("uuid").v4();
    const timestamp = new Date();

    // Umetanje zapisa
    const result = await pool.query(
      `INSERT INTO api_token_usage
       (id, user_id, token, endpoint, method, response_status, ip_address, user_agent, request_timestamp)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [
        id,
        user_id,
        token || "auto-" + id.slice(0, 12),
        endpoint,
        method,
        response_status,
        ip_address || req.ip || "127.0.0.1",
        user_agent || "Backend/Internal Service",
        timestamp,
      ]
    );

    res.status(201).json({
      message: "✅ Usage record created successfully.",
      usage: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Error creating usage log:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});



module.exports = router;
