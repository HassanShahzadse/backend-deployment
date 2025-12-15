const express = require("express");
const router = express.Router();
const pool = require("../db");
const authenticateToken = require("../middleware/auth");

// GET /api/reconciliations - Dohvati sve mjesečne reconciliations za usera
router.get("/", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        id,
        month,
        total_orders,
        total_order_eur,
        total_order_btc,
        total_wallet_btc,
        total_difference_btc,
        total_difference_eur,
        avg_btc_rate,
        status,
        settled_at,
        invoice_url,
        created_at,
        updated_at
      FROM reconciliation_months
      WHERE user_id = $1
      ORDER BY month DESC`,
      [req.user.userId] // <-- ISPRAVKA: userId umjesto id
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching reconciliations:", err);
    res.status(500).json({ error: "Failed to fetch reconciliations" });
  }
});

// GET /api/reconciliations/:id - Dohvati detalje mjeseca + sve ordere
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Dohvati mjesečni sažetak
    const monthResult = await pool.query(
      `SELECT 
        id,
        month,
        total_orders,
        total_order_eur,
        total_order_btc,
        total_wallet_btc,
        total_difference_btc,
        total_difference_eur,
        avg_btc_rate,
        status,
        settled_at,
        invoice_url,
        created_at,
        updated_at
      FROM reconciliation_months
      WHERE id = $1 AND user_id = $2`,
      [id, req.user.userId] // <-- ISPRAVKA: userId umjesto id
    );

    if (monthResult.rows.length === 0) {
      return res.status(404).json({ error: "Reconciliation not found" });
    }

    const month = monthResult.rows[0];

    // Dohvati sve ordere za taj mjesec
    const ordersResult = await pool.query(
      `SELECT 
        id,
        order_id,
        order_number,
        order_date,
        order_eur,
        order_btc,
        wallet_btc,
        btc_rate,
        difference_btc,
        difference_eur,
        created_at
      FROM reconciliation_orders
      WHERE month_id = $1
      ORDER BY order_date ASC, order_number ASC`,
      [id]
    );

    res.json({
      ...month,
      orders: ordersResult.rows,
    });
  } catch (err) {
    console.error("Error fetching reconciliation details:", err);
    res.status(500).json({ error: "Failed to fetch reconciliation details" });
  }
});

// PUT /api/reconciliations/:id - Ažuriraj status (admin)
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, invoice_url } = req.body;

    const result = await pool.query(
      `UPDATE reconciliation_months
      SET 
        status = COALESCE($1, status),
        invoice_url = COALESCE($2, invoice_url),
        settled_at = CASE WHEN $1 = 'settled' THEN NOW() ELSE settled_at END,
        updated_at = NOW()
      WHERE id = $3 AND user_id = $4
      RETURNING *`,
      [status, invoice_url, id, req.user.userId] // <-- ISPRAVKA: userId umjesto id
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Reconciliation not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating reconciliation:", err);
    res.status(500).json({ error: "Failed to update reconciliation" });
  }
});

module.exports = router;
