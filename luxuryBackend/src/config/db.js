import { PrismaClient } from '@prisma/client';

// Cliente único de Prisma para toda la app.
// passwordHash nunca sale en las consultas salvo que se pida explícitamente (login).
export const prisma = new PrismaClient({
    omit: { staff: { passwordHash: true } },
});

export const connectDB = async () => {
    try {
        await prisma.$connect();
        console.log('Estamos Conectado a PostgreSQL exitosamente.');
    } catch (error) {
        console.log('Error al conectar a PostgreSQL', error.message);
        process.exit(1); // esto saldra del proceso si no hay base de datos
    }
};
