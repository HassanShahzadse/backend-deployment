// routes/dashboard.js
const express = require("express");
const router = express.Router();
const pool = require("../db");
const authenticateToken = require("../middleware/auth");
const redis = require("../lib/redis");

router.get("/", authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const kPurchased = `purchased:${userId}`;
  const kUsed = `usage:${userId}`;

  try {
    let totalPurchased = 0;
    let totalUsage = 0;

    // 1) Brzi put preko Redis-a (samo ako je omogućen i dostupan)
    let cacheHit = false;
    if (redis && redis.__enabled) {
      try {
        const [purchasedStr, usedStr] = await redis.mget(kPurchased, kUsed);
        if (purchasedStr !== null && usedStr !== null) {
          totalPurchased = parseInt(purchasedStr, 10) || 0;
          totalUsage = parseInt(usedStr, 10) || 0;
          cacheHit = true;
        }
      } catch (e) {
        // Ako Redis padne, nastavi na DB fallback bez prekida endpointa
        console.warn("⚠️ Redis unavailable, falling back to DB.");
      }
    }

    // 2) DB fallback (ili cold start cache miss)
    if (!cacheHit) {
      const [ordersRes, usageRes] = await Promise.all([
        pool.query(
          `SELECT COALESCE(SUM(api_calls_quantity),0)::bigint AS total_purchased
           FROM orders
           WHERE user_id = $1 AND LOWER(status) = 'paid'`,
          [userId]
        ),
        pool.query(
          `SELECT COUNT(*)::bigint AS total_usage
           FROM api_token_usage
           WHERE user_id = $1`,
          [userId]
        ),
      ]);

      totalPurchased = Number(ordersRes.rows[0].total_purchased) || 0;
      totalUsage = Number(usageRes.rows[0].total_usage) || 0;

      // 3) “Prime” cache za brza buduća čitanja (ako je Redis omogućen)
      if (redis && redis.__enabled) {
        try {
          await redis
            .multi()
            .set(kPurchased, totalPurchased)
            .set(kUsed, totalUsage)
            .exec();
        } catch (e) {
          // Bez panike ako cache priming ne uspije
          console.warn("⚠️ Failed to prime Redis cache.");
        }
      }
    }

    const totalRemaining = totalPurchased - totalUsage;
    res.json({ totalPurchased, totalUsage, totalRemaining });
  } catch (err) {
    console.error("❌ Dashboard balance error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
