import { rateLimit } from "express-rate-limit";
import { AppError } from "../lib/AppError.js";

const MINUTE = 60_000;

const limiter = ({ minutes, limit, message, skipSuccessfulRequests = false }) =>
  rateLimit({
    windowMs: minutes * MINUTE,
    limit,
    skipSuccessfulRequests,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: (request, response, next) => next(new AppError(message, 429)),
  });

// Solo cuentan los intentos fallidos: frena la fuerza bruta sin bloquear a quien entra bien
export const loginLimiter = limiter({
  minutes: 15,
  limit: 10,
  skipSuccessfulRequests: true,
  message: "Demasiados intentos de inicio de sesión. Espera unos minutos y vuelve a intentarlo.",
});

// Cada petición envía un correo: sin límite se podría usar para hacer spam desde la cuenta de la clínica
export const emailLimiter = limiter({
  minutes: 60,
  limit: 5,
  message: "Demasiadas solicitudes de correo. Inténtalo más tarde.",
});

export const verifyLimiter = limiter({
  minutes: 15,
  limit: 20,
  message: "Demasiados intentos de verificación. Inténtalo más tarde.",
});

export const registerLimiter = limiter({
  minutes: 60,
  limit: 30,
  message: "Demasiados registros seguidos. Inténtalo más tarde.",
});
