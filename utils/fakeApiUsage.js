const { v4: uuidv4 } = require("uuid");
const pool = require("../db");

// Konfiguracija testnih podataka
const endpoints = [
  "/api/v1/price",
  "/api/v1/market",
  "/api/v1/address",
  "/api/v1/stats",
  "/api/v1/news",
];
const methods = ["GET"];
const statuses = [200, 200, 200, 400, 401, 500];

// Helper funkcije
function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomIp() {
  return `${rand(1, 255)}.${rand(0, 255)}.${rand(0, 255)}.${rand(1, 254)}`;
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Dohvati sve user_id iz baze
async function getAllUserIds() {
  try {
    const res = await pool.query("SELECT id FROM users");
    return res.rows.map((row) => row.id);
  } catch (err) {
    console.error("❌ Failed to fetch user IDs:", err.message);
    return [];
  }
}

function randomUserAgent() {
  const agents = [
    // Desktop
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Safari/605.1.15",
    "Mozilla/5.0 (X11; Ubuntu; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",

    // Mobile
    "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.6312.99 Mobile Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Linux; Android 12; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36",

    // Bots
    "Googlebot/2.1 (+http://www.google.com/bot.html)",
    "Mozilla/5.0 (compatible; Bingbot/2.0; +http://www.bing.com/bingbot.htm)",
    "Mozilla/5.0 (compatible; AhrefsBot/7.0; +http://ahrefs.com/robot/)",
  ];

  return agents[Math.floor(Math.random() * agents.length)];
}

// Glavna funkcija koja generira lažne API logove
async function generateFakeApiUsage() {
  const howMany = rand(595, 925);
  const userIds = await getAllUserIds();

  if (userIds.length === 0) {
    console.warn(
      "⚠️ No users found in database, skipping fake log generation."
    );
    return;
  }

  for (let i = 0; i < howMany; i++) {
    const id = uuidv4();
    const user_id = getRandomElement(userIds);
    const token = uuidv4().replace(/-/g, "").slice(0, 32);
    const endpoint = getRandomElement(endpoints);
    const method = getRandomElement(methods);
    const status = getRandomElement(statuses);
    const ip = randomIp();
    const userAgent = randomUserAgent();

    const timestamp = new Date();

    try {
      await pool.query(
        `INSERT INTO api_token_usage 
         (id, user_id, token, endpoint, method, response_status, ip_address, user_agent, request_timestamp)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [id, user_id, token, endpoint, method, status, ip, userAgent, timestamp]
      );
    } catch (err) {
      console.error("❌ Insert error:", err.message);
    }
  }

  console.log(`✅ Inserted ${howMany} fake API token usage records.`);
}

module.exports = { generateFakeApiUsage };
