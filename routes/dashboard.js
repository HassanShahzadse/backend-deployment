const express = require("express");
const router = express.Router();
const pool = require("../db");
const authenticateToken = require("../middleware/auth");

router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId; // <-- prilagođeno ovdje
    const token = req.headers["authorization"]?.split(" ")[1];

    console.log("🔑 JWT Token:", token);
    console.log("👤 User ID from token:", userId);

    const [ordersRes, usageRes] = await Promise.all([
      pool.query(
        `SELECT COALESCE(SUM(api_calls_quantity), 0) AS total_purchased
         FROM orders
         WHERE user_id = $1 AND LOWER(status) = 'paid'`,
        [userId]
      ),
      pool.query(
        `SELECT COUNT(*) AS total_usage
         FROM api_token_usage
         WHERE user_id = $1`,
        [userId]
      ),
    ]);

    const totalPurchased = parseInt(ordersRes.rows[0].total_purchased);
    const totalUsage = parseInt(usageRes.rows[0].total_usage);
    const totalRemaining = totalPurchased - totalUsage;

    console.log("✅ Total API calls purchased:", totalPurchased);
    console.log("✅ Total API token usage:", totalUsage);
    console.log("✅ Total API calls remaining:", totalRemaining);

    res.json({ totalPurchased, totalUsage, totalRemaining });
  } catch (err) {
    console.error("❌ Error fetching API balance:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
