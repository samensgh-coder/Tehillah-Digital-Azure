// Azure Function: POST /api/contact
// Receives the contact form payload from the website and emails it on.
//
// To actually deliver email, set these Application Settings in the
// Static Web App's configuration (Portal > your app > Configuration):
//   SENDGRID_API_KEY   - an API key from a SendGrid account (free tier is fine)
//   CONTACT_TO_EMAIL   - the mailbox that should receive enquiries
//   CONTACT_FROM_EMAIL - a verified sender address in SendGrid
//
// Without those settings configured, the function returns 503 so the
// website's own JS falls back to opening the visitor's email client (mailto:),
// and no enquiry is silently lost. See README-DEPLOY.md.

module.exports = async function (context, req) {
  const body = req.body || {};
  const { firstName, lastName, email, phone, message, companyWebsite } = body;

  // Honeypot: this field is hidden from real visitors via CSS and never
  // filled in by a human. A bot that fills every field trips this check.
  if (companyWebsite) {
    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: { ok: true },
    };
    return;
  }

  if (!firstName || !lastName || !email || !message) {
    context.res = {
      status: 400,
      body: { error: "Missing required fields." },
    };
    return;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    context.res = {
      status: 400,
      body: { error: "Invalid email address." },
    };
    return;
  }

  const apiKey = process.env.SENDGRID_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL;
  const fromEmail = process.env.CONTACT_FROM_EMAIL;

  if (apiKey && toEmail && fromEmail) {
    try {
      const sgMail = require("@sendgrid/mail");
      sgMail.setApiKey(apiKey);
      await sgMail.send({
        to: toEmail,
        from: fromEmail,
        replyTo: email,
        subject: `New enquiry from ${firstName} ${lastName} — tehillahdigital.co.uk`,
        text: `Name: ${firstName} ${lastName}\nEmail: ${email}\nPhone: ${phone || "-"}\n\n${message}`,
      });
    } catch (err) {
      context.log.error("SendGrid send failed:", err);
      context.res = {
        status: 502,
        body: { error: "Could not send message right now." },
      };
      return;
    }
  } else {
    context.log.warn("Contact email is not configured (see README-DEPLOY.md); asking the browser to use its email fallback.");
    context.res = {
      status: 503,
      headers: { "Content-Type": "application/json" },
      body: { error: "Email delivery is not configured." },
    };
    return;
  }

  context.res = {
    status: 200,
    headers: { "Content-Type": "application/json" },
    body: { ok: true },
  };
};
