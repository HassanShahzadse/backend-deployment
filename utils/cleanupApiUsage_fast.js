#!/usr/bin/env node
/**
 * Najbrže brisanje: DELETE po CTID-u bez sortiranja, u velikim chunkovima.
 *
 * Primjeri:
 *   node utils/cleanupApiUsage_fast.js --total 50000000 --chunk 1000000
 *   node utils/cleanupApiUsage_fast.js --total 50000000 --chunk 500000 --no-vacuum
 *   node utils/cleanupApiUsage_fast.js --total 2000000 --chunk 250000
 */

const pool = require("../db");

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { total: 100000, chunk: 500000, vacuum: true, syncOff: true };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--total" && args[i + 1]) {
      const n = Number(args[++i]);
      if (!Number.isFinite(n) || n <= 0) fail("Invalid --total");
      opts.total = n;
    } else if (a === "--chunk" && args[i + 1]) {
      const n = Number(args[++i]);
      if (!Number.isFinite(n) || n <= 0) fail("Invalid --chunk");
      opts.chunk = n;
    } else if (a === "--no-vacuum") {
      opts.vacuum = false;
    } else if (a === "--sync-on") {
      opts.syncOff = false;
    }
  }
  return opts;
}

function fail(msg) {
  console.error(msg);
  process.exit(1);
}

async function deleteChunk(client, limit) {
  // Najbrži oblik: bez ORDER BY, bez JOIN-ova; koristi CTID (sistemski TID tip)
  // Ovo briše "bilo kojih" LIMIT redaka, najčešće najstarije fizički u heapu, ali nije garantirano.
  const sql = `
    WITH victim AS (
      SELECT ctid
      FROM api_token_usage
      LIMIT $1
    )
    DELETE FROM api_token_usage a
    USING victim v
    WHERE a.ctid = v.ctid
  `;
  const res = await client.query(sql, [limit]);
  return res.rowCount || 0;
}

async function vacuumAnalyze(client) {
  await client.query(`VACUUM ANALYZE api_token_usage`);
}

async function run({ total, chunk, vacuum, syncOff }) {
  console.log(
    `Starting FAST cleanup: total=${total}, chunk=${chunk}, vacuum=${vacuum}, syncOff=${syncOff}`
  );
  let deleted = 0;
  let rounds = 0;

  while (deleted < total) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      if (syncOff) {
        // Brže potvrđivanje (manje fsync overhead-a)
        await client.query("SET LOCAL synchronous_commit = off");
      }

      // Koliko još trebamo u ovoj rundi
      const toGo = total - deleted;
      const step = Math.min(chunk, toGo);

      const n = await deleteChunk(client, step);

      if (n === 0) {
        await client.query("ROLLBACK");
        console.log("No more rows to delete. Stopping.");
        break;
      }

      await client.query("COMMIT");
      deleted += n;
      rounds++;
      if (rounds % 10 === 0 || step >= 500000) {
        console.log(
          `Round ${rounds}: deleted ${n} (total ${deleted}/${total})`
        );
      }
    } catch (e) {
      try {
        await client.query("ROLLBACK");
      } catch {}
      console.error("❌ Error in round:", e.message);
      process.exitCode = 1;
      break;
    } finally {
      client.release();
    }
  }

  console.log(`✅ Fast cleanup finished. Deleted ${deleted} rows.`);
  if (vacuum) {
    try {
      console.log("Running VACUUM ANALYZE (may take a while)...");
      const client = await pool.connect();
      try {
        await vacuumAnalyze(client);
        console.log("✅ VACUUM ANALYZE done.");
      } finally {
        client.release();
      }
    } catch (e) {
      console.warn("VACUUM failed:", e.message);
    }
  }

  try {
    await pool.end();
  } catch {}
}

run(parseArgs());
