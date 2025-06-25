// middlewares/logApiUsage.js
const pool = require("../db"); // prilagodi put ako ti je drugačije

const logApiUsage = async (req, res, next) => {
  const start = Date.now();

  res.on("finish", async () => {
    try {
      const token =
        req.headers["authorization"]?.replace("Bearer ", "") || "unknown";
      const userId = req.user?.id || null; // moraš imati raniji middleware koji dekodira token i postavlja req.user
      const endpoint = req.originalUrl;
      const method = req.method;
      const status = res.statusCode;
      const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
      const userAgent = req.headers["user-agent"];

      await pool.query(
        `INSERT INTO api_token_usage 
         (user_id, token, endpoint, method, response_status, ip_address, user_agent)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [userId, token, endpoint, method, status, ip, userAgent]
      );
    } catch (err) {
      console.error("❌ Failed to log API usage:", err.message);
    }
  });

  next();
};

module.exports = logApiUsage;
