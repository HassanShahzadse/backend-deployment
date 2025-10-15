const cron = require("node-cron");
const pool = require("../db");
const { getChatGPTReply } = require("../services/chatgpt");

console.log("✅ Scheduled Replies cron loaded");

// Runs every 5 minutes
cron.schedule("*/5 * * * *", async () => {
  console.log("🤖 Checking for scheduled ChatGPT replies...");

  try {
    // Find tickets that need replies (scheduled_reply_at has passed)
    const ticketsRes = await pool.query(`
      SELECT id 
      FROM tickets 
      WHERE scheduled_reply_at IS NOT NULL 
        AND scheduled_reply_at <= NOW()
      ORDER BY scheduled_reply_at ASC
    `);

    if (ticketsRes.rows.length === 0) {
      console.log("   No scheduled replies to send.");
      return;
    }

    console.log(`   Found ${ticketsRes.rows.length} ticket(s) needing replies.`);

    for (const ticket of ticketsRes.rows) {
      const ticketId = ticket.id;

      try {
        // Fetch conversation history
        const messagesRes = await pool.query(
          `SELECT sender, message FROM ticket_messages
           WHERE ticket_id = $1
           ORDER BY created_at ASC`,
          [ticketId]
        );

        const conversation = messagesRes.rows.map((msg) => ({
          role: msg.sender === "user" ? "user" : "assistant",
          content: msg.message,
        }));

        // Get ChatGPT response
        const chatgptResponse = await getChatGPTReply(conversation);

        // Save the reply
        await pool.query(
          `INSERT INTO ticket_messages (ticket_id, sender, message)
           VALUES ($1, 'admin', $2)`,
          [ticketId, chatgptResponse]
        );

        // Update ticket status and clear scheduled_reply_at
        await pool.query(
          `UPDATE tickets 
           SET status = 'waiting_user', 
               scheduled_reply_at = NULL, 
               updated_at = CURRENT_TIMESTAMP 
           WHERE id = $1`,
          [ticketId]
        );

        console.log(`   ✅ Sent scheduled reply for ticket #${ticketId}`);
      } catch (err) {
        console.error(`   ❌ Failed to send reply for ticket #${ticketId}:`, err.message);
      }
    }
  } catch (err) {
    console.error("🚨 Error in sendScheduledReplies cron:", err);
  }
});

