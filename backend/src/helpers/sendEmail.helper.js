import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendEmail({ to, subject, text, html }) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
    html,
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log("Correo enviado a:", to);
  } catch (error) {
    console.error("Error enviando correo:", error);
  }
}

export default sendEmail;
