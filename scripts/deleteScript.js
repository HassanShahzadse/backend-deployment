// skriptazabrisanje.js
// Usage: ALLOW_DELETE=yes node scripts/skriptazabrisanje.js
// Safety: script requires env ALLOW_DELETE=yes to actually run deletes.

const pool = require("../db"); // prilagodi putanju ako treba
const TOTAL_TO_DELETE = 500_000;
const BATCH_SIZE = 10_000; // pošto brišemo puno, 10k po batchu je često OK — smanji ako DB pate
const WAIT_MS_BETWEEN_BATCHES = 200; // mali pauza između batcheva da ne guši DB

async function deleteBatchWithTableSample(batchSize) {
  // Preferirani (i brži) način: koristi PostgreSQL TABLESAMPLE SYSTEM_ROWS
  // Vraća neki broj redaka približno batchSize, pa izbacimo pomoću ctid.
  const sql = `
    WITH sampled AS (
      SELECT ctid FROM api_token_usage TABLESAMPLE SYSTEM_ROWS(${batchSize})
    )
    DELETE FROM api_token_usage
    USING sampled
    WHERE api_token_usage.ctid = sampled.ctid
    RETURNING api_token_usage.id;
  `;
  const res = await pool.query(sql);
  return res.rowCount;
}

async function deleteBatchFallbackRandom(batchSize) {
  // Fallback: ORDER BY random() LIMIT N (sporije, ali radi na starijim verzijama)
  const sql = `
    DELETE FROM api_token_usage
    WHERE id IN (
      SELECT id FROM api_token_usage
      ORDER BY random()
      LIMIT $1
    )
    RETURNING id;
  `;
  const res = await pool.query(sql, [batchSize]);
  return res.rowCount;
}

async function run() {
  if (process.env.ALLOW_DELETE !== "yes") {
    console.error("Safety: set ALLOW_DELETE=yes environment variable to enable deletions.");
    process.exit(1);
  }

  console.log(`Starting random delete job: target=${TOTAL_TO_DELETE.toLocaleString()} rows`);
  let deleted = 0;
  let triesSinceProgress = 0;

  while (deleted < TOTAL_TO_DELETE) {
    try {
      // pokušaj prvi (brži) način
      let removed = 0;
      try {
        removed = await deleteBatchWithTableSample(BATCH_SIZE);
      } catch (err) {
        console.warn("TABLESAMPLE approach failed or unsupported, falling back to ORDER BY random():", err.message);
        removed = await deleteBatchFallbackRandom(BATCH_SIZE);
      }

      if (removed === 0) {
        triesSinceProgress++;
        console.log(`No rows removed in this iteration. triesSinceProgress=${triesSinceProgress}`);
        // Ako je nekoliko puta bez napretka -> vjerojatno nema više redaka ili batchSize je prevelik
        if (triesSinceProgress >= 5) {
          console.log("Stopping: no more removable rows detected or sampling returning 0 repeatedly.");
          break;
        }
        // pričekaj i pokuša ponovno
        await new Promise((r) => setTimeout(r, 1000));
        continue;
      }

      deleted += removed;
      triesSinceProgress = 0;
      console.log(`Batch deleted: ${removed.toLocaleString()}  | Total deleted: ${deleted.toLocaleString()}`);

      // kratka pauza da ne opteretimo DB previše
      await new Promise((r) => setTimeout(r, WAIT_MS_BETWEEN_BATCHES));
    } catch (err) {
      console.error("Unexpected error during deletion loop:", err);
      console.log("Waiting 2s before retry...");
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  console.log(`Finished. Total deleted: ${deleted.toLocaleString()}`);
  await pool.end();
  process.exit(0);
}

run().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
