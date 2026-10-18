// Crea (o asciende) la cuenta de administrador de la clínica.
// Uso: npm run crear-admin
// Como el registro de personal solo lo puede hacer un admin, la primera cuenta se crea así.
import 'dotenv/config';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const rl = readline.createInterface({ input, output });

const ask = async (question, fallback = '') => {
    const answer = (await rl.question(question)).trim();
    return answer || fallback;
};

try {
    console.log('Crear administrador de Luxury Smile\n');
    const email = await ask('Correo: ');
    const password = await ask('Contraseña (mín. 8 caracteres): ');

    if (!email || password.length < 8) {
        throw new Error('El correo es obligatorio y la contraseña debe tener al menos 8 caracteres.');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const existing = await prisma.staff.findUnique({ where: { email } });

    if (existing) {
        await prisma.staff.update({
            where: { email },
            data: { role: 'admin', verified: true, passwordHash },
        });
        console.log(`\nLa cuenta ${email} ahora es administrador (contraseña actualizada).`);
    } else {
        const name = await ask('Nombre: ', 'Admin');
        const lastName = await ask('Apellido: ', 'Clinica');
        const numberId = await ask('Cédula: ', `admin-${Date.now()}`);
        const numberPhone = await ask('Teléfono: ', `admin-${Date.now()}`);

        await prisma.staff.create({
            data: {
                name,
                lastName,
                numberId,
                numberPhone,
                address: 'Clínica Luxury Smile',
                birthday: '1990-01-01',
                sex: 'mujer',
                specialty: 'Administración',
                email,
                passwordHash,
                role: 'admin',
                verified: true, // el admin no necesita verificar el correo
            },
        });
        console.log(`\nAdministrador ${email} creado. Ya puedes iniciar sesión.`);
    }
} catch (error) {
    console.error('\nNo se pudo crear el administrador:', error.message);
    process.exitCode = 1;
} finally {
    rl.close();
    await prisma.$disconnect();
}
