const pool = require("../db/index");
const sendEmail = require("./sendEmail");
const checkNotificationPreferences = require("./checkNotificationPreferences");

async function autoCloseInactiveTickets() {
  try {
    // First, get the tickets that will be closed (to send emails)
    const ticketsToClose = await pool.query(
      `SELECT t.id, t.title, t.user_id, u.email, u.company_name
       FROM tickets t
       JOIN users u ON u.id = t.user_id
       WHERE t.status = 'waiting_user'
       AND t.updated_at < NOW() - INTERVAL '24 hours'`
    );

    if (ticketsToClose.rowCount === 0) {
      console.log(`✅ No tickets to auto-close.`);
      return;
    }

    // Update their status
    const res = await pool.query(
      `UPDATE tickets
       SET status = 'closed', updated_at = CURRENT_TIMESTAMP
       WHERE status = 'waiting_user'
       AND updated_at < NOW() - INTERVAL '24 hours'`
    );

    console.log(`✅ Auto-closed ${res.rowCount} ticket(s).`);

    // Send email to each user
    for (const ticket of ticketsToClose.rows) {
      try {
        // Check if user wants to receive email notifications
        const wantsEmails = await checkNotificationPreferences(ticket.user_id, "email_notifications");
        
        if (wantsEmails) {
          await sendEmail(
            ticket.email,
            `Ticket #${ticket.id.toString().slice(0, 6)} is now closed`,
            'ticketClosed',
            {
              User_Name: ticket.company_name || 'Valued Customer',
              TICKET_ID: ticket.id.toString().slice(0, 6),
              RESOLUTION_SUMMARY: `Your ticket regarding "${ticket.title}" has been automatically closed due to inactivity.`,
              TICKET_DETAILS_LINK: `${process.env.FRONTEND_URL}/tickets/${ticket.id}`
            }
          );
        }
      } catch (emailErr) {
        console.error(`❌ Failed to send email for ticket #${ticket.id}:`, emailErr.message);
      }
    }
  } catch (err) {
    console.error("❌ Error auto-closing tickets:", err);
  }
}

module.exports = { autoCloseInactiveTickets };
