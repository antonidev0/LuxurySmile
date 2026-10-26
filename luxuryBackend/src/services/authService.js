import { PAGE_URL } from "../config.js";
import { AppError } from "../lib/AppError.js";
import { escapeHtml, sendMail } from "../lib/mailer.js";
import { hashPassword, verifyPassword } from "../lib/password.js";
import { signSessionToken, signVerificationToken, verifySessionToken, verifyVerificationToken } from "../lib/tokens.js";
import * as staffRepository from "../repositories/staffRepository.js";

// Campos únicos del personal, en el orden en que se informa el conflicto
const UNIQUE_FIELDS = [
  ["email", "El correo ya se encuentra en uso"],
  ["numberPhone", "El número de teléfono ya se encuentra en uso"],
  ["numberId", "El número de identidad ya se encuentra en uso"],
];

// Lanza un 409 con el campo del formulario si algún valor único ya lo usa otra persona
export const assertUniqueStaffFields = async (values, ownId = null) => {
  for (const [field, message] of UNIQUE_FIELDS) {
    if (values[field] === undefined) continue;
    const ownerId = await staffRepository.findOwnerOf(field, values[field]);
    if (ownerId && ownerId !== ownId) throw new AppError(message, 409, { field });
  }
};

const sendVerificationEmail = async (user) => {
  const link = `${PAGE_URL}/verify/${user.id}/${signVerificationToken(user.id)}`;
  await sendMail({
    to: user.email,
    subject: "Verificación de correo",
    html: `
      <p>Hola <strong>${escapeHtml(user.name)}</strong>,</p>
      <p>Gracias por registrarte en <em>Luxury Smile</em>.</p>
      <p>Haz clic en el enlace para verificar tu cuenta (válido por 1 hora):</p>
      <p><a href="${link}">${link}</a></p>
      <p>Si no solicitaste esta cuenta, ignora este correo.</p>
    `,
  });
};

// Un fallo del correo no deshace el alta: se informa para que el admin lo reenvíe
const trySendVerificationEmail = async (user) => {
  try {
    await sendVerificationEmail(user);
    return true;
  } catch (error) {
    console.error("No se pudo enviar el correo de verificación:", error.code ?? error.name);
    return false;
  }
};

export const registerStaff = async ({ password, ...data }) => {
  await assertUniqueStaffFields(data);
  const user = await staffRepository.create({ ...data, passwordHash: await hashPassword(password) });
  const emailSent = user.verified ? false : await trySendVerificationEmail(user);
  return { user, emailSent };
};

// Respuesta idéntica exista o no la cuenta, para no revelar qué correos están registrados
export const resendVerification = async (email) => {
  const user = await staffRepository.findByEmail(email);
  if (!user || user.verified || user.deactivatedAt) return;
  await sendVerificationEmail(user);
};

export const verifyEmail = async (id, token) => {
  let subject;
  try {
    subject = verifyVerificationToken(token);
  } catch {
    throw new AppError("Token invalido o expirado", 401);
  }
  if (subject !== id) throw new AppError("Token invalido o expirado", 401);

  const user = await staffRepository.findById(id);
  if (!user) throw new AppError("Token invalido o expirado", 401);
  if (!user.verified) await staffRepository.update(id, { verified: true });
};

export const login = async (email, password) => {
  const user = await staffRepository.findByEmailWithPassword(email);
  // Se compara aunque no exista el usuario, para que el tiempo de respuesta sea el mismo
  const validPassword = await verifyPassword(password, user?.passwordHash);
  if (!user || !validPassword)
    throw new AppError("Correo o contraseña incorrectos", 401, { code: "INVALID_CREDENTIALS" });

  if (!user.verified) {
    throw new AppError("Debes verificar tu correo antes de iniciar sesion", 403, { code: "EMAIL_NOT_VERIFIED" });
  }
  if (user.deactivatedAt) {
    throw new AppError("Tu cuenta está desactivada. Contacta con la administración.", 403, {
      code: "ACCOUNT_DEACTIVATED",
    });
  }

  return { token: signSessionToken(user.id), role: user.role, name: user.name };
};

const readSessionToken = (token) => {
  try {
    return verifySessionToken(token);
  } catch (error) {
    if (error.name === "TokenExpiredError") throw new AppError("Token expirado", 401, { code: "TOKEN_EXPIRED" });
    throw new AppError("Token invalido", 401);
  }
};

// El rol y el estado se leen de la base de datos y no del token, para que un cambio
// de rol o una baja se apliquen al momento y no cuando caduque la sesión
export const resolveSession = async (token) => {
  const user = await staffRepository.findSessionById(readSessionToken(token));
  if (!user || user.deactivatedAt) throw new AppError("Tu cuenta no está activa", 401);
  return { id: user.id, role: user.role };
};

export const getCurrentUser = async (id) => {
  const user = await staffRepository.findById(id);
  if (!user) throw new AppError("Usuario no encontrado", 404);
  return user;
};
