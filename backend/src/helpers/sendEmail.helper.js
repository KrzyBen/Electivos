import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendEmail({ to, subject, text, html }) {
  if (!to || !subject || (!text && !html)) {
    throw new Error("Faltan datos para enviar el correo");
  }

  const mailOptions = {
    from: `"Sistema Electivos" <${process.env.EMAIL_USER}>`,
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
    throw error;
  }
}

export default sendEmail;