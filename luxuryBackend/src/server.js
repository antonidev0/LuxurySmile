import app from "./app.js";
import { DATABASE_URL, EMAIL_PASS, EMAIL_USER, JWT_SECRET, PORT } from "./config.js";
import { connectDB } from "./lib/prisma.js";

const startServer = async () => {
  if (!JWT_SECRET || !DATABASE_URL) {
    console.error("Faltan variables de entorno: revisa JWT_SECRET y DATABASE_URL en tu .env (ver .env.example).");
    process.exit(1);
  }
  // El registro funciona igual, pero no sale el correo de verificación
  if (!EMAIL_USER || !EMAIL_PASS) {
    console.warn(
      'Aviso: faltan EMAIL_USER o EMAIL_PASS en tu .env; no se enviarán correos de verificación (prueba con "pnpm probar-correo").',
    );
  }

  await connectDB();
  app.listen(PORT, () => console.log(`Servidor escuchando en el puerto ${PORT}.`));
};

startServer();
