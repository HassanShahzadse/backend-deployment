const express = require("express");
const router = express.Router();
const pool = require("../db");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
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

    const order = update.rows[0];

    // Reset low credit and zero credit alert flags when user tops up
    try {
      await pool.query(
        `UPDATE user_purchased_counters 
         SET last_low_alert_at = NULL, last_zero_alert_at = NULL 
         WHERE user_id = $1`,
        [order.user_id]
      );
      console.log(`✅ Reset credit alert flags for user ${order.user_id}`);
    } catch (resetErr) {
      console.error("❌ Failed to reset alert flags:", resetErr);
      // Don't fail the payment success response
    }

    // Send success email
    try {
      const userRes = await pool.query(
        `SELECT email, billing_email, company_name FROM users WHERE id = $1`,
        [order.user_id]
      );
      const user = userRes.rows[0];
      const userEmail = user.email || user.billing_email;

      if (userEmail) {
        await sendEmail(
          userEmail,
          `Your Order ${order.order_number} is created successfully`,
          'orderSuccess',
          {
            User_Name: user.company_name || 'Valued Customer',
            ORDER_ID: order.order_number,
            TOTAL_AMOUNT: `${Number(order.price_eur).toFixed(2)} EUR`,
            ORDER_DETAILS_LINK: `${process.env.FRONTEND_URL}/orders`
          }
        );
        console.log(`✅ Success email sent for Order ${order.order_number}`);
      }
    } catch (emailError) {
      console.error("❌ Failed to send success email:", emailError.message);
      // Don't fail the payment success response
    }

    res.json({
      status: "success",
      message: "Payment received. Order status updated.",
      key,
      order_number: orderNumber,
    });
  } catch (err) {
    console.error("❌ Error in /success:", err);

    // Send failure email
    try {
      const decrypted = decryptOrderData(key, process.env.ENCRYPTION_SECRET);
      const orderRes = await pool.query(
        `SELECT user_id, order_number FROM orders WHERE order_number = $1`,
        [decrypted.order_number]
      );

      if (orderRes.rows.length > 0) {
        const order = orderRes.rows[0];
        const userRes = await pool.query(
          `SELECT email, billing_email, company_name FROM users WHERE id = $1`,
          [order.user_id]
        );
        const user = userRes.rows[0];
        const userEmail = user.email || user.billing_email;

        if (userEmail) {
          await sendEmail(
            userEmail,
            'Order Creation Failed',
            'orderFailed',
            {
              User_Name: user.company_name || 'Valued Customer',
              ORDER_ID: order.order_number,
              RETRY_PAYMENT_LINK: `${process.env.FRONTEND_URL}/payment`
            }
          );
        }
      }
    } catch (emailError) {
      console.error("❌ Failed to send failure email:", emailError.message);
    }

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
