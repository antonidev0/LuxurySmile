import multer from "multer";

export const errorHandler = (err, req, res, next) => {
  // Los errores de multer (p. ej. archivo demasiado grande) son errores del cliente
  const statusCode = err instanceof multer.MulterError ? 400 : err.statusCode || 500;

  if (statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    // No exponemos detalles internos en errores del servidor
    message: statusCode >= 500 ? "Error del servidor" : err.message,
  });
};
