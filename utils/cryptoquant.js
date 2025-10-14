const fetch = require("node-fetch");

const CQ_API_KEY = process.env.CQ_API_KEY;

async function cqFetch(endpoint) {
  const url = `https://api.cryptoquant.com/v1/${endpoint}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${CQ_API_KEY}`,
    },
  });

  if (!response.ok) {
    const text = await response.text(); // pročitaj što API vraća
    throw new Error(`CryptoQuant API error: ${response.status} ${text}`);
  }

  return response.json();
}

module.exports = { cqFetch };
