import { AppError } from "../lib/AppError.js";

const requireRole = (roles, message) => (request, response, next) => {
  if (!roles.includes(request.user?.role)) return next(new AppError(message, 403));
  next();
};

export const adminOnly = requireRole(["admin"], "Acceso denegado: solo administradores");

export const staffOnly = requireRole(["admin", "doctor"], "Acceso denegado: solo personal de la clínica");

export const doctorOnly = requireRole(["doctor"], "Acceso denegado: solo doctores");
