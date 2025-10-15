const express = require("express");
const router = express.Router();
const pool = require("../db");
const authenticateToken = require("../middleware/auth");
const { getChatGPTReply } = require("../services/chatgpt");
const sendEmail = require("../utils/sendEmail");

// GET /tickets – lista svih ticketa za trenutno prijavljenog korisnika
router.get("/", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.id, t.title, t.status, t.created_at, t.updated_at
       FROM tickets t
       WHERE t.user_id = $1
       ORDER BY t.created_at DESC`,
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch tickets." });
  }
});

// GET /tickets/:id – detalji ticketa + sve poruke
router.get("/:id", authenticateToken, async (req, res) => {
  const ticketId = req.params.id;

  try {
    const ticketRes = await pool.query(
      `SELECT t.id, t.title, t.status, t.created_at, t.updated_at, u.company_name
       FROM tickets t
       JOIN users u ON u.id = t.user_id
       WHERE t.id = $1 AND t.user_id = $2`,
      [ticketId, req.user.userId]
    );

    if (ticketRes.rows.length === 0) {
      return res.status(404).json({ error: "Ticket not found." });
    }

    const messagesRes = await pool.query(
      `SELECT id, sender, message, created_at
       FROM ticket_messages
       WHERE ticket_id = $1
       ORDER BY created_at ASC`,
      [ticketId]
    );

    res.json({
      ticket: ticketRes.rows[0],
      messages: messagesRes.rows,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch ticket details." });
  }
});

// POST /tickets – kreira novi ticket s početnom porukom i automatskim odgovorom
router.post("/", authenticateToken, async (req, res) => {
  const { title, message } = req.body;

  if (!title || !message) {
    return res.status(400).json({ error: "Title and message are required." });
  }

   try {
    // 0. User ka email aur company name fetch karna
    const userDetailsRes = await pool.query(
      `SELECT email, company_name FROM users WHERE id = $1`,
      [req.user.userId]
    );
    const user = userDetailsRes.rows[0];

  
    // 1. Kreiraj ticket with scheduled reply at 3 hours
    const ticketRes = await pool.query(
      `INSERT INTO tickets (user_id, title, status, scheduled_reply_at)
       VALUES ($1, $2, 'waiting', NOW() + INTERVAL '3 hours')
       RETURNING id, title, status, created_at`,
      [req.user.userId, title]
    );

    const ticketId = ticketRes.rows[0].id;
    const ticketTitle = ticketRes.rows[0].title;

    // 2. Dodaj korisničku poruku
    await pool.query(
      `INSERT INTO ticket_messages (ticket_id, sender, message)
       VALUES ($1, 'user', $2)`,
      [ticketId, message]
    );

      try {
        await sendEmail(
            user.email,
            `Ticket #${ticketId.toString().slice(0, 6)} Opened: ${ticketTitle}`,
            'ticketOpened', // template: ticketOpened.html
            {
                User_Name: user.company_name || 'Valued Customer',
                TICKET_ID: ticketId.toString().slice(0, 6),
                TICKET_SUBJECT: ticketTitle,
                TICKET_DETAILS_LINK: `${process.env.FRONTEND_URL}/tickets/${ticketId}`
            }
        );
    } catch (emailErr) {
        console.error("❌ Email failed (New Ticket):", emailErr.message);
    };

    res.status(201).json({
      ticket: ticketRes.rows[0],
      message: "Ticket created successfully. ChatGPT will respond shortly.",
    });
  } catch (err) {
    console.error("Ticket creation error:", err);
    res.status(500).json({ error: "Failed to create ticket." });
  }
})

// POST /tickets/:id/messages – korisnik šalje novu poruku i dobiva automatski odgovor
router.post("/:id/messages", authenticateToken, async (req, res) => {
  const ticketId = req.params.id;
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required." });
  }

  try {
    const ticketCheck = await pool.query(
      `SELECT id FROM tickets WHERE id = $1 AND user_id = $2`,
      [ticketId, req.user.userId]
    );

    if (ticketCheck.rows.length === 0) {
      return res.status(404).json({ error: "Ticket not found." });
    }

    // 1. Spremi korisničku poruku
    await pool.query(
      `INSERT INTO ticket_messages (ticket_id, sender, message)
       VALUES ($1, 'user', $2)`,
      [ticketId, message]
    );

    // 2. Ažuriraj status i schedule reply for 3 hours
    await pool.query(
      `UPDATE tickets SET status = 'waiting', scheduled_reply_at = NOW() + INTERVAL '3 hours', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [ticketId]
    );

    res
      .status(201)
      .json({ message: "Message sent. ChatGPT will respond in 3 hours." });
  } catch (err) {
    console.error("Add message error:", err);
    res.status(500).json({ error: "Failed to add message." });
  }
});

// PATCH /tickets/:id/status – ručna promjena statusa
router.patch("/:id/status", authenticateToken, async (req, res) => {
  const ticketId = req.params.id;
  const { status } = req.body;

  const allowedStatuses = [
    "waiting",
    "open",
    "closed",
    "resolved",
    "waiting_user",
  ];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ error: "Invalid status value." });
  }

  try {
    const result = await pool.query(
      `UPDATE tickets
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND user_id = $3
       RETURNING id, title, status, updated_at`,
      [status, ticketId, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Ticket not found or unauthorized." });
    }

    const ticket = result.rows[0];

    // 🚨 Email Notification (Ticket Closed/Resolved) 🚨
    if (status === 'closed' || status === 'resolved') {
        
        // User details phir se fetch karna hai
        const userDetailsRes = await pool.query(
            `SELECT email, company_name FROM users WHERE id = $1`,
            [req.user.userId]
        );
        const user = userDetailsRes.rows[0];

        try {
            await sendEmail(
                user.email,
                `Ticket #${ticket.id.toString().slice(0, 6)} is now ${status}`,
                'ticketClosed', // template: ticketClosed.html
                {
                    User_Name: user.company_name || 'Valued Customer',
                    TICKET_ID: ticket.id.toString().slice(0, 6),
                    RESOLUTION_SUMMARY: `Your issue regarding "${ticket.title}" has been successfully addressed.`,
                    TICKET_DETAILS_LINK: `${process.env.FRONTEND_URL}/tickets/${ticket.id}`
                }
            );
        } catch (emailErr) {
            console.error(`❌ Email failed (Ticket ${status}):`, emailErr.message);
        }
    }


    res.json({ message: "Ticket status updated.", ticket: result.rows[0] });
  } catch (err) {
    console.error("Status update error:", err);
    res.status(500).json({ error: "Failed to update ticket status." });
  }
});

module.exports = router;
