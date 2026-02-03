require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();

// Permite recibir JSON
app.use(express.json());

// Permite llamadas desde Netlify
app.use(cors());

// Configurar transporte de correo
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Endpoint de contacto
app.post("/contact", async (req, res) => {
  const { name, email, message } = req.body;

  try {
    // 1️⃣ Correo para ti
    await transporter.sendMail({
      from: `"Mental Game" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_RECEIVER,
      subject: "Nuevo mensaje desde la web",
      html: `
        <h3>Nuevo contacto</h3>
        <p><strong>Nombre:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Mensaje:</strong><br>${message}</p>
      `,
    });

    // 2️⃣ Correo automático al cliente
    await transporter.sendMail({
      from: `"Mental Game" <no-reply@mental-game.com>`,
      to: email,
      subject: "Hemos recibido tu mensaje",
      html: `
        <p>Hola ${name},</p>
        <p>Gracias por contactar con <strong>Mental Game</strong>.</p>
        <p>Hemos recibido tu mensaje y te responderemos lo antes posible.</p>
        <br />
        <p><em>Este correo es automático. No respondas a este mensaje.</em></p>
      `,
    });

    // ✅ UNA SOLA RESPUESTA
    return res.status(200).json({ ok: true });

  } catch (error) {
    console.error("ERROR AL ENVIAR EMAIL:", error);

    // ❗ Solo responde si aún no se ha respondido
    if (!res.headersSent) {
      return res.status(500).json({ ok: false });
    }
  }
});

// Arrancar servidor
app.listen(3000, () => {
  console.log("Servidor escuchando en http://localhost:3000");
});
