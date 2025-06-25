const pool = require("../db/index");

async function autoCloseInactiveTickets() {
  try {
    const res = await pool.query(
      `UPDATE tickets
       SET status = 'closed', updated_at = CURRENT_TIMESTAMP
       WHERE status = 'waiting_user'
       AND updated_at < NOW() - INTERVAL '24 hours'`
    );

    console.log(`✅ Auto-closed ${res.rowCount} ticket(s).`);
  } catch (err) {
    console.error("❌ Error auto-closing tickets:", err);
  }
}

module.exports = { autoCloseInactiveTickets };
