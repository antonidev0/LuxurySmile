import multer from "multer";
import { AppError } from "../lib/AppError.js";
import { logError } from "../lib/logger.js";

const MULTER_MESSAGES = {
  LIMIT_FILE_SIZE: "El archivo supera el tamaño máximo de 10 MB",
  LIMIT_FILE_COUNT: "Solo se puede subir un archivo",
  LIMIT_UNEXPECTED_FILE: "Campo de archivo no esperado",
};

// Errores de Prisma que se deben a los datos enviados y no a un fallo del servidor
const PRISMA_ERRORS = {
  P2002: ["Ya existe un registro con esos datos", 409],
  P2025: ["Registro no encontrado", 404],
};

// Traduce errores conocidos a errores de cliente sin exponer sus mensajes internos.
// Devuelve null si es un fallo inesperado del servidor.
const toClientError = (error) => {
  if (error instanceof AppError) return error;
  if (error instanceof multer.MulterError) {
    return new AppError(MULTER_MESSAGES[error.code] ?? "Archivo no válido", 400, { code: "INVALID_UPLOAD" });
  }
  if (error.type === "entity.parse.failed") return new AppError("El cuerpo de la petición no es JSON válido", 400);
  if (error.type === "entity.too.large") return new AppError("La petición es demasiado grande", 413);
  if (error.name === "PrismaClientKnownRequestError" && PRISMA_ERRORS[error.code]) {
    const [message, status] = PRISMA_ERRORS[error.code];
    return new AppError(message, status);
  }
  return null;
};

// El front actual lee message y field en la raíz: se mantienen junto al formato común
// { error: { message, code } } hasta que el front migre
const body = ({ message, code, field, details }) => {
  const fieldPart = field ? { field } : {};
  return { message, ...fieldPart, error: { message, code, ...fieldPart, ...(details ? { details } : {}) } };
};

export const notFoundHandler = (request, response, next) => next(new AppError("Ruta no encontrada", 404));

// Express reconoce el manejador de errores por tener cuatro parámetros
export const errorHandler = (error, request, response, next) => {
  const clientError = toClientError(error);
  if (clientError) return response.status(clientError.statusCode).json(body(clientError));

  logError(error, request);
  response.status(500).json(body({ message: "Error del servidor", code: "INTERNAL_ERROR" }));
};
