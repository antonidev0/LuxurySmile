import { IS_PRODUCTION } from "../config.js";

// En producción solo se registra el tipo de error y la ruta: los mensajes de Prisma y las trazas
// pueden incluir datos de pacientes o del personal
export const logError = (error, request) => {
  const route = request ? `${request.method} ${request.baseUrl}${request.route?.path ?? ""}` : "";
  if (IS_PRODUCTION) {
    console.error(`[error] ${route}`, error?.name, error?.code ?? "");
    return;
  }
  console.error(`[error] ${route}`, error);
};
