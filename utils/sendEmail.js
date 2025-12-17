const nodemailer = require("nodemailer");
const fs = require("fs-extra");
// backend/utils/sendEmail.js

const path = require("path");
const handlebars = require("handlebars");
const { TransactionalEmailsApi, SendSmtpEmail } = require("@getbrevo/brevo");

require("dotenv").config();

if (!process.env.BREVO_API_KEY) {
  console.error("⚠️ BREVO_API_KEY is not set in .env");
}

// Configure API key authorization
const apiInstance = new TransactionalEmailsApi();
apiInstance.authentications.apiKey.apiKey = process.env.BREVO_API_KEY;

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

    const sendSmtpEmail = new SendSmtpEmail();
    sendSmtpEmail.sender = {
      name: process.env.SMTP_FROM_NAME || "Blocklytics",
      email: process.env.SMTP_FROM_EMAIL || "support@blocklytics.net",
    };    
    sendSmtpEmail.to = [{ email: to }];
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = html;
    sendSmtpEmail.replyTo = { email: process.env.REPLY_TO_EMAIL || process.env.SMTP_FROM_EMAIL };

    // send
    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`✅ Email sent successfully to ${to} (Brevo messageId: ${response.messageId})`);
    return response;
  } catch (err) {
    // Brevo error structure
    if (err && err.response && err.response.body) {
      console.error("❌ Brevo error:", err.response.body);
    } else {
      console.error("❌ Brevo error:", err.message || err);
    }
    throw err;
  }
}

module.exports = sendEmail;
