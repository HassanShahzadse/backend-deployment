// routes/dashboard.js
const express = require("express");
const router = express.Router();
const pool = require("../db");
const authenticateToken = require("../middleware/auth");

router.get("/", authenticateToken, async (req, res) => {
  const userId = req.user.userId;

  try {
    const [purchasedRes, usageRes] = await Promise.all([
      pool.query(
        `SELECT total_purchased::bigint AS total_purchased
         FROM user_purchased_counters
         WHERE user_id = $1`,
        [userId]
      ),
      pool.query(
        `SELECT total_usage::bigint AS total_usage
         FROM user_usage_counters
         WHERE user_id = $1`,
        [userId]
      ),
    ]);

    let totalPurchased = Number(purchasedRes.rows[0]?.total_purchased ?? 0);
    let totalUsage = Number(usageRes.rows[0]?.total_usage ?? 0);

    // Fallback ako brojači još nisu inicijalizirani
    if (purchasedRes.rowCount === 0) {
      const agg = await pool.query(
        `SELECT COALESCE(SUM(api_calls_quantity),0)::bigint AS total_purchased
           FROM orders
          WHERE user_id = $1 AND LOWER(status) = 'paid'`,
        [userId]
      );
      totalPurchased = Number(agg.rows[0].total_purchased || 0);
    }

    if (usageRes.rowCount === 0) {
      const agg = await pool.query(
        `SELECT COUNT(*)::bigint AS total_usage
           FROM api_token_usage
          WHERE user_id = $1`,
        [userId]
      );
      totalUsage = Number(agg.rows[0].total_usage || 0);
    }

    const totalRemaining = Math.max(totalPurchased - totalUsage, 0);
    res.json({ totalPurchased, totalUsage, totalRemaining });
  } catch (err) {
    console.error("❌ Dashboard balance error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
