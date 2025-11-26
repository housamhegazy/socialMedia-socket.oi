const nodemailer = require("nodemailer");

async function sendEmail({ to, subject, html }) {
  // 1) إعداد الـ transporter
  const transporter = nodemailer.createTransport({
    service: "gmail", // تقدر تستبدلها بـ Outlook أو SMTP
    auth: {
      user: process.env.EMAIL_USER, // بريدك
      pass: process.env.EMAIL_PASS, // باسورد App Password
    },
  });

  // 2) إعداد الرسالة
  const mailOptions = {
    from: `"My App" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  // 3) إرسال الرسالة
  return transporter.sendMail(mailOptions);
}

module.exports = sendEmail;
