
const { Resend }  =require("resend");
const resend = new Resend(`${process.env.RESEND_API_KEY}`);
async function sendEmail({ to, subject, html }) {
  try {
    const data = resend.emails.send({
    from: "socialMedia <onboarding@resend.dev>",
    to,
    subject,
    html,
  });
   console.log("Email sent:", data);
    return data;
  } catch (error) {
     console.error("Email Error:", error);
    throw new Error("Failed to send email");
  }
  
}

module.exports = sendEmail;
