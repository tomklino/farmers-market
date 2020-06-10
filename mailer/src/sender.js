const sgMail = require("@sendgrid/mail");


const SENDGRID__API_KEY = "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";
const SENDGRID__FROM_ADDRESS = "farmers@klino.me";

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
