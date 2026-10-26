import dotenv from "dotenv";

// Único punto que lee process.env: el resto de la app importa los valores desde aquí
dotenv.config();

export const NODE_ENV = process.env.NODE_ENV || "development";
export const IS_PRODUCTION = NODE_ENV === "production";

export const PORT = process.env.PORT || 3003;

export const JWT_SECRET = process.env.JWT_SECRET;
export const VERIF_TOKEN_EXPIRES = "1h"; // el correo dice "válido por 1 hora"
export const SESSION_TOKEN_EXPIRES = "3h";

export const EMAIL_USER = process.env.EMAIL_USER;
// Gmail muestra la contraseña de aplicación con espacios ("abcd efgh ..."); se quitan por si se copiaron
export const EMAIL_PASS = process.env.EMAIL_PASS?.replace(/\s+/g, "");

// Allowlist de CORS: uno o varios orígenes separados por comas
export const CLIENT_ORIGINS = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
// Base de los enlaces que van en los correos
export const PAGE_URL = process.env.PAGE_URL || CLIENT_ORIGINS[0];

export const DATABASE_URL = process.env.DATABASE_URL;

// Decide qué es "hoy" y qué horas ya pasaron, aunque el servidor esté en UTC
export const CLINIC_TIMEZONE = process.env.CLINIC_TIMEZONE || "America/Caracas";

// Detrás de un proxy (Render, Railway...) la IP real llega en X-Forwarded-For. Sin esto el rate limit
// trataría a todos los usuarios como uno solo. Admite un número de saltos o "true".
const parseTrustProxy = (value) => {
  if (value === undefined || value === "") return undefined;
  if (value === "true") return true;
  return Number.isNaN(Number(value)) ? value : Number(value);
};
export const TRUST_PROXY = parseTrustProxy(process.env.TRUST_PROXY);
