import jwt from "jsonwebtoken";
import { JWT_SECRET, SESSION_TOKEN_EXPIRES, VERIF_TOKEN_EXPIRES } from "../config.js";

// Cada token declara su propósito en "aud" y solo se acepta para ese propósito:
// así el enlace de verificación que viaja por correo no sirve como token de sesión
const SESSION = "session";
const EMAIL_VERIFICATION = "email-verification";
const ALGORITHM = "HS256";

const sign = (userId, audience, expiresIn) =>
  jwt.sign({}, JWT_SECRET, { subject: userId, audience, expiresIn, algorithm: ALGORITHM });

const verify = (token, audience) => jwt.verify(token, JWT_SECRET, { audience, algorithms: [ALGORITHM] }).sub;

export const signSessionToken = (userId) => sign(userId, SESSION, SESSION_TOKEN_EXPIRES);
export const verifySessionToken = (token) => verify(token, SESSION);

export const signVerificationToken = (userId) => sign(userId, EMAIL_VERIFICATION, VERIF_TOKEN_EXPIRES);
export const verifyVerificationToken = (token) => verify(token, EMAIL_VERIFICATION);
