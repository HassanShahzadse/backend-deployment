const express = require("express");
const router = express.Router();
const pool = require("../db");
const authenticateToken = require("../middleware/auth");
const { encryptOrderData } = require("../utils/encryption");
require("dotenv").config();
const axios = require("axios");
const crypto = require("crypto");

// Funkcija za dohvat BTC cijene
async function getBTCPriceEUR() {
  try {
    const response = await axios.get(
      "https://api.coingecko.com/api/v3/simple/price",
      {
        params: {
          ids: "bitcoin",
          vs_currencies: "eur",
        },
      }
    );

    const btcPrice = response.data.bitcoin.eur;
    const randomReduction = Math.random() * (0.14 - 0.08) + 0.08;

    const reducedPrice = btcPrice * (1 + randomReduction);
    return reducedPrice;
  } catch (error) {
    console.error("Greška pri dohvaćanju BTC cijene:", error);
    throw new Error("Neuspješno dohvaćanje BTC cijene");
  }
}

// Kreiraj novu narudžbu
router.post("/", authenticateToken, async (req, res) => {
  const { amount, currency, status, price_eur, api_calls_quantity } = req.body;

  try {
    const client = await pool.connect();

    // 1. Dohvati trenutnu cijenu BTC-a u EUR
    const btcPriceEur = await getBTCPriceEUR();

    // 2. Izračunaj price_btc
    const price_btc = parseFloat((price_eur / btcPriceEur).toFixed(8));

    // 3. Generiraj invoice_number
    const now = new Date();

    // 0. Ažuriraj zadnju pending narudžbu korisnika (ako postoji) → makni invoice_number i postavi status na 'canceled'
    await client.query(
      `UPDATE orders
       SET invoice_number = NULL,
           status = 'canceled'
       WHERE id IN (
         SELECT id FROM orders
         WHERE user_id = $1
           AND status = 'pending'
           AND invoice_number IS NOT NULL
         ORDER BY created_at DESC
         LIMIT 1
       )`,
      [req.user.userId]
    );

    // Izračunaj monthSequence: 309 za svibanj 2025, svaki mjesec +1
    const baseMonth = 4; // svibanj je 4. mjesec (indexirano od 0)
    const baseSequence = 309;
    const currentSequence =
      baseSequence +
      (now.getMonth() - baseMonth) +
      (now.getFullYear() - 2025) * 12;

    // Dohvati sve invoice_number za taj monthSequence
    const invoiceCheck = await client.query(
      `SELECT invoice_number FROM orders
   WHERE invoice_number LIKE $1`,
      [`8000315658-${currentSequence}-%`]
    );

    let invoiceRand;
    if (invoiceCheck.rowCount === 0) {
      // Prvi račun u mjesecu → random broj 1–9
      invoiceRand = Math.floor(Math.random() * 9) + 1;
    } else {
      // Idući redni broj → max + 1
      const used = invoiceCheck.rows.map((row) => {
        const match = row.invoice_number.match(/8000315658-\d+-(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      });
      invoiceRand = Math.max(...used) + 1;
    }

    const invoiceNumber = `8000315658-${currentSequence}-${invoiceRand}`;

    // 4. Generiraj order_number
    const lastOrderRes = await client.query(
      `SELECT order_number 
   FROM orders 
   WHERE order_number IS NOT NULL 
   ORDER BY created_at DESC 
   LIMIT 1`
    );

    let lastNum = 30000; // default ako nema nijednog
    if (lastOrderRes.rowCount > 0) {
      const match = lastOrderRes.rows[0].order_number.match(/PNA25-(\d+)/);
      if (match) lastNum = parseInt(match[1], 10);
    }

    // Povećaj za random između 20–99
    const increment = Math.floor(Math.random() * (99 - 20 + 1)) + 20;
    const newOrderNumber = `PNA25-${String(lastNum + increment).padStart(
      6,
      "0"
    )}`;

    // 5. Dohvati korisničke podatke
    const userRes = await client.query(
      `SELECT email, company_name, primary_address, billing_email, tax_percentage, vat_id 
   FROM users WHERE id = $1`,
      [req.user.userId]
    );
    const user = userRes.rows[0];

    // 6. Pripremi podatke narudžbe
    const createdAt = new Date();
    const createdAtFormatted = createdAt
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    const tempOrder = {
      user_id: req.user.userId,
      amount,
      currency,
      status: status || "pending",
      price_eur,
      price_btc,
      invoice_number: invoiceNumber,
      api_calls_quantity: api_calls_quantity || 0,
      order_number: newOrderNumber,
      created_at: createdAtFormatted,
    };

    const payload = { ...tempOrder, ...user };

    // 7. Šifriraj podatke
    const encryptedKey = encryptOrderData(
      payload,
      process.env.ENCRYPTION_SECRET
    );

    // 8. Spremi narudžbu u bazu
    const insertRes = await client.query(
      `INSERT INTO orders (
    user_id, amount, currency, status, price_eur, price_btc,
    invoice_number, api_calls_quantity, order_number, encrypted_key
  ) VALUES (
    $1, $2, $3, $4, $5, $6,
    $7, $8, $9, $10
  ) RETURNING 
    user_id, amount, currency, status, price_eur, price_btc,
    invoice_number, api_calls_quantity, order_number, encrypted_key,
    TO_CHAR(created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Europe/Zagreb', 'YYYY-MM-DD HH24:MI:SS') AS created_at`,
      [
        req.user.userId,
        amount,
        currency,
        status || "pending",
        price_eur,
        price_btc,
        invoiceNumber,
        api_calls_quantity || 0,
        newOrderNumber,
        encryptedKey,
      ]
    );

    const order = insertRes.rows[0];

    client.release();

    res.status(201).json({
      ...order,
      ...user,
    });
  } catch (err) {
    console.error("Greška pri kreiranju narudžbe:", err);
    res.status(500).json({ error: err.message });
  }
});

// Dohvati jednu narudžbu po ID-u (samo ako je korisnik vlasnik)
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM orders WHERE id = $1 AND user_id = $2",
      [req.params.id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Dohvati sve narudžbe za prijavljenog korisnika
router.get("/", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC",
      [req.user.userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Greška pri dohvaćanju narudžbi:", err);
    res.status(500).json({ error: err.message });
  }
});

// Izračun cijene na osnovu broja API poziva (bez kreiranja narudžbe)
router.post("/preview", authenticateToken, async (req, res) => {
  const { apiCalls } = req.body;

  if (!apiCalls || apiCalls <= 0) {
    return res
      .status(400)
      .json({ error: "API call quantity must be greater than 0." });
  }

  try {
    const pricePerCall = 0.19; // €0.025 po pozivu
    const taxPercentage = 25; // PDV 25%

    const amount = parseFloat(apiCalls);
    const subtotal = amount * pricePerCall;
    const tax = subtotal * (taxPercentage / 100);
    const total = subtotal + tax;

    res.json({
      apiCalls: amount,
      pricePerCall,
      taxPercentage,
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2),
      currency: "EUR",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obriši narudžbu putem encrypted_key
router.delete("/", async (req, res) => {
  const { key } = req.query;

  if (!key) {
    return res.status(400).json({ error: "Missing key" });
  }

  try {
    const deleteRes = await pool.query(
      "DELETE FROM orders WHERE encrypted_key = $1 RETURNING *",
      [key]
    );

    if (deleteRes.rowCount === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({ message: "Order successfully deleted" });
  } catch (err) {
    console.error("Error deleting order:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Resetiraj invoice_number putem encrypted_key
router.patch("/reset-invoice", async (req, res) => {
  const { key } = req.query;

  if (!key) {
    return res.status(400).json({ error: "Missing key" });
  }

  try {
    const updateRes = await pool.query(
      `UPDATE orders 
       SET invoice_number = NULL, status = 'cancelled' 
       WHERE encrypted_key = $1 
       RETURNING *`,
      [key]
    );

    if (updateRes.rowCount === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({ message: "Invoice number removed", order: updateRes.rows[0] });
  } catch (err) {
    console.error("Error resetting invoice number:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
