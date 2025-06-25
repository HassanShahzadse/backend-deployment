const express = require("express");
const router = express.Router();
const pool = require("../db");
const crypto = require("crypto");
require("dotenv").config();

// === HELPER: base64url decode ===
function base64urlDecode(data) {
  const pad = 4 - (data.length % 4);
  const base64 = data + "=".repeat(pad % 4);
  return Buffer.from(base64.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

// === HELPER: decrypt order key ===
function decryptOrderData(encryptedKey, secret) {
  const raw = base64urlDecode(encryptedKey);
  const iv = raw.slice(0, 12);
  const tag = raw.slice(12, 28);
  const ciphertext = raw.slice(28);

  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    crypto.createHash("sha256").update(secret).digest(),
    iv
  );
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);
  return JSON.parse(decrypted.toString("utf8"));
}

// === /payment/success ===
router.get("/success", async (req, res) => {
  const key = req.query.key;

  if (!key) {
    return res.status(400).json({ error: "Missing key" });
  }

  try {
    const decrypted = decryptOrderData(key, process.env.ENCRYPTION_SECRET);
    const orderNumber = decrypted.order_number;

    const update = await pool.query(
      "UPDATE orders SET status = 'paid' WHERE order_number = $1 RETURNING *",
      [orderNumber]
    );

    if (update.rowCount === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({
      status: "success",
      message: "Payment received. Order status updated.",
      key,
      order_number: orderNumber,
    });
  } catch (err) {
    console.error("❌ Error in /success:", err);
    res.status(400).json({ error: "Invalid key or decryption failed" });
  }
});

// === /payment/timeout ===
router.get("/timeout", async (req, res) => {
  const key = req.query.key;

  if (!key) {
    return res.status(400).json({ error: "Missing key" });
  }

  try {
    const decrypted = decryptOrderData(key, process.env.ENCRYPTION_SECRET);
    const orderNumber = decrypted.order_number;

    const update = await pool.query(
      "UPDATE orders SET status = 'timeout' WHERE order_number = $1 RETURNING *",
      [orderNumber]
    );

    if (update.rowCount === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({
      status: "timeout",
      message: "Payment not received. Order status updated to timeout.",
      key,
      order_number: orderNumber,
    });
  } catch (err) {
    console.error("❌ Error in /timeout:", err);
    res.status(400).json({ error: "Invalid key or decryption failed" });
  }
});

module.exports = router;
