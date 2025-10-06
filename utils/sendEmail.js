const nodemailer = require("nodemailer");
const fs = require("fs-extra");
// backend/utils/sendEmail.js

const path = require("path");
const handlebars = require("handlebars");
const sgMail = require("@sendgrid/mail");

require("dotenv").config();

if (!process.env.SENDGRID_API_KEY) {
  console.error("⚠️ SENDGRID_API_KEY is not set in .env");
}
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendEmail(to, subject, templateName, context = {}) {
  try {
    // load local HTML template
    const templatePath = path.join(__dirname, "../templates", `${templateName}.html`);
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template not found: ${templateName}.html`);
    }
    const source = fs.readFileSync(templatePath, "utf8");
    const compiled = handlebars.compile(source);
    const html = compiled(context);

    const msg = {
      to,
      from: `${process.env.SMTP_FROM_NAME || "Blocklytics"} <${process.env.SMTP_FROM_EMAIL}>`,
      subject,
      html,
      // optional: replyTo
      replyTo: process.env.REPLY_TO_EMAIL || process.env.SMTP_FROM_EMAIL,
    };

    // send
    const [response] = await sgMail.send(msg);
    // response contains statusCode and headers
    console.log(`✅ Email sent successfully to ${to} (SendGrid status ${response.statusCode})`);
    return response;
  } catch (err) {
    // SendGrid error structure: err.response.body for details
    if (err && err.response && err.response.body) {
      console.error("❌ SendGrid error:", err.response.body);
    } else {
      console.error("❌ SendGrid error:", err.message || err);
    }
    throw err;
  }
}

module.exports = sendEmail;
