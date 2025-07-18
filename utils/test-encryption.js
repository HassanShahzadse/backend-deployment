const { encryptOrderData } = require("./encryption");

const dummyData = {
  // Order info
  user_id: "ad4c04f7-bdd6-4b6f-84ee-92a2d45555bd",
  amount: 1.0,
  currency: "EUR",
  status: "pending",
  price_eur: 62937.5,
  price_btc: 0.65292671,
  invoice_number: "8000315658-311-11",
  api_calls_quantity: 265000,
  order_number: "PNA25-038664",
  created_at: "2025-07-12 14:18:49",
  batch_number: "20250714-762",

  // User info
  email: "one@foodbeyonders.com",
  company_name: "FoodBeyonders d.o.o.",
  primary_address: "Zagrebačka avenija 92, Zagreb",
  billing_email: "one@foodbeyonders.com",
  tax_percentage: 25.0,
  vat_id: "39927265625",
};

const secret =
  "f52c4d1db3b33a0212add1f095197a59be9eae06b4247b182b68b62c1bbeab81";

const encrypted = encryptOrderData(dummyData, secret);
console.log("Encrypted key:", encrypted);
