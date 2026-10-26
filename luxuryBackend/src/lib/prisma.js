import { PrismaClient } from "@prisma/client";

// Cliente único para toda la app: varias instancias agotarían el pool de conexiones.
// passwordHash nunca sale en las consultas salvo que se pida explícitamente (login).
export const prisma = new PrismaClient({
  omit: { staff: { passwordHash: true } },
});

export const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log("Conectado a PostgreSQL.");
  } catch (error) {
    console.error("No se pudo conectar a PostgreSQL:", error.message);
    process.exit(1);
  }
};
