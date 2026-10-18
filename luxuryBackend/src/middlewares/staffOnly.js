import jwt from "jsonwebtoken";
import Staff from "../models/staff.js";
 
export const adminOnly = (request, response, next) => {
  if (request.user && request.user.role === "admin") {
    next();
  } else {
    return response.status(403).json({ message: "Acceso denegado: solo administradores" });
  }
};

export const staffOnly = (request, response, next) => {
  if (request.user && request.user.role === "admin" || request.user.role === "doctor") {
    next();
  } else {
    return response.status(403).json({ message: "Acceso denegado: solo administradores" });
  }
};