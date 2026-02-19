require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

// Middlewares
app.use(cors({
  origin: [
    "https://mentalgame.es",
    "https://www.mental-game.es"
  ]
}));
app.use(express.json());

// Endpoint de contacto
app.post("/contact", async (req, res) => {
  const { name, email, message } = req.body;

  // Validación básica
  if (!name || !email || !message) {
    return res.status(400).json({ ok: false, error: "Faltan campos obligatorios" });
  }

  try {
    // 📩 EMAIL INTERNO (PARA TI)
   await axios.post(
  "https://api.brevo.com/v3/smtp/email",
  {
    sender: {
      name: "Mental Game",
      email: process.env.EMAIL_FROM,
    },
    to: [{ email: process.env.EMAIL_RECEIVER }],
    subject: `Nuevo mensaje de ${name} (${email}) | Mental Game`,
    htmlContent: `
    <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto; padding:20px; border:1px solid #eee; border-radius:10px;">
      <h2 style="color:#1d428a;">Nuevo mensaje desde Mental Game</h2>
      <p style="color:#555;">Has recibido un nuevo contacto desde la web.</p>

      <hr style="margin:20px 0;">

      <p><strong>Nombre:</strong><br>${name}</p>
      <p><strong>Email:</strong><br>${email}</p>

      <p><strong>Mensaje:</strong></p>
      <div style="background:#f6f8fb; padding:15px; border-radius:8px;">
        ${message}
      </div>

      <hr style="margin:20px 0;">

      <a href="mailto:${email}" 
         style="display:inline-block; padding:10px 20px; background:#1d428a; color:#fff; text-decoration:none; border-radius:5px;">
         Responder al cliente
      </a>

      <p style="font-size:12px; color:#888; margin-top:20px;">
        Enviado desde https://mental-game.es
      </p>
    </div>
    `,
  },
  {
    headers: {
      "api-key": process.env.BREVO_API_KEY,
      "Content-Type": "application/json",
    },
  }
);


    // 📤 EMAIL PROFESIONAL AL CLIENTE
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "Mental Game",
          email: process.env.EMAIL_FROM,
        },
        to: [{ email }],
        replyTo: {
          email: process.env.EMAIL_RECEIVER,
          name: "Mental Game"
        },
        subject: "Hemos recibido tu mensaje | Mental Game",
        htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto; padding:30px; background:#ffffff; border-radius:10px; border:1px solid #eee;">
          
          <h2 style="color:#1d428a; text-align:center;">
            Mental Game
          </h2>

          <p>Hola <strong>${name}</strong>,</p>

          <p>
            Gracias por contactar con <strong>Mental Game</strong>.
            Hemos recibido correctamente tu mensaje y lo revisaremos lo antes posible.
          </p>

          <div style="background:#f6f8fb; padding:15px; border-radius:8px; margin:20px 0;">
            <p style="margin:0;"><strong>Tu mensaje:</strong></p>
            <p style="margin-top:8px;">"${message}"</p>
          </div>

          <p>
            Te responderemos en un plazo máximo de 24-48 horas.
          </p>

          <hr style="margin:25px 0;">

          <p style="text-align:center;">
            <a href="https://mental-game.es" 
               style="display:inline-block; padding:12px 25px; background:#1d428a; color:white; text-decoration:none; border-radius:6px;">
               Visitar la web
            </a>
          </p>

          <p style="font-size:12px; color:#888; margin-top:30px; text-align:center;">
            Este es un correo automático. Si deseas responder, simplemente contesta a este email.
          </p>

        </div>
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

