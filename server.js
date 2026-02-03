require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Endpoint de contacto
app.post("/contact", async (req, res) => {
  const { name, email, message } = req.body;

  try {
    // 📩 Correo para TI
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "Mental Game",
          email: process.env.EMAIL_FROM,
        },
        to: [{ email: process.env.EMAIL_RECEIVER }],
        subject: "Nuevo mensaje desde la web",
        htmlContent: `
          <h3>Nuevo contacto</h3>
          <p><strong>Nombre:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Mensaje:</strong><br>${message}</p>
        `,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    // 📤 No-reply al usuario
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "Mental Game",
          email: process.env.EMAIL_FROM,
        },
        to: [{ email }],
        subject: "Hemos recibido tu mensaje",
        htmlContent: `
          <p>Hola ${name},</p>
          <p>Gracias por contactar con <strong>Mental Game</strong>.</p>
          <p>Hemos recibido tu mensaje y te responderemos lo antes posible.</p>
          <br />
          <p><em>Este correo es automático. No respondas a este mensaje.</em></p>
        `,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    return res.status(200).json({ ok: true });

  } catch (error) {
    console.error("ERROR BREVO API:", error.response?.data || error);
    return res.status(500).json({ ok: false });
  }
});

// Arrancar servidor (compatible con Render)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});

