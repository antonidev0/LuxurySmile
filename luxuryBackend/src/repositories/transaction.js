import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../lib/AppError.js";

// Con una base de datos remota cada consulta es un viaje de ida y vuelta: este margen evita que
// Prisma cierre la transacción a mitad (P2028, "Transaction not found") con los 5 s que da por defecto
const TRANSACTION_OPTIONS = { maxWait: 5_000, timeout: 15_000 };
const MAX_ATTEMPTS = 3;

export const inTransaction = (fn) => prisma.$transaction(fn, TRANSACTION_OPTIONS);

// Transacción serializable: dos cambios simultáneos no pueden dejar citas solapadas.
// Si Postgres detecta el conflicto (P2034) se reintenta.
export const inScheduleTransaction = async (fn) => {
  for (let attempt = 1; ; attempt += 1) {
    try {
      return await prisma.$transaction(fn, {
        ...TRANSACTION_OPTIONS,
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      });
    } catch (error) {
      if (error?.code === "P2028") {
        throw new AppError(
          "La base de datos tardó demasiado en responder y no se guardó el cambio. Vuelve a intentarlo.",
          503,
        );
      }
      if (error?.code !== "P2034") throw error;
      if (attempt >= MAX_ATTEMPTS) {
        throw new AppError("Otra persona modificó la agenda al mismo tiempo. Vuelve a intentarlo.", 409);
      }
    }
  }
};
