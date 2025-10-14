const pool = require("../db");
const { v4: uuidv4 } = require("uuid");

async function checkApiKey(req, res, next) {
  try {
    const apiKey = req.headers["x-api-key"];

    if (!apiKey) {
      return res.status(401).json({ error: "Missing API key" });
    }

    const userResult = await pool.query(
      "SELECT id FROM users WHERE api_key = $1",
      [apiKey]
    );

    if (userResult.rows.length === 0) {
      return res.status(403).json({ error: "Invalid API key" });
    }

    const userId = userResult.rows[0].id;

    const purchasedRes = await pool.query(
      "SELECT COALESCE(SUM(total_purchased), 0) AS total_purchased FROM user_purchased_counters WHERE user_id = $1",
      [userId]
    );
    const usedRes = await pool.query(
      "SELECT COALESCE(SUM(total_usage), 0) AS total_usage FROM user_usage_counters WHERE user_id = $1",
      [userId]
    );

    const totalPurchased = parseInt(purchasedRes.rows[0].total_purchased, 10);
    const totalUsed = parseInt(usedRes.rows[0].total_usage, 10);
    const remainingCredits = totalPurchased - totalUsed;

    if (remainingCredits <= 0) {
      return res.status(402).json({ error: "Insufficient credits" });
    }

    const usageId = uuidv4();
    const token = uuidv4().replace(/-/g, "").slice(0, 32);
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.connection.remoteAddress ||
      "unknown";
    const userAgent = req.headers["user-agent"] || "unknown";
    const endpoint = req.originalUrl;
    const method = req.method;
    const status = 200;

    await pool.query(
      `INSERT INTO api_token_usage 
       (id, user_id, token, endpoint, method, response_status, ip_address, user_agent, request_timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
      [usageId, userId, token, endpoint, method, status, ip, userAgent]
    );

    req.user = { id: userId, remaining_credits: remainingCredits };
    next();
  } catch (err) {
    console.error("API Key check error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = checkApiKey;
