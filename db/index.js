const path = require("path");
const { Pool } = require("pg");

// Učitaj .env iz backend root-a, neovisno od mjesta pokretanja skripte
require("dotenv").config({
  path: path.resolve(__dirname, "..", ".env"),
});

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error(
    "DATABASE_URL is not set. Check backend/.env or how you start the script."
  );
}

// Brza validacija i debug
try {
  const u = new URL(url);
  // console.log("PG ->", { host: u.hostname, db: u.pathname.slice(1), user: u.username });
} catch (e) {
  throw new Error(
    `Invalid DATABASE_URL format. Expect postgres://user:pass@host:port/db. ${e.message}`
  );
}

const ssl =
  process.env.PGSSL === "true" ? { rejectUnauthorized: false } : false;

const pool = new Pool({
  connectionString: url,
  ssl,
});

pool
  .connect()
  .then(() => console.log("✅ Connected to PostgreSQL database"))
  .catch((err) => console.error("❌ Database connection error:", err));

module.exports = pool;
