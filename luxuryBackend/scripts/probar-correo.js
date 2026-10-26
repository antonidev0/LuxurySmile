// Comprueba que el backend puede enviar correos con Gmail.
// Uso: pnpm probar-correo [destino]   (si no se indica destino, se envía a EMAIL_USER)
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { fileURLToPath } from "node:url";

// Leemos el .env de luxuryBackend aunque el comando se ejecute desde otra carpeta
const envPath = fileURLToPath(new URL("../.env", import.meta.url));
dotenv.config({ path: envPath });

const user = process.env.EMAIL_USER?.trim();
const pass = process.env.EMAIL_PASS?.replace(/\s+/g, "");
const to = process.argv[2] || user;

if (!user || !pass) {
  console.error(`Faltan EMAIL_USER o EMAIL_PASS en ${envPath}.`);
  console.error("EMAIL_USER es tu Gmail y EMAIL_PASS una contraseña de aplicación de 16 letras");
  console.error("(myaccount.google.com/apppasswords, requiere la verificación en dos pasos activada).");
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: { user, pass },
});

try {
  await transporter.verify();
  console.log(`Gmail aceptó el usuario ${user}.`);
  await transporter.sendMail({
    from: user,
    to,
    subject: "Prueba de correo - Luxury Smile",
    text: "Si lees esto, el backend ya puede enviar los correos de verificación.",
  });
  console.log(`Correo de prueba enviado a ${to}. Revisa también la carpeta de spam.`);
} catch (error) {
  console.error("No se pudo enviar el correo:", error.message);
  if (error.responseCode === 535 || /BadCredentials|Username and Password not accepted/i.test(error.message)) {
    console.error(
      "Gmail rechazó las credenciales: EMAIL_PASS debe ser una contraseña de aplicación, no tu contraseña normal.",
    );
  }
  process.exit(1);
}
