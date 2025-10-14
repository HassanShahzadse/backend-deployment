const express = require("express");
const { cryptoquantFetch } = require("../utils/cryptoquant");

const router = express.Router();

// 1️⃣ Active Addresses
router.get("/active-addresses", async (req, res) => {
  try {
    const window = req.query.window || "day";
    const data = await cryptoquantFetch(
      `btc/network-data/addresses-count?window=${window}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      active_addresses: d.addresses_count_active,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2️⃣ Active Receiving Addresses
router.get("/active-receiving-addresses", async (req, res) => {
  try {
    const window = req.query.window || "day";
    const data = await cryptoquantFetch(
      `btc/network-data/addresses-count?window=${window}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      receiving_addresses: d.addresses_count_receiver,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3️⃣ Active Sending Addresses
router.get("/active-sending-addresses", async (req, res) => {
  try {
    const window = req.query.window || "day"; // podržava day, hour, block
    const data = await cryptoquantFetch(
      `btc/network-data/addresses-count?window=${window}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      sending_addresses: d.addresses_count_sender,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4️⃣ Adjusted SOPR (aSOPR)
router.get("/adjusted-sopr", async (req, res) => {
  try {
    const window = req.query.window || "day"; // podržava day, block
    const data = await cryptoquantFetch(`btc/market-indicator/sopr?window=${window}`);

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      a_sopr: d.a_sopr,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5️⃣ Average Cap
router.get("/average-cap", async (req, res) => {
  try {
    const window = req.query.window || "day"; // podržava day, block
    const data = await cryptoquantFetch(
      `btc/market-data/capitalization?window=${window}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      average_cap: d.average_cap,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6️⃣ Average Dormancy
router.get("/average-dormancy", async (req, res) => {
  try {
    const window = req.query.window || "day"; // podržava day, block
    const data = await cryptoquantFetch(
      `btc/network-indicator/dormancy?window=${window}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      average_dormancy: d.average_dormancy,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7️⃣ Average Supply-Adjusted CDD
router.get("/average-sa-cdd", async (req, res) => {
  try {
    const window = req.query.window || "day"; // podržava day, block
    const data = await cryptoquantFetch(`btc/network-indicator/cdd?window=${window}`);

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      average_sa_cdd: d.average_sa_cdd,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8️⃣ Binary CDD
router.get("/binary-cdd", async (req, res) => {
  try {
    const window = req.query.window || "day"; // podržava day, block
    const data = await cryptoquantFetch(`btc/network-indicator/cdd?window=${window}`);

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      binary_cdd: d.binary_cdd,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 9️⃣ Block Interval (Mean)
router.get("/block-interval", async (req, res) => {
  try {
    const window = req.query.window || "day"; // podržava day, hour, block
    const data = await cryptoquantFetch(
      `btc/network-data/block-interval?window=${window}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      block_interval: d.block_interval,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔟 Block Rewards
router.get("/block-rewards", async (req, res) => {
  try {
    const window = req.query.window || "day"; // podržava day, hour, block
    const data = await cryptoquantFetch(`btc/network-data/blockreward?window=${window}`);

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      block_rewards: d.blockreward,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 11️⃣ Block Rewards USD
router.get("/block-rewards-usd", async (req, res) => {
  try {
    const window = req.query.window || "day"; // podržava day, hour, block
    const data = await cryptoquantFetch(`btc/network-data/blockreward?window=${window}`);

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      block_rewards_usd: d.blockreward_usd,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 12️⃣ Block Size (Mean)
router.get("/block-size", async (req, res) => {
  try {
    const window = req.query.window || "day"; // podržava day, hour, block
    const data = await cryptoquantFetch(`btc/network-data/block-bytes?window=${window}`);

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      block_size: d.block_bytes,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 13️⃣ Blocks Mined
router.get("/blocks-mined", async (req, res) => {
  try {
    const window = req.query.window || "day"; // podržava day, hour
    const data = await cryptoquantFetch(`btc/network-data/block-count?window=${window}`);

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      blocks_mined: d.block_count,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 14️⃣ Coin Days Destroyed (CDD)
router.get("/cdd", async (req, res) => {
  try {
    const window = req.query.window || "day"; // podržava day, block
    const data = await cryptoquantFetch(`btc/network-indicator/cdd?window=${window}`);

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      cdd: d.cdd,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 15️⃣ Coinbase Premium Gap
router.get("/coinbase-premium-gap", async (req, res) => {
  try {
    const window = req.query.window || "day"; // podržava day, hour, min
    const data = await cryptoquantFetch(
      `btc/market-data/coinbase-premium-index?window=${window}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      coinbase_premium_gap: d.coinbase_premium_gap,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 16️⃣ Coinbase Premium Index
router.get("/coinbase-premium-index", async (req, res) => {
  try {
    const window = req.query.window || "day"; // podržava day, hour, min
    const data = await cryptoquantFetch(
      `btc/market-data/coinbase-premium-index?window=${window}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      coinbase_premium_index: d.coinbase_premium_index,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 17️⃣ Delta Cap
router.get("/delta-cap", async (req, res) => {
  try {
    const window = req.query.window || "day"; // podržava day, block
    const data = await cryptoquantFetch(
      `btc/market-data/capitalization?window=${window}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      delta_cap: d.delta_cap,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 18️⃣ Difficulty
router.get("/difficulty", async (req, res) => {
  try {
    const window = req.query.window || "day"; // podržava day, hour, block
    const data = await cryptoquantFetch(`btc/network-data/difficulty?window=${window}`);

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      difficulty: d.difficulty,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 19️⃣ Estimated Leverage Ratio
router.get("/estimated-leverage-ratio", async (req, res) => {
  try {
    const window = req.query.window || "day"; // podržava day, hour, block
    const exchange = req.query.exchange || "all_exchange"; // default all_exchange

    const data = await cryptoquantFetch(
      `btc/market-indicator/estimated-leverage-ratio?window=${window}&exchange=${exchange}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      estimated_leverage_ratio: d.estimated_leverage_ratio,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 20️⃣ Exchange Depositing Addresses
router.get("/exchange-depositing-addresses", async (req, res) => {
  try {
    const window = req.query.window || "day"; // podržava day, hour, block
    const exchange = req.query.exchange || "all_exchange"; // default all_exchange

    const data = await cryptoquantFetch(
      `btc/exchange-flows/addresses-count?window=${window}&exchange=${exchange}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      addresses_count_inflow: d.addresses_count_inflow,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 21️⃣ Exchange Depositing Transactions
router.get("/exchange-depositing-transactions", async (req, res) => {
  try {
    const window = req.query.window || "day"; // podržava day, hour, block
    const exchange = req.query.exchange || "all_exchange"; // default all_exchange

    const data = await cryptoquantFetch(
      `btc/exchange-flows/transactions-count?window=${window}&exchange=${exchange}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      transactions_count_inflow: d.transactions_count_inflow,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 22️⃣ Exchange In-House Flow (Mean)
router.get("/exchange-inhouse-flow-mean", async (req, res) => {
  try {
    const window = req.query.window || "day"; // podržava day, hour, block
    const exchange = req.query.exchange || "all_exchange"; // default all_exchange

    const data = await cryptoquantFetch(
      `btc/exchange-flows/in-house-flow?window=${window}&exchange=${exchange}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      flow_mean: d.flow_mean,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 23️⃣ Exchange In-House Flow (Total)
router.get("/exchange-inhouse-flow-total", async (req, res) => {
  try {
    const window = req.query.window || "day"; // podržava day, hour, block
    const exchange = req.query.exchange || "all_exchange"; // default all_exchange

    const data = await cryptoquantFetch(
      `btc/exchange-flows/in-house-flow?window=${window}&exchange=${exchange}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      flow_total: d.flow_total,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 24️⃣ Exchange In-House Transactions
router.get("/exchange-inhouse-transactions", async (req, res) => {
  try {
    const window = req.query.window || "day"; // podržava day, hour, block
    const exchange = req.query.exchange || "all_exchange"; // default all_exchange

    const data = await cryptoquantFetch(
      `btc/exchange-flows/in-house-flow?window=${window}&exchange=${exchange}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      transactions_count_flow: d.transactions_count_flow,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 25️⃣ Exchange Inflow (Mean)
router.get("/exchange-inflow-mean", async (req, res) => {
  try {
    const window = req.query.window || "day"; // podržava day, hour, block
    const exchange = req.query.exchange || "all_exchange"; // default all_exchange

    const data = await cryptoquantFetch(
      `btc/exchange-flows/inflow?window=${window}&exchange=${exchange}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      inflow_mean: d.inflow_mean,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 26️⃣ Exchange Inflow (Mean, MA7)
router.get("/exchange-inflow-mean-ma7", async (req, res) => {
  try {
    const window = req.query.window || "day"; // podržava day, hour, block
    const exchange = req.query.exchange || "all_exchange"; // default all_exchange

    const data = await cryptoquantFetch(
      `btc/exchange-flows/inflow?window=${window}&exchange=${exchange}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      inflow_mean_ma7: d.inflow_mean_ma7,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 27️⃣ Exchange Inflow (Top10)
router.get("/exchange-inflow-top10", async (req, res) => {
  try {
    const window = req.query.window || "day"; // podržava day, hour, block
    const exchange = req.query.exchange || "all_exchange"; // default all_exchange

    const data = await cryptoquantFetch(
      `btc/exchange-flows/inflow?window=${window}&exchange=${exchange}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      inflow_top10: d.inflow_top10,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 28️⃣ Exchange Inflow (Total)
router.get("/exchange-inflow-total", async (req, res) => {
  try {
    const window = req.query.window || "day"; // podržava day, hour, block
    const exchange = req.query.exchange || "all_exchange"; // default all_exchange

    const data = await cryptoquantFetch(
      `btc/exchange-flows/inflow?window=${window}&exchange=${exchange}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      inflow_total: d.inflow_total,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 29️⃣ Exchange Inflow - Spent Output Age Bands
router.get("/exchange-inflow-age-bands", async (req, res) => {
  try {
    const window = req.query.window || "day"; // podržava day, hour, block
    const exchange = req.query.exchange || "all_exchange"; // default all_exchange

    const data = await cryptoquantFetch(
      `btc/flow-indicator/exchange-inflow-age-distribution?window=${window}&exchange=${exchange}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      range_0d_1d: d.range_0d_1d,
      range_1d_1w: d.range_1d_1w,
      range_1w_1m: d.range_1w_1m,
      range_1m_3m: d.range_1m_3m,
      range_3m_6m: d.range_3m_6m,
      range_6m_12m: d.range_6m_12m,
      range_12m_18m: d.range_12m_18m,
      range_18m_2y: d.range_18m_2y,
      range_2y_3y: d.range_2y_3y,
      range_3y_5y: d.range_3y_5y,
      range_5y_7y: d.range_5y_7y,
      range_7y_10y: d.range_7y_10y,
      range_10y_inf: d.range_10y_inf,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 30️⃣ Exchange Inflow - Spent Output Age Bands (%)
router.get("/exchange-inflow-age-bands-percent", async (req, res) => {
  try {
    const window = req.query.window || "day"; // podržava day, hour, block
    const exchange = req.query.exchange || "all_exchange"; // default all_exchange

    const data = await cryptoquantFetch(
      `btc/flow-indicator/exchange-inflow-age-distribution?window=${window}&exchange=${exchange}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      range_0d_1d_percent: d.range_0d_1d_percent,
      range_1d_1w_percent: d.range_1d_1w_percent,
      range_1w_1m_percent: d.range_1w_1m_percent,
      range_1m_3m_percent: d.range_1m_3m_percent,
      range_3m_6m_percent: d.range_3m_6m_percent,
      range_6m_12m_percent: d.range_6m_12m_percent,
      range_12m_18m_percent: d.range_12m_18m_percent,
      range_18m_2y_percent: d.range_18m_2y_percent,
      range_2y_3y_percent: d.range_2y_3y_percent,
      range_3y_5y_percent: d.range_3y_5y_percent,
      range_5y_7y_percent: d.range_5y_7y_percent,
      range_7y_10y_percent: d.range_7y_10y_percent,
      range_10y_inf_percent: d.range_10y_inf_percent,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 31️⃣ Exchange Inflow - Spent Output Value Bands
router.get("/exchange-inflow-value-bands", async (req, res) => {
  try {
    const window = req.query.window || "day"; // podržava day, hour, block
    const exchange = req.query.exchange || "all_exchange"; // default all_exchange

    const data = await cryptoquantFetch(
      `btc/flow-indicator/exchange-inflow-supply-distribution?window=${window}&exchange=${exchange}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      range_0_001: d.range_0_001,
      range_001_01: d.range_001_01,
      range_01_1: d.range_01_1,
      range_1_10: d.range_1_10,
      range_10_100: d.range_10_100,
      range_100_1k: d.range_100_1k,
      range_1k_10k: d.range_1k_10k,
      range_10k_inf: d.range_10k_inf,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 32️⃣ Exchange Inflow - Spent Output Value Bands (%)
router.get("/exchange-inflow-value-bands-percent", async (req, res) => {
  try {
    const window = req.query.window || "day"; // podržava day, hour, block
    const exchange = req.query.exchange || "all_exchange"; // default all_exchange

    const data = await cryptoquantFetch(
      `btc/flow-indicator/exchange-inflow-supply-distribution?window=${window}&exchange=${exchange}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      range_0_001_percent: d.range_0_001_percent,
      range_001_01_percent: d.range_001_01_percent,
      range_01_1_percent: d.range_01_1_percent,
      range_1_10_percent: d.range_1_10_percent,
      range_10_100_percent: d.range_10_100_percent,
      range_100_1k_percent: d.range_100_1k_percent,
      range_1k_10k_percent: d.range_1k_10k_percent,
      range_10k_inf_percent: d.range_10k_inf_percent,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 33️⃣ Exchange Inflow CDD
router.get("/exchange-inflow-cdd", async (req, res) => {
  try {
    const window = req.query.window || "day"; // podržava day, hour, block
    const exchange = req.query.exchange || "all_exchange"; // default all_exchange

    const data = await cryptoquantFetch(
      `btc/flow-indicator/exchange-inflow-cdd?window=${window}&exchange=${exchange}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      inflow_cdd: d.inflow_cdd,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 34️⃣ Exchange Netflow (Total)
router.get("/exchange-netflow-total", async (req, res) => {
  try {
    const window = req.query.window || "day"; // podržava day, hour, block
    const exchange = req.query.exchange || "all_exchange"; // default all_exchange

    const data = await cryptoquantFetch(
      `btc/exchange-flows/netflow?window=${window}&exchange=${exchange}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      netflow_total: d.netflow_total,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 35️⃣ Exchange Outflow (Mean)
router.get("/exchange-outflow-mean", async (req, res) => {
  try {
    const window = req.query.window || "day"; // podržava day, hour, block
    const exchange = req.query.exchange || "all_exchange"; // default all_exchange

    const data = await cryptoquantFetch(
      `btc/exchange-flows/outflow?window=${window}&exchange=${exchange}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      outflow_mean: d.outflow_mean,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 36️⃣ Exchange Outflow (Mean, MA7)
router.get("/exchange-outflow-mean-ma7", async (req, res) => {
  try {
    const window = req.query.window || "day"; // može: day, hour, block
    const exchange = req.query.exchange || "all_exchange"; // default: all_exchange

    const data = await cryptoquantFetch(
      `btc/exchange-flows/outflow?window=${window}&exchange=${exchange}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      outflow_mean_ma7: d.outflow_mean_ma7,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 37️⃣ Exchange Outflow (Top10)
router.get("/exchange-outflow-top10", async (req, res) => {
  try {
    const window = req.query.window || "day"; // može: day, hour, block
    const exchange = req.query.exchange || "all_exchange"; // default: all_exchange

    const data = await cryptoquantFetch(
      `btc/exchange-flows/outflow?window=${window}&exchange=${exchange}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      outflow_top10: d.outflow_top10,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 38️⃣ Exchange Outflow (Total)
router.get("/exchange-outflow-total", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day, hour, block
    const exchange = req.query.exchange || "all_exchange"; // default all_exchange

    const data = await cryptoquantFetch(
      `btc/exchange-flows/outflow?window=${window}&exchange=${exchange}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      outflow_total: d.outflow_total,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 39️⃣ Exchange Reserve
router.get("/exchange-reserve", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day, hour, block
    const exchange = req.query.exchange || "all_exchange"; // default all_exchange

    const data = await cryptoquantFetch(
      `btc/exchange-flows/reserve?window=${window}&exchange=${exchange}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      reserve: d.reserve,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 40️⃣ Exchange Reserve USD
router.get("/exchange-reserve-usd", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day, hour, block
    const exchange = req.query.exchange || "all_exchange"; // default all_exchange

    const data = await cryptoquantFetch(
      `btc/exchange-flows/reserve?window=${window}&exchange=${exchange}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      reserve_usd: d.reserve_usd,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 41️⃣ Exchange Shutdown Index
router.get("/exchange-shutdown-index", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day, hour, block
    const exchange = req.query.exchange || "all_exchange"; // default all_exchange

    const data = await cryptoquantFetch(
      `btc/flow-indicator/exchange-shutdown-index?window=${window}&exchange=${exchange}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      is_shutdown: d.is_shutdown,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 42️⃣ Exchange Stablecoins Ratio
router.get("/exchange-stablecoins-ratio", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day, hour
    const exchange = req.query.exchange || "all_exchange"; // default all_exchange

    const data = await cryptoquantFetch(
      `btc/flow-indicator/stablecoins-ratio?window=${window}&exchange=${exchange}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      stablecoins_ratio: d.stablecoins_ratio,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 43️⃣ Exchange Stablecoins Ratio USD
router.get("/exchange-stablecoins-ratio-usd", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day, hour
    const exchange = req.query.exchange || "all_exchange"; // default all_exchange

    const data = await cryptoquantFetch(
      `btc/flow-indicator/stablecoins-ratio?window=${window}&exchange=${exchange}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      stablecoins_ratio_usd: d.stablecoins_ratio_usd,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 44️⃣ Exchange Stablecoins Ratio (Combined BTC + USD)
router.get("/exchange-stablecoins-ratio/combined", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day, hour
    const exchange = req.query.exchange || "all_exchange"; // default all_exchange

    const data = await cryptoquantFetch(
      `btc/flow-indicator/stablecoins-ratio?window=${window}&exchange=${exchange}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      stablecoins_ratio: d.stablecoins_ratio,
      stablecoins_ratio_usd: d.stablecoins_ratio_usd,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 45️⃣ Exchange Whale Ratio
router.get("/exchange-whale-ratio", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day, hour, block
    const exchange = req.query.exchange || "all_exchange"; // default all_exchange

    const data = await cryptoquantFetch(
      `btc/flow-indicator/exchange-whale-ratio?window=${window}&exchange=${exchange}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      exchange_whale_ratio: d.exchange_whale_ratio,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 46️⃣ Exchange Withdrawing Addresses
router.get("/exchange-withdrawing-addresses", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day, hour, block
    const exchange = req.query.exchange || "all_exchange"; // default all_exchange

    const data = await cryptoquantFetch(
      `btc/exchange-flows/addresses-count?window=${window}&exchange=${exchange}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      addresses_count_outflow: d.addresses_count_outflow,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 47️⃣ Exchange Withdrawing Transactions
router.get("/exchange-withdrawing-transactions", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day, hour, block
    const exchange = req.query.exchange || "all_exchange"; // default all_exchange

    const data = await cryptoquantFetch(
      `btc/exchange-flows/transactions-count?window=${window}&exchange=${exchange}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      transactions_count_outflow: d.transactions_count_outflow,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 48️⃣ Exchange to Exchange Flow (Mean)
router.get("/exchange-to-exchange-flow-mean", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day, hour, block
    const fromExchange = req.query.from_exchange || "all_exchange";
    const toExchange = req.query.to_exchange || "spot_exchange";

    const data = await cryptoquantFetch(
      `btc/inter-entity-flows/exchange-to-exchange?window=${window}&from_exchange=${fromExchange}&to_exchange=${toExchange}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      flow_mean: d.flow_mean,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 49️⃣ Exchange to Exchange Flow (Total)
router.get("/exchange-to-exchange-flow-total", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day, hour, block
    const fromExchange = req.query.from_exchange || "all_exchange";
    const toExchange = req.query.to_exchange || "spot_exchange";

    const data = await cryptoquantFetch(
      `btc/inter-entity-flows/exchange-to-exchange?window=${window}&from_exchange=${fromExchange}&to_exchange=${toExchange}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      flow_total: d.flow_total,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 50️⃣ Exchange to Exchange Transactions
router.get("/exchange-to-exchange-transactions", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day, hour, block
    const fromExchange = req.query.from_exchange || "all_exchange";
    const toExchange = req.query.to_exchange || "spot_exchange";

    const data = await cryptoquantFetch(
      `btc/inter-entity-flows/exchange-to-exchange?window=${window}&from_exchange=${fromExchange}&to_exchange=${toExchange}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      transactions_count_flow: d.transactions_count_flow,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 51️⃣ Exchange to Miner Flow (Mean)
router.get("/exchange-to-miner-flow-mean", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day, hour, block
    const fromExchange = req.query.from_exchange || "all_exchange";
    const toMiner = req.query.to_miner || "all_miner";

    const data = await cryptoquantFetch(
      `btc/inter-entity-flows/exchange-to-miner?window=${window}&from_exchange=${fromExchange}&to_miner=${toMiner}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      flow_mean: d.flow_mean,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 52️⃣ Exchange to Miner Flow (Total)
router.get("/exchange-to-miner-flow-total", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day, hour, block
    const fromExchange = req.query.from_exchange || "all_exchange";
    const toMiner = req.query.to_miner || "all_miner";

    const data = await cryptoquantFetch(
      `btc/inter-entity-flows/exchange-to-miner?window=${window}&from_exchange=${fromExchange}&to_miner=${toMiner}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      flow_total: d.flow_total,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 53️⃣ Exchange to Miner Transactions
router.get("/exchange-to-miner-transactions", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day, hour, block
    const fromExchange = req.query.from_exchange || "all_exchange";
    const toMiner = req.query.to_miner || "all_miner";

    const data = await cryptoquantFetch(
      `btc/inter-entity-flows/exchange-to-miner?window=${window}&from_exchange=${fromExchange}&to_miner=${toMiner}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      transactions_count_flow: d.transactions_count_flow,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 54️⃣ Fees (Total)
router.get("/fees-total", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day, hour, block

    const data = await cryptoquantFetch(`btc/network-data/fees?window=${window}`);

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      fees_total: d.fees_total,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 55️⃣ Fees USD (Total)
router.get("/fees-total-usd", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day, hour, block

    const data = await cryptoquantFetch(`btc/network-data/fees?window=${window}`);

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      fees_total_usd: d.fees_total_usd,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 56️⃣ Fees per Block (Mean)
router.get("/fees-per-block-mean", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day, hour, block

    const data = await cryptoquantFetch(`btc/network-data/fees?window=${window}`);

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      fees_block_mean: d.fees_block_mean,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 57️⃣ Fees per Block USD (Mean)
router.get("/fees-per-block-mean-usd", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day, hour, block

    const data = await cryptoquantFetch(`btc/network-data/fees?window=${window}`);

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      fees_block_mean_usd: d.fees_block_mean_usd,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 58️⃣ Fees per Transaction (Mean)
router.get("/fees-per-transaction-mean", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day, hour, block

    const data = await cryptoquantFetch(
      `btc/network-data/fees-transaction?window=${window}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      fees_transaction_mean: d.fees_transaction_mean,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 59️⃣ Fees per Transaction (Median)
router.get("/fees-per-transaction-median", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day, hour, block

    const data = await cryptoquantFetch(
      `btc/network-data/fees-transaction?window=${window}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      fees_transaction_median: d.fees_transaction_median,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 60️⃣ Fees per Transaction USD (Mean)
router.get("/fees-per-transaction-mean-usd", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day, hour, block

    const data = await cryptoquantFetch(
      `btc/network-data/fees-transaction?window=${window}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      fees_transaction_mean_usd: d.fees_transaction_mean_usd,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 61️⃣ Fees per Transaction USD (Median)
router.get("/fees-per-transaction-median-usd", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day, hour, block

    const data = await cryptoquantFetch(
      `btc/network-data/fees-transaction?window=${window}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      fees_transaction_median_usd: d.fees_transaction_median_usd,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 62️⃣ Fees to Reward Ratio
router.get("/fees-to-reward-ratio", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day, hour, block

    const data = await cryptoquantFetch(`btc/network-data/fees?window=${window}`);

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      fees_to_reward_ratio: d.fees_reward_percent, // vrijednost iz CryptoQuant API-ja
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 63️⃣ Fund Flow Ratio
router.get("/fund-flow-ratio", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day, block
    const exchange = req.query.exchange || "all_exchange";

    const data = await cryptoquantFetch(
      `btc/flow-indicator/fund-flow-ratio?window=${window}&exchange=${exchange}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      fund_flow_ratio: d.fund_flow_ratio, // vrijednost iz CryptoQuant API-ja
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 64️⃣ Fund Holdings
router.get("/fund-holdings", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day
    const symbol = req.query.symbol || "all_symbol";

    const data = await cryptoquantFetch(
      `btc/fund-data/digital-asset-holdings?window=${window}&symbol=${symbol}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      digital_asset_holdings: d.digital_asset_holdings, // vrijednost iz CQ API-ja
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 65️⃣ Fund Market Premium
router.get("/fund-market-premium", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day
    const symbol = req.query.symbol || "all_symbol";

    const data = await cryptoquantFetch(
      `btc/fund-data/market-premium?window=${window}&symbol=${symbol}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      market_premium: d.market_premium, // vrijednost iz CQ API-ja
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 66️⃣ Fund Price (USD)
router.get("/fund-price-usd", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day
    const symbol = req.query.symbol || "gbtc"; // default = Grayscale Bitcoin Trust

    const data = await cryptoquantFetch(
      `btc/fund-data/market-price-usd?window=${window}&symbol=${symbol}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      price_usd_adj_close: d.price_usd_adj_close, // vrijednost iz CQ API-ja
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 67️⃣ Fund Volume
router.get("/fund-volume", async (req, res) => {
  try {
    const window = req.query.window || "day"; // default day
    const symbol = req.query.symbol || "all_symbol"; // default sve

    const data = await cryptoquantFetch(
      `btc/fund-data/market-volume?window=${window}&symbol=${symbol}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      volume: d.volume, // trading volume
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 68️⃣ Funding Rates
router.get("/funding-rates", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day, hour, min
    const exchange = req.query.exchange || "all_exchange"; // default sve burze

    const data = await cryptoquantFetch(
      `btc/market-data/funding-rates?window=${window}&exchange=${exchange}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      funding_rates: d.funding_rates, // vrijednost iz CQ API-ja
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 69️⃣ Hashrate
router.get("/hashrate", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day, hour, block

    const data = await cryptoquantFetch(`btc/network-data/hashrate?window=${window}`);

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      hashrate: d.hashrate, // vrijednost iz CQ API-ja
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 70️⃣ Long Liquidations
router.get("/long-liquidations", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day, hour, min
    const exchange = req.query.exchange || "all_exchange";
    const symbol = req.query.symbol || "all_symbol";

    const data = await cryptoquantFetch(
      `btc/market-data/liquidations?window=${window}&exchange=${exchange}&symbol=${symbol}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      long_liquidations: d.long_liquidations, // vrijednost iz CQ API-ja
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 71️⃣ Long Liquidations USD
router.get("/long-liquidations-usd", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day, hour, min
    const exchange = req.query.exchange || "all_exchange";
    const symbol = req.query.symbol || "all_symbol";

    const data = await cryptoquantFetch(
      `btc/market-data/liquidations?window=${window}&exchange=${exchange}&symbol=${symbol}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      long_liquidations_usd: d.long_liquidations_usd, // vrijednost u USD
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 72️⃣ Long Term Holder SOPR
router.get("/long-term-holder-sopr", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day, block

    const data = await cryptoquantFetch(`btc/market-indicator/sopr?window=${window}`);

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      lth_sopr: d.lth_sopr, // vrijednost iz CQ API-ja
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 73️⃣ MVRV Ratio
router.get("/mvrv-ratio", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day, block

    const data = await cryptoquantFetch(`btc/market-indicator/mvrv?window=${window}`);

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      mvrv: d.mvrv, // vrijednost MVRV ratio
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 74️⃣ Market Cap
router.get("/market-cap", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day, block

    const data = await cryptoquantFetch(
      `btc/market-data/capitalization?window=${window}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      market_cap: d.market_cap, // total market capitalization
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 75️⃣ Mean Coin Age (MCA)
router.get("/mean-coin-age", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day, block

    const data = await cryptoquantFetch(`btc/network-indicator/mca?window=${window}`);

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      mean_coin_age: d.mca,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 76️⃣ Mean Coin Dollar Age (MCDA)
router.get("/mean-coin-dollar-age", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day, block

    const data = await cryptoquantFetch(`btc/network-indicator/mca?window=${window}`);

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      mean_coin_dollar_age: d.mcda,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 77️⃣ Miner Depositing Addresses
router.get("/miner-depositing-addresses", async (req, res) => {
  try {
    const miner = req.query.miner || "all_miner";
    const window = req.query.window || "day"; // day, hour, block

    const data = await cryptoquantFetch(
      `btc/miner-flows/addresses-count?window=${window}&miner=${miner}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      miner_depositing_addresses: d.addresses_count_inflow,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 78️⃣ Miner Depositing Transactions
router.get("/miner-depositing-transactions", async (req, res) => {
  try {
    const miner = req.query.miner || "all_miner";
    const window = req.query.window || "day"; // day, hour, block

    const data = await cryptoquantFetch(
      `btc/miner-flows/transactions-count?window=${window}&miner=${miner}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      miner_depositing_transactions: d.transactions_count_inflow,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 79️⃣ Miner In-House Flow (Mean)
router.get("/miner-in-house-flow-mean", async (req, res) => {
  try {
    const miner = req.query.miner || "all_miner";
    const window = req.query.window || "day"; // day, hour, block

    const data = await cryptoquantFetch(
      `btc/miner-flows/in-house-flow?window=${window}&miner=${miner}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      miner_in_house_flow_mean: d.flow_mean,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 80️⃣ Miner In-House Flow (Total)
router.get("/miner-in-house-flow-total", async (req, res) => {
  try {
    const miner = req.query.miner || "all_miner";
    const window = req.query.window || "day"; // day, hour, block

    const data = await cryptoquantFetch(
      `btc/miner-flows/in-house-flow?window=${window}&miner=${miner}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      miner_in_house_flow_total: d.flow_total,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 81️⃣ Miner In-House Transactions
router.get("/miner-in-house-transactions", async (req, res) => {
  try {
    const miner = req.query.miner || "all_miner";
    const window = req.query.window || "day"; // day, hour, block

    const data = await cryptoquantFetch(
      `btc/miner-flows/in-house-flow?window=${window}&miner=${miner}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      miner_in_house_transactions: d.transactions_count_flow,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 82️⃣ Miner Inflow (Mean)
router.get("/miner-inflow-mean", async (req, res) => {
  try {
    const miner = req.query.miner || "all_miner";
    const window = req.query.window || "day"; // day, hour, block

    const data = await cryptoquantFetch(
      `btc/miner-flows/inflow?window=${window}&miner=${miner}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      miner_inflow_mean: d.inflow_mean,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 83️⃣ Miner Inflow (Mean, MA7)
router.get("/miner-inflow-mean-ma7", async (req, res) => {
  try {
    const miner = req.query.miner || "all_miner";
    const window = req.query.window || "day"; // day, hour, block

    const data = await cryptoquantFetch(
      `btc/miner-flows/inflow?window=${window}&miner=${miner}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      miner_inflow_mean_ma7: d.inflow_mean_ma7,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 84️⃣ Miner Inflow (Top10)
router.get("/miner-inflow-top10", async (req, res) => {
  try {
    const miner = req.query.miner || "all_miner";
    const window = req.query.window || "day"; // day, hour, block

    const data = await cryptoquantFetch(
      `btc/miner-flows/inflow?window=${window}&miner=${miner}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      miner_inflow_top10: d.inflow_top10,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 85️⃣ Miner Inflow (Total)
router.get("/miner-inflow-total", async (req, res) => {
  try {
    const miner = req.query.miner || "all_miner";
    const window = req.query.window || "day"; // day, hour, block

    const data = await cryptoquantFetch(
      `btc/miner-flows/inflow?window=${window}&miner=${miner}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      miner_inflow_total: d.inflow_total,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 86️⃣ Miner Netflow (Total)
router.get("/miner-netflow-total", async (req, res) => {
  try {
    const miner = req.query.miner || "all_miner";
    const window = req.query.window || "day"; // day, hour, block

    const data = await cryptoquantFetch(
      `btc/miner-flows/netflow?window=${window}&miner=${miner}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      miner_netflow_total: d.netflow_total,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 87️⃣ Miner Outflow (Mean)
router.get("/miner-outflow-mean", async (req, res) => {
  try {
    const miner = req.query.miner || "all_miner";
    const window = req.query.window || "day"; // day, hour, block

    const data = await cryptoquantFetch(
      `btc/miner-flows/outflow?window=${window}&miner=${miner}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      miner_outflow_mean: d.outflow_mean,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 88️⃣ Miner Outflow (Mean, MA7)
router.get("/miner-outflow-mean-ma7", async (req, res) => {
  try {
    const miner = req.query.miner || "all_miner";
    const window = req.query.window || "day"; // day, hour, block

    const data = await cryptoquantFetch(
      `btc/miner-flows/outflow?window=${window}&miner=${miner}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      miner_outflow_mean_ma7: d.outflow_mean_ma7,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 89️⃣ Miner Outflow (Top10)
router.get("/miner-outflow-top10", async (req, res) => {
  try {
    const miner = req.query.miner || "all_miner";
    const window = req.query.window || "day"; // day, hour, block

    const data = await cryptoquantFetch(
      `btc/miner-flows/outflow?window=${window}&miner=${miner}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      miner_outflow_top10: d.outflow_top10,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 90️⃣ Miner Outflow (Total)
router.get("/miner-outflow-total", async (req, res) => {
  try {
    const miner = req.query.miner || "all_miner";
    const window = req.query.window || "day"; // day, hour, block

    const data = await cryptoquantFetch(
      `btc/miner-flows/outflow?window=${window}&miner=${miner}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      miner_outflow_total: d.outflow_total,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 91️⃣ Miner Reserve
router.get("/miner-reserve", async (req, res) => {
  try {
    const miner = req.query.miner || "all_miner";
    const window = req.query.window || "day"; // day, hour, block

    const data = await cryptoquantFetch(
      `btc/miner-flows/reserve?window=${window}&miner=${miner}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      miner_reserve: d.reserve,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 92️⃣ Miner Reserve USD
router.get("/miner-reserve-usd", async (req, res) => {
  try {
    const miner = req.query.miner || "all_miner";
    const window = req.query.window || "day"; // day, hour, block

    const data = await cryptoquantFetch(
      `btc/miner-flows/reserve?window=${window}&miner=${miner}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      miner_reserve_usd: d.reserve_usd,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 93️⃣ Miner Supply Ratio
router.get("/miner-supply-ratio", async (req, res) => {
  try {
    const miner = req.query.miner || "all_miner";
    const window = req.query.window || "day"; // day, hour, block

    const data = await cryptoquantFetch(
      `btc/flow-indicator/miner-supply-ratio?window=${window}&miner=${miner}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      miner_supply_ratio: d.miner_supply_ratio,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 94️⃣ Miner Withdrawing Addresses
router.get("/miner-withdrawing-addresses", async (req, res) => {
  try {
    const miner = req.query.miner || "all_miner";
    const window = req.query.window || "day"; // day, hour, block

    const data = await cryptoquantFetch(
      `btc/miner-flows/addresses-count?window=${window}&miner=${miner}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      addresses_count_outflow: d.addresses_count_outflow,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 95️⃣ Miner Withdrawing Transactions
router.get("/miner-withdrawing-transactions", async (req, res) => {
  try {
    const miner = req.query.miner || "all_miner";
    const window = req.query.window || "day"; // day, hour, block

    const data = await cryptoquantFetch(
      `btc/miner-flows/transactions-count?window=${window}&miner=${miner}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      transactions_count_outflow: d.transactions_count_outflow,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 96️⃣ Miner to Exchange Flow (Mean)
router.get("/miner-to-exchange-flow-mean", async (req, res) => {
  try {
    const fromMiner = req.query.fromMiner || "all_miner";
    const toExchange = req.query.toExchange || "all_exchange";
    const window = req.query.window || "day"; // day, hour, block

    const data = await cryptoquantFetch(
      `btc/inter-entity-flows/miner-to-exchange?window=${window}&from_miner=${fromMiner}&to_exchange=${toExchange}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      flow_mean: d.flow_mean,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 97️⃣ Miner to Exchange Flow (Total)
router.get("/miner-to-exchange-flow-total", async (req, res) => {
  try {
    const fromMiner = req.query.fromMiner || "all_miner";
    const toExchange = req.query.toExchange || "all_exchange";
    const window = req.query.window || "day"; // day, hour, block

    const data = await cryptoquantFetch(
      `btc/inter-entity-flows/miner-to-exchange?window=${window}&from_miner=${fromMiner}&to_exchange=${toExchange}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      flow_total: d.flow_total,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 98️⃣ Miner to Exchange Transactions
router.get("/miner-to-exchange-transactions", async (req, res) => {
  try {
    const fromMiner = req.query.fromMiner || "all_miner";
    const toExchange = req.query.toExchange || "all_exchange";
    const window = req.query.window || "day"; // day, hour, block

    const data = await cryptoquantFetch(
      `btc/inter-entity-flows/miner-to-exchange?window=${window}&from_miner=${fromMiner}&to_exchange=${toExchange}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      transactions_count_flow: d.transactions_count_flow,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 99️⃣ Miner to Miner Flow (Mean)
router.get("/miner-to-miner-flow-mean", async (req, res) => {
  try {
    const fromMiner = req.query.fromMiner || "all_miner";
    const toMiner = req.query.toMiner || "1thash"; // default primjer
    const window = req.query.window || "day"; // day, hour, block

    const data = await cryptoquantFetch(
      `btc/inter-entity-flows/miner-to-miner?window=${window}&from_miner=${fromMiner}&to_miner=${toMiner}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      flow_mean: d.flow_mean,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 100️⃣ Miner to Miner Flow (Total)
router.get("/miner-to-miner-flow-total", async (req, res) => {
  try {
    const fromMiner = req.query.fromMiner || "all_miner";
    const toMiner = req.query.toMiner || "1thash"; // default primjer
    const window = req.query.window || "day"; // day, hour, block

    const data = await cryptoquantFetch(
      `btc/inter-entity-flows/miner-to-miner?window=${window}&from_miner=${fromMiner}&to_miner=${toMiner}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      flow_total: d.flow_total,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 101️⃣ Miner to Miner Transactions
router.get("/miner-to-miner-transactions", async (req, res) => {
  try {
    const fromMiner = req.query.fromMiner || "all_miner";
    const toMiner = req.query.toMiner || "1thash"; // default primjer
    const window = req.query.window || "day"; // day, hour, block

    const data = await cryptoquantFetch(
      `btc/inter-entity-flows/miner-to-miner?window=${window}&from_miner=${fromMiner}&to_miner=${toMiner}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      transactions_count_flow: d.transactions_count_flow,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 102️⃣ Miners' Position Index (MPI)
router.get("/miners-position-index", async (req, res) => {
  try {
    const window = req.query.window || "day"; // samo "day" je podržan

    const data = await cryptoquantFetch(`btc/flow-indicator/mpi?window=${window}`);

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      mpi: d.mpi,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 103️⃣ NVM Ratio
router.get("/nvm-ratio", async (req, res) => {
  try {
    const window = req.query.window || "day"; // samo "day" je podržan

    const data = await cryptoquantFetch(`btc/network-indicator/nvm?window=${window}`);

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      nvm: d.nvm,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 104️⃣ NVT Golden Cross
router.get("/nvt-golden-cross", async (req, res) => {
  try {
    const window = req.query.window || "day"; // podržano samo "day"

    const data = await cryptoquantFetch(
      `btc/network-indicator/nvt-golden-cross?window=${window}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      nvt_golden_cross: d.nvt_golden_cross,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 105️⃣ NVT Ratio
router.get("/nvt-ratio", async (req, res) => {
  try {
    const window = req.query.window || "day"; // samo "day" je podržan

    const data = await cryptoquantFetch(`btc/network-indicator/nvt?window=${window}`);

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      nvt: d.nvt,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 106️⃣ Net Realized Profit and Loss (NRPL)
router.get("/net-realized-pnl", async (req, res) => {
  try {
    const window = req.query.window || "day"; // podržava day, hour, block

    const data = await cryptoquantFetch(`btc/network-indicator/nrpl?window=${window}`);

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      nrpl: d.nrpl,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 107️⃣ Net Unrealized Loss (NUL)
router.get("/net-unrealized-loss", async (req, res) => {
  try {
    const window = req.query.window || "day"; // podržava day, block

    const data = await cryptoquantFetch(`btc/network-indicator/nupl?window=${window}`);

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      nul: d.nul,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 108️⃣ Net Unrealized Profit (NUP)
router.get("/net-unrealized-profit", async (req, res) => {
  try {
    const window = req.query.window || "day"; // podržava day, block

    const data = await cryptoquantFetch(`btc/network-indicator/nupl?window=${window}`);

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      nup: d.nup,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 109️⃣ Net Unrealized Profit/Loss (NUPL)
router.get("/net-unrealized-pl", async (req, res) => {
  try {
    const window = req.query.window || "day"; // podržava day, block

    const data = await cryptoquantFetch(`btc/network-indicator/nupl?window=${window}`);

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      nupl: d.nupl,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 110️⃣ New Supply
router.get("/new-supply", async (req, res) => {
  try {
    const window = req.query.window || "day"; // može biti day, hour, block

    const data = await cryptoquantFetch(`btc/network-data/supply?window=${window}`);

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      supply_new: d.supply_new,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 111️⃣ Open Interest
router.get("/open-interest", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day, hour, min
    const exchange = req.query.exchange || "all_exchange";
    const symbol = req.query.symbol || "all_symbol";

    const data = await cryptoquantFetch(
      `btc/market-data/open-interest?window=${window}&exchange=${exchange}&symbol=${symbol}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      open_interest: d.open_interest,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 112️⃣ Price & Volume (OHLCV)
router.get("/price-ohlcv", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day, hour, min
    const market = req.query.market || "spot";
    const exchange = req.query.exchange || "all_exchange";
    const symbol = req.query.symbol || "btc_usd";

    const data = await cryptoquantFetch(
      `btc/market-data/price-ohlcv?window=${window}&market=${market}&exchange=${exchange}&symbol=${symbol}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
      volume: d.volume,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 113️⃣ Puell Multiple
router.get("/puell-multiple", async (req, res) => {
  try {
    const window = req.query.window || "day"; // samo 'day' podržano

    const data = await cryptoquantFetch(
      `btc/network-indicator/puell-multiple?window=${window}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      puell_multiple: d.puell_multiple,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 114️⃣ Realized Cap
router.get("/realized-cap", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day ili block

    const data = await cryptoquantFetch(
      `btc/market-data/capitalization?window=${window}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      realized_cap: d.realized_cap,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 115️⃣ Realized Cap - UTXO Age Bands (%)
router.get("/realized-cap-utxo-age-bands", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day, hour, block

    const data = await cryptoquantFetch(
      `btc/network-indicator/utxo-realized-age-distribution?window=${window}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      range_0d_1d_percent: d.range_0d_1d_percent,
      range_1d_1w_percent: d.range_1d_1w_percent,
      range_1w_1m_percent: d.range_1w_1m_percent,
      range_1m_3m_percent: d.range_1m_3m_percent,
      range_3m_6m_percent: d.range_3m_6m_percent,
      range_6m_12m_percent: d.range_6m_12m_percent,
      range_12m_18m_percent: d.range_12m_18m_percent,
      range_18m_2y_percent: d.range_18m_2y_percent,
      range_2y_3y_percent: d.range_2y_3y_percent,
      range_3y_5y_percent: d.range_3y_5y_percent,
      range_5y_7y_percent: d.range_5y_7y_percent,
      range_7y_10y_percent: d.range_7y_10y_percent,
      range_10y_inf_percent: d.range_10y_inf_percent,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 116️⃣ Realized Cap - UTXO Age Bands (USD)
router.get("/realized-cap-utxo-age-bands-usd", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day, hour, block

    const data = await cryptoquantFetch(
      `btc/network-indicator/utxo-realized-age-distribution?window=${window}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      range_0d_1d_usd: d.range_0d_1d_usd,
      range_1d_1w_usd: d.range_1d_1w_usd,
      range_1w_1m_usd: d.range_1w_1m_usd,
      range_1m_3m_usd: d.range_1m_3m_usd,
      range_3m_6m_usd: d.range_3m_6m_usd,
      range_6m_12m_usd: d.range_6m_12m_usd,
      range_12m_18m_usd: d.range_12m_18m_usd,
      range_18m_2y_usd: d.range_18m_2y_usd,
      range_2y_3y_usd: d.range_2y_3y_usd,
      range_3y_5y_usd: d.range_3y_5y_usd,
      range_5y_7y_usd: d.range_5y_7y_usd,
      range_7y_10y_usd: d.range_7y_10y_usd,
      range_10y_inf_usd: d.range_10y_inf_usd,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 117️⃣ Realized Cap - UTXO Value Bands (%)
router.get("/realized-cap-utxo-value-bands", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day, hour, block

    const data = await cryptoquantFetch(
      `btc/network-indicator/utxo-realized-supply-distribution?window=${window}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      range_0_1_percent: d.range_0_1_percent,
      range_1_10_percent: d.range_1_10_percent,
      range_10_100_percent: d.range_10_100_percent,
      range_100_1k_percent: d.range_100_1k_percent,
      range_1k_10k_percent: d.range_1k_10k_percent,
      range_10k_100k_percent: d.range_10k_100k_percent,
      range_100k_1M_percent: d.range_100k_1M_percent,
      range_1M_inf_percent: d.range_1M_inf_percent,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 118️⃣ Realized Cap - UTXO Value Bands (USD)
router.get("/realized-cap-utxo-value-bands-usd", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day, hour, block

    const data = await cryptoquantFetch(
      `btc/network-indicator/utxo-realized-supply-distribution?window=${window}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      range_0_1_usd: d.range_0_1_usd,
      range_1_10_usd: d.range_1_10_usd,
      range_10_100_usd: d.range_10_100_usd,
      range_100_1k_usd: d.range_100_1k_usd,
      range_1k_10k_usd: d.range_1k_10k_usd,
      range_10k_100k_usd: d.range_10k_100k_usd,
      range_100k_1M_usd: d.range_100k_1M_usd,
      range_1M_inf_usd: d.range_1M_inf_usd,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 119️⃣ Realized Price
router.get("/realized-price", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day ili block

    const data = await cryptoquantFetch(
      `btc/market-indicator/realized-price?window=${window}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      realized_price: d.realized_price,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 120️⃣ Realized Price - UTXO Age Bands
router.get("/realized-price-utxo-age-bands", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day, hour, block

    const data = await cryptoquantFetch(
      `btc/market-indicator/utxo-realized-price-age-distribution?window=${window}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      range_0d_1d: d.range_0d_1d,
      range_1d_1w: d.range_1d_1w,
      range_1w_1m: d.range_1w_1m,
      range_1m_3m: d.range_1m_3m,
      range_3m_6m: d.range_3m_6m,
      range_6m_12m: d.range_6m_12m,
      range_12m_18m: d.range_12m_18m,
      range_18m_2y: d.range_18m_2y,
      range_2y_3y: d.range_2y_3y,
      range_3y_5y: d.range_3y_5y,
      range_5y_7y: d.range_5y_7y,
      range_7y_10y: d.range_7y_10y,
      range_10y_inf: d.range_10y_inf,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 121️⃣ SOPR Ratio (LTH-SOPR / STH-SOPR)
router.get("/sopr-ratio", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day ili block

    const data = await cryptoquantFetch(
      `btc/market-indicator/sopr-ratio?window=${window}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      sopr_ratio: d.sopr_ratio,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 122️⃣ Short Liquidations
router.get("/short-liquidations", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day, hour, min
    const exchange = req.query.exchange || "all_exchange";
    const symbol = req.query.symbol || "all_symbol";

    const data = await cryptoquantFetch(
      `btc/market-data/liquidations?window=${window}&exchange=${exchange}&symbol=${symbol}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      short_liquidations: d.short_liquidations,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 123️⃣ Short Liquidations (USD)
router.get("/short-liquidations-usd", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day, hour, min
    const exchange = req.query.exchange || "all_exchange";
    const symbol = req.query.symbol || "all_symbol";

    const data = await cryptoquantFetch(
      `btc/market-data/liquidations?window=${window}&exchange=${exchange}&symbol=${symbol}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      short_liquidations_usd: d.short_liquidations_usd,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 124️⃣ Short Term Holder SOPR (STH-SOPR)
router.get("/sth-sopr", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day ili block

    const data = await cryptoquantFetch(`btc/market-indicator/sopr?window=${window}`);

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      sth_sopr: d.sth_sopr,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 125️⃣ Spent Output Age Bands
router.get("/spent-output-age-bands", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day, hour, block

    const data = await cryptoquantFetch(
      `btc/network-indicator/spent-output-age-distribution?window=${window}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      range_0d_1d: d.range_0d_1d,
      range_1d_1w: d.range_1d_1w,
      range_1w_1m: d.range_1w_1m,
      range_1m_3m: d.range_1m_3m,
      range_3m_6m: d.range_3m_6m,
      range_6m_12m: d.range_6m_12m,
      range_12m_18m: d.range_12m_18m,
      range_18m_2y: d.range_18m_2y,
      range_2y_3y: d.range_2y_3y,
      range_3y_5y: d.range_3y_5y,
      range_5y_7y: d.range_5y_7y,
      range_7y_10y: d.range_7y_10y,
      range_10y_inf: d.range_10y_inf,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 126️⃣ Spent Output Age Bands (%)
router.get("/spent-output-age-bands-percent", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day, hour, block

    const data = await cryptoquantFetch(
      `btc/network-indicator/spent-output-age-distribution?window=${window}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      range_0d_1d_percent: d.range_0d_1d_percent,
      range_1d_1w_percent: d.range_1d_1w_percent,
      range_1w_1m_percent: d.range_1w_1m_percent,
      range_1m_3m_percent: d.range_1m_3m_percent,
      range_3m_6m_percent: d.range_3m_6m_percent,
      range_6m_12m_percent: d.range_6m_12m_percent,
      range_12m_18m_percent: d.range_12m_18m_percent,
      range_18m_2y_percent: d.range_18m_2y_percent,
      range_2y_3y_percent: d.range_2y_3y_percent,
      range_3y_5y_percent: d.range_3y_5y_percent,
      range_5y_7y_percent: d.range_5y_7y_percent,
      range_7y_10y_percent: d.range_7y_10y_percent,
      range_10y_inf_percent: d.range_10y_inf_percent,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 127️⃣ Spent Output Age Bands (USD)
router.get("/spent-output-age-bands-usd", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day, hour, block

    const data = await cryptoquantFetch(
      `btc/network-indicator/spent-output-age-distribution?window=${window}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      range_0d_1d_usd: d.range_0d_1d_usd,
      range_1d_1w_usd: d.range_1d_1w_usd,
      range_1w_1m_usd: d.range_1w_1m_usd,
      range_1m_3m_usd: d.range_1m_3m_usd,
      range_3m_6m_usd: d.range_3m_6m_usd,
      range_6m_12m_usd: d.range_6m_12m_usd,
      range_12m_18m_usd: d.range_12m_18m_usd,
      range_18m_2y_usd: d.range_18m_2y_usd,
      range_2y_3y_usd: d.range_2y_3y_usd,
      range_3y_5y_usd: d.range_3y_5y_usd,
      range_5y_7y_usd: d.range_5y_7y_usd,
      range_7y_10y_usd: d.range_7y_10y_usd,
      range_10y_inf_usd: d.range_10y_inf_usd,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 128️⃣ Spent Output Profit Ratio (SOPR)
router.get("/sopr", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day ili block

    const data = await cryptoquantFetch(`btc/market-indicator/sopr?window=${window}`);

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      sopr: d.sopr,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 129️⃣ Spent Output Value Bands
router.get("/spent-output-value-bands", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day, hour, block

    const data = await cryptoquantFetch(
      `btc/network-indicator/spent-output-supply-distribution?window=${window}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      range_0_001: d.range_0_001,
      range_001_01: d.range_001_01,
      range_01_1: d.range_01_1,
      range_1_10: d.range_1_10,
      range_10_100: d.range_10_100,
      range_100_1k: d.range_100_1k,
      range_1k_10k: d.range_1k_10k,
      range_10k_inf: d.range_10k_inf,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 130️⃣ Spent Output Value Bands (%)
router.get("/spent-output-value-bands-percent", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day, hour, block

    const data = await cryptoquantFetch(
      `btc/network-indicator/spent-output-supply-distribution?window=${window}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      range_0_001_percent: d.range_0_001_percent,
      range_001_01_percent: d.range_001_01_percent,
      range_01_1_percent: d.range_01_1_percent,
      range_1_10_percent: d.range_1_10_percent,
      range_10_100_percent: d.range_10_100_percent,
      range_100_1k_percent: d.range_100_1k_percent,
      range_1k_10k_percent: d.range_1k_10k_percent,
      range_10k_inf_percent: d.range_10k_inf_percent,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 131️⃣ Spent Output Value Bands (USD)
router.get("/spent-output-value-bands-usd", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day, hour, block

    const data = await cryptoquantFetch(
      `btc/network-indicator/spent-output-supply-distribution?window=${window}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      range_0_1_usd: d.range_0_1_usd,
      range_1_10_usd: d.range_1_10_usd,
      range_10_100_usd: d.range_10_100_usd,
      range_100_1k_usd: d.range_100_1k_usd,
      range_1k_10k_usd: d.range_1k_10k_usd,
      range_10k_100k_usd: d.range_10k_100k_usd,
      range_100k_1M_usd: d.range_100k_1M_usd,
      range_1M_inf_usd: d.range_1M_inf_usd,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 132️⃣ Stablecoin Supply Ratio (SSR)
router.get("/stablecoin-supply-ratio", async (req, res) => {
  try {
    const window = req.query.window || "day"; // samo 'day' podržano

    const data = await cryptoquantFetch(
      `btc/market-indicator/stablecoin-supply-ratio?window=${window}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      stablecoin_supply_ratio: d.stablecoin_supply_ratio,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 133️⃣ Stock-to-Flow Ratio
router.get("/stock-to-flow", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day, hour, block

    const data = await cryptoquantFetch(
      `btc/network-indicator/stock-to-flow?window=${window}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      stock_to_flow: d.stock_to_flow,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 134️⃣ Stock-to-Flow Reversion
router.get("/stock-to-flow-reversion", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day, hour, block

    const data = await cryptoquantFetch(
      `btc/network-indicator/stock-to-flow?window=${window}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      stock_to_flow_reversion: d.stock_to_flow_reversion,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 135️⃣ Sum Coin Age (SCA)
router.get("/sum-coin-age", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day ili block

    const data = await cryptoquantFetch(`btc/network-indicator/sca?window=${window}`);

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      sca: d.sca,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 136️⃣ Sum Coin Age Distribution
router.get("/sum-coin-age-distribution", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day ili block

    const data = await cryptoquantFetch(
      `btc/network-indicator/sca-distribution?window=${window}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      range_0d_1d: d.range_0d_1d,
      range_1d_1w: d.range_1d_1w,
      range_1w_1m: d.range_1w_1m,
      range_1m_3m: d.range_1m_3m,
      range_3m_6m: d.range_3m_6m,
      range_6m_12m: d.range_6m_12m,
      range_12m_18m: d.range_12m_18m,
      range_18m_2y: d.range_18m_2y,
      range_2y_3y: d.range_2y_3y,
      range_3y_5y: d.range_3y_5y,
      range_5y_7y: d.range_5y_7y,
      range_7y_10y: d.range_7y_10y,
      range_10y_inf: d.range_10y_inf,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 137️⃣ Sum Coin Age Distribution (%)
router.get("/sum-coin-age-distribution-percent", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day ili block

    const data = await cryptoquantFetch(
      `btc/network-indicator/sca-distribution?window=${window}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      range_0d_1d_percent: d.range_0d_1d_percent,
      range_1d_1w_percent: d.range_1d_1w_percent,
      range_1w_1m_percent: d.range_1w_1m_percent,
      range_1m_3m_percent: d.range_1m_3m_percent,
      range_3m_6m_percent: d.range_3m_6m_percent,
      range_6m_12m_percent: d.range_6m_12m_percent,
      range_12m_18m_percent: d.range_12m_18m_percent,
      range_18m_2y_percent: d.range_18m_2y_percent,
      range_2y_3y_percent: d.range_2y_3y_percent,
      range_3y_5y_percent: d.range_3y_5y_percent,
      range_5y_7y_percent: d.range_5y_7y_percent,
      range_7y_10y_percent: d.range_7y_10y_percent,
      range_10y_inf_percent: d.range_10y_inf_percent,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 138️⃣ Sum Coin Dollar Age (SCDA)
router.get("/sum-coin-dollar-age", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day ili block

    const data = await cryptoquantFetch(`btc/network-indicator/sca?window=${window}`);

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      scda: d.scda,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 139️⃣ Supply Adjusted Dormancy
router.get("/supply-adjusted-dormancy", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day ili block

    const data = await cryptoquantFetch(
      `btc/network-indicator/dormancy?window=${window}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      sa_average_dormancy: d.sa_average_dormancy,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 140️⃣ Supply in Loss
router.get("/supply-in-loss", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day ili block

    const data = await cryptoquantFetch(
      `btc/network-indicator/pnl-supply?window=${window}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      loss_amount: d.loss_amount,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 141️⃣ Supply in Loss (%)
router.get("/supply-in-loss-percent", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day ili block

    const data = await cryptoquantFetch(
      `btc/network-indicator/pnl-supply?window=${window}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      loss_percent: d.loss_percent,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 142️⃣ Supply in Profit
router.get("/supply-in-profit", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day ili block

    const data = await cryptoquantFetch(
      `btc/network-indicator/pnl-supply?window=${window}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      profit_amount: d.profit_amount,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 143️⃣ Supply in Profit (%)
router.get("/supply-in-profit-percent", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day ili block

    const data = await cryptoquantFetch(
      `btc/network-indicator/pnl-supply?window=${window}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      profit_percent: d.profit_percent,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 144️⃣ Supply-Adjusted CDD
router.get("/supply-adjusted-cdd", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day ili block

    const data = await cryptoquantFetch(`btc/network-indicator/cdd?window=${window}`);

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      sa_cdd: d.sa_cdd,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 145️⃣ Taker Buy Ratio
router.get("/taker-buy-ratio", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day, hour, min
    const exchange = req.query.exchange || "all_exchange";

    const data = await cryptoquantFetch(
      `btc/market-data/taker-buy-sell-stats?window=${window}&exchange=${exchange}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      taker_buy_ratio: d.taker_buy_ratio,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 146️⃣ Taker Buy Sell Ratio
router.get("/taker-buy-sell-ratio", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day, hour, min
    const exchange = req.query.exchange || "all_exchange";

    const data = await cryptoquantFetch(
      `btc/market-data/taker-buy-sell-stats?window=${window}&exchange=${exchange}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      taker_buy_sell_ratio: d.taker_buy_sell_ratio,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 147️⃣ Taker Buy Volume
router.get("/taker-buy-volume", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day, hour, min
    const exchange = req.query.exchange || "all_exchange";

    const data = await cryptoquantFetch(
      `btc/market-data/taker-buy-sell-stats?window=${window}&exchange=${exchange}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      taker_buy_volume: d.taker_buy_volume,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 148️⃣ Taker Sell Ratio
router.get("/taker-sell-ratio", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day, hour, min
    const exchange = req.query.exchange || "all_exchange";

    const data = await cryptoquantFetch(
      `btc/market-data/taker-buy-sell-stats?window=${window}&exchange=${exchange}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      taker_sell_ratio: d.taker_sell_ratio,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 149️⃣ Taker Sell Volume
router.get("/taker-sell-volume", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day, hour, min
    const exchange = req.query.exchange || "all_exchange";

    const data = await cryptoquantFetch(
      `btc/market-data/taker-buy-sell-stats?window=${window}&exchange=${exchange}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      taker_sell_volume: d.taker_sell_volume,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 150️⃣ Thermo Cap
router.get("/thermo-cap", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day ili block

    const data = await cryptoquantFetch(
      `btc/market-data/capitalization?window=${window}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      thermo_cap: d.thermo_cap,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 151️⃣ Tokens Transferred (Mean)
router.get("/tokens-transferred-mean", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day, hour, block

    const data = await cryptoquantFetch(
      `btc/network-data/tokens-transferred?window=${window}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      tokens_transferred_mean: d.tokens_transferred_mean,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 152️⃣ Tokens Transferred (Median)
router.get("/tokens-transferred-median", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day, hour, block

    const data = await cryptoquantFetch(
      `btc/network-data/tokens-transferred?window=${window}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      tokens_transferred_median: d.tokens_transferred_median,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 153️⃣ Tokens Transferred (Total)
router.get("/tokens-transferred-total", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day, hour, block

    const data = await cryptoquantFetch(
      `btc/network-data/tokens-transferred?window=${window}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      tokens_transferred_total: d.tokens_transferred_total,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 154️⃣ Total Supply
router.get("/total-supply", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day, hour, block

    const data = await cryptoquantFetch(`btc/network-data/supply?window=${window}`);

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      supply_total: d.supply_total,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 155️⃣ Transaction Count (Mean)
router.get("/transaction-count-mean", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day, hour, block

    const data = await cryptoquantFetch(
      `btc/network-data/transactions-count?window=${window}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      transactions_count_mean: d.transactions_count_mean,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 156️⃣ Transaction Count (Total)
router.get("/transaction-count-total", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day, hour, block

    const data = await cryptoquantFetch(
      `btc/network-data/transactions-count?window=${window}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      transactions_count_total: d.transactions_count_total,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 157️⃣ UTXO Age Bands
router.get("/utxo-age-bands", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day, hour, block

    const data = await cryptoquantFetch(
      `btc/network-indicator/utxo-age-distribution?window=${window}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      range_0d_1d: d.range_0d_1d,
      range_1d_1w: d.range_1d_1w,
      range_1w_1m: d.range_1w_1m,
      range_1m_3m: d.range_1m_3m,
      range_3m_6m: d.range_3m_6m,
      range_6m_12m: d.range_6m_12m,
      range_12m_18m: d.range_12m_18m,
      range_18m_2y: d.range_18m_2y,
      range_2y_3y: d.range_2y_3y,
      range_3y_5y: d.range_3y_5y,
      range_5y_7y: d.range_5y_7y,
      range_7y_10y: d.range_7y_10y,
      range_10y_inf: d.range_10y_inf,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 158️⃣ UTXO Age Bands (%)
router.get("/utxo-age-bands-percent", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day, hour, block

    const data = await cryptoquantFetch(
      `btc/network-indicator/utxo-age-distribution?window=${window}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      range_0d_1d_percent: d.range_0d_1d_percent,
      range_1d_1w_percent: d.range_1d_1w_percent,
      range_1w_1m_percent: d.range_1w_1m_percent,
      range_1m_3m_percent: d.range_1m_3m_percent,
      range_3m_6m_percent: d.range_3m_6m_percent,
      range_6m_12m_percent: d.range_6m_12m_percent,
      range_12m_18m_percent: d.range_12m_18m_percent,
      range_18m_2y_percent: d.range_18m_2y_percent,
      range_2y_3y_percent: d.range_2y_3y_percent,
      range_3y_5y_percent: d.range_3y_5y_percent,
      range_5y_7y_percent: d.range_5y_7y_percent,
      range_7y_10y_percent: d.range_7y_10y_percent,
      range_10y_inf_percent: d.range_10y_inf_percent,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 159️⃣ UTXO Age Bands (USD)
router.get("/utxo-age-bands-usd", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day, hour, block

    const data = await cryptoquantFetch(
      `btc/network-indicator/utxo-age-distribution?window=${window}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      range_0d_1d_usd: d.range_0d_1d_usd,
      range_1d_1w_usd: d.range_1d_1w_usd,
      range_1w_1m_usd: d.range_1w_1m_usd,
      range_1m_3m_usd: d.range_1m_3m_usd,
      range_3m_6m_usd: d.range_3m_6m_usd,
      range_6m_12m_usd: d.range_6m_12m_usd,
      range_12m_18m_usd: d.range_12m_18m_usd,
      range_18m_2y_usd: d.range_18m_2y_usd,
      range_2y_3y_usd: d.range_2y_3y_usd,
      range_3y_5y_usd: d.range_3y_5y_usd,
      range_5y_7y_usd: d.range_5y_7y_usd,
      range_7y_10y_usd: d.range_7y_10y_usd,
      range_10y_inf_usd: d.range_10y_inf_usd,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 160️⃣ UTXO Count
router.get("/utxo-count", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day, hour, block

    const data = await cryptoquantFetch(`btc/network-data/utxo-count?window=${window}`);

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      utxo_count: d.utxo_count,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 161️⃣ UTXO Count - Age Bands
router.get("/utxo-count-age-bands", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day, hour, block

    const data = await cryptoquantFetch(
      `btc/network-indicator/utxo-count-age-distribution?window=${window}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      range_0d_1d: d.range_0d_1d,
      range_1d_1w: d.range_1d_1w,
      range_1w_1m: d.range_1w_1m,
      range_1m_3m: d.range_1m_3m,
      range_3m_6m: d.range_3m_6m,
      range_6m_12m: d.range_6m_12m,
      range_12m_18m: d.range_12m_18m,
      range_18m_2y: d.range_18m_2y,
      range_2y_3y: d.range_2y_3y,
      range_3y_5y: d.range_3y_5y,
      range_5y_7y: d.range_5y_7y,
      range_7y_10y: d.range_7y_10y,
      range_10y_inf: d.range_10y_inf,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 162️⃣ UTXO Count - Age Bands (%)
router.get("/utxo-count-age-bands-percent", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day, hour, block

    const data = await cryptoquantFetch(
      `btc/network-indicator/utxo-count-age-distribution?window=${window}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      range_0d_1d_percent: d.range_0d_1d_percent,
      range_1d_1w_percent: d.range_1d_1w_percent,
      range_1w_1m_percent: d.range_1w_1m_percent,
      range_1m_3m_percent: d.range_1m_3m_percent,
      range_3m_6m_percent: d.range_3m_6m_percent,
      range_6m_12m_percent: d.range_6m_12m_percent,
      range_12m_18m_percent: d.range_12m_18m_percent,
      range_18m_2y_percent: d.range_18m_2y_percent,
      range_2y_3y_percent: d.range_2y_3y_percent,
      range_3y_5y_percent: d.range_3y_5y_percent,
      range_5y_7y_percent: d.range_5y_7y_percent,
      range_7y_10y_percent: d.range_7y_10y_percent,
      range_10y_inf_percent: d.range_10y_inf_percent,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 163️⃣ UTXO Count - Value Bands
router.get("/utxo-count-value-bands", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day, hour, block

    const data = await cryptoquantFetch(
      `btc/network-indicator/utxo-count-supply-distribution?window=${window}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      range_0_001: d.range_0_001,
      range_001_01: d.range_001_01,
      range_01_1: d.range_01_1,
      range_1_10: d.range_1_10,
      range_10_100: d.range_10_100,
      range_100_1k: d.range_100_1k,
      range_1k_10k: d.range_1k_10k,
      range_10k_inf: d.range_10k_inf,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 164️⃣ UTXO Count - Value Bands (%)
router.get("/utxo-count-value-bands-percent", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day, hour, block

    const data = await cryptoquantFetch(
      `btc/network-indicator/utxo-count-supply-distribution?window=${window}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      range_0_001_percent: d.range_0_001_percent,
      range_001_01_percent: d.range_001_01_percent,
      range_01_1_percent: d.range_01_1_percent,
      range_1_10_percent: d.range_1_10_percent,
      range_10_100_percent: d.range_10_100_percent,
      range_100_1k_percent: d.range_100_1k_percent,
      range_1k_10k_percent: d.range_1k_10k_percent,
      range_10k_inf_percent: d.range_10k_inf_percent,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 165️⃣ UTXO Value Bands
router.get("/utxo-value-bands", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day, hour, block

    const data = await cryptoquantFetch(
      `btc/network-indicator/utxo-supply-distribution?window=${window}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      range_0_001: d.range_0_001,
      range_001_01: d.range_001_01,
      range_01_1: d.range_01_1,
      range_1_10: d.range_1_10,
      range_10_100: d.range_10_100,
      range_100_1k: d.range_100_1k,
      range_1k_10k: d.range_1k_10k,
      range_10k_inf: d.range_10k_inf,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 166️⃣ UTXO Value Bands (%)
router.get("/utxo-value-bands-percent", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day, hour, block

    const data = await cryptoquantFetch(
      `btc/network-indicator/utxo-supply-distribution?window=${window}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      range_0_001_percent: d.range_0_001_percent,
      range_001_01_percent: d.range_001_01_percent,
      range_01_1_percent: d.range_01_1_percent,
      range_1_10_percent: d.range_1_10_percent,
      range_10_100_percent: d.range_10_100_percent,
      range_100_1k_percent: d.range_100_1k_percent,
      range_1k_10k_percent: d.range_1k_10k_percent,
      range_10k_inf_percent: d.range_10k_inf_percent,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 167️⃣ UTXOs in Loss
router.get("/utxos-in-loss", async (req, res) => {
  try {
    const window = req.query.window || "day"; // samo "day" podržan

    const data = await cryptoquantFetch(
      `btc/network-indicator/pnl-utxo?window=${window}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      loss_amount: d.loss_amount,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 168️⃣ UTXOs in Loss (%)
router.get("/utxos-in-loss-percent", async (req, res) => {
  try {
    const window = req.query.window || "day"; // samo "day" podržan

    const data = await cryptoquantFetch(
      `btc/network-indicator/pnl-utxo?window=${window}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      loss_percent: d.loss_percent,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 169️⃣ UTXOs in Profit
router.get("/utxos-in-profit", async (req, res) => {
  try {
    const window = req.query.window || "day"; // samo "day" podržan

    const data = await cryptoquantFetch(
      `btc/network-indicator/pnl-utxo?window=${window}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      profit_amount: d.profit_amount,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 170️⃣ UTXOs in Profit (%)
router.get("/utxos-in-profit-percent", async (req, res) => {
  try {
    const window = req.query.window || "day"; // samo "day" podržan

    const data = await cryptoquantFetch(
      `btc/network-indicator/pnl-utxo?window=${window}`
    );

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      profit_percent: d.profit_percent,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 171️⃣ Velocity
router.get("/velocity", async (req, res) => {
  try {
    const window = req.query.window || "day"; // day, hour, block

    const data = await cryptoquantFetch(`btc/network-data/velocity?window=${window}`);

    if (!data.result || !Array.isArray(data.result.data)) {
      return res.status(500).json({ error: "Unexpected API format", data });
    }

    const filtered = data.result.data.map((d) => ({
      date: d.date,
      velocity_supply_total: d.velocity_supply_total,
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



module.exports = router;
