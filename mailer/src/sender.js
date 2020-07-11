const sgMail = require("@sendgrid/mail");
const config = require("nice-config-loader")();

const SENDGRID__API_KEY = config.get("sendgrid:api_key");
const SENDGRID__FROM_ADDRESS = config.get("sendgrid:from_address");

if (typeof SENDGRID__API_KEY !== "string") {
  console.error("FATAL: No sendgrid api key set");
  process.exit(1);
}

if (typeof SENDGRID__FROM_ADDRESS !== "string") {
  console.error("FATAL: No sendgrid from address set");
  process.exit(1);
}

sgMail.setApiKey(SENDGRID__API_KEY);

module.exports = {
  sendMail
}

function sendMail(to, subject, html) {
  const msg = {
    to,
    from: SENDGRID__FROM_ADDRESS,
    subject,
    html
  };

  sgMail.send(msg);
}
