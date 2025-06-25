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

module.exports = router;
