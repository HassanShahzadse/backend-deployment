/**
 * Manual Encrypted Key Generator
 * Usage: node scripts/manualEncryptKey.js
 */

const { encryptOrderData } = require("../utils/encryption");

// 🔐 Direktno definirani encryption secret
const ENCRYPTION_SECRET = "f52c4d1db3b33a0212add1f095197a59be9eae06b4247b182b68b62c1bbeab81";

// 🔹 Ručno unesi podatke ovdje
const payload = {
  user_id: "ad4c04f7-bdd6-4b6f-84ee-92a2d45555bd",
  amount: 1.0,
  currency: "EUR",
  status: "pending",
  price_eur: 71250.00,
  price_btc: 0.73499446,
  invoice_number: "8000315658-314-9",
  api_calls_quantity: 300000,
  order_number: "PNA25-045817",
  batch_number: "20251020-915",
  created_at: "2025-10-11 09:43:07",

  email: "one@foodbeyonders.com",
  company_name: "FoodBeyonders d.o.o.",
  primary_address: "Zagrebačka avenija 92, Zagreb",
  billing_email: "one@foodbeyonders.com",
  tax_percentage: 25.0,
  vat_id: "39927265625",
};

try {
  const secret = ENCRYPTION_SECRET; // ✅ koristi direktno iz koda

  if (!secret) {
    throw new Error("❌ ENCRYPTION_SECRET nije definiran");
  }

  const encryptedKey = encryptOrderData(payload, secret);

  console.log("✅ Encrypted key generated successfully:\n");
  console.log(encryptedKey);
  console.log("\n🔒 Data used for encryption:");
  console.log(JSON.stringify(payload, null, 2));
} catch (err) {
  console.error("❌ Error generating encrypted key:", err.message);
}
