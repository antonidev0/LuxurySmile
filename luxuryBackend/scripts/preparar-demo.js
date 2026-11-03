// Prepara una base de datos de DEMO para enseñar la app: cuentas de prueba y citas futuras.
// Uso: DEMO_PASSWORD=... pnpm preparar-demo
// Sin DEMO_PASSWORD no hace nada, así nunca toca por error la base de datos real (en Render corre en cada build).
// Es idempotente: crea las cuentas si faltan y completa hasta DEMO_CITAS (100) citas de prueba futuras.
import dotenv from "dotenv";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { clinicNow, toDay } from "../src/lib/appointmentRules.js";
import { hashPassword } from "../src/lib/password.js";
import { isStrongPassword, PASSWORD_POLICY_MESSAGE } from "../src/validators/authSchemas.js";

const envPath = fileURLToPath(new URL("../.env", import.meta.url));
dotenv.config({ path: envPath });

const { DEMO_PASSWORD, DATABASE_URL } = process.env;
const TARGET = Number(process.env.DEMO_CITAS ?? 100);

if (!DEMO_PASSWORD) {
  console.log("DEMO_PASSWORD no está definida: no se prepara la demo.");
  process.exit(0);
}
if (!DATABASE_URL) {
  console.error(`No se encontró DATABASE_URL en ${envPath}.`);
  process.exit(1);
}
if (!isStrongPassword(DEMO_PASSWORD)) {
  console.error(`DEMO_PASSWORD no es válida. ${PASSWORD_POLICY_MESSAGE}`);
  process.exit(1);
}

const { prisma } = await import("../src/lib/prisma.js");

const DEMO_DOMAIN = "@demo.luxurysmile.test";
const TEST_DOMAIN = "@citas-prueba.test";

const ACCOUNTS = [
  { name: "Admin", lastName: "Demo", sex: "mujer", specialty: "Administración", role: "admin", user: "admin" },
  { name: "Laura", lastName: "Méndez", sex: "mujer", specialty: "Ortodoncia", role: "doctor", user: "laura" },
  { name: "Andrés", lastName: "Rivas", sex: "hombre", specialty: "Implantología", role: "doctor", user: "andres" },
  { name: "Daniela", lastName: "Paredes", sex: "mujer", specialty: "Estética dental", role: "doctor", user: "daniela" },
];

const ensureAccounts = async () => {
  const passwordHash = await hashPassword(DEMO_PASSWORD);
  for (const [index, { user, ...account }] of ACCOUNTS.entries()) {
    const email = `${user}${DEMO_DOMAIN}`;
    const exists = await prisma.staff.findUnique({ where: { email }, select: { id: true } });
    if (exists) continue;
    await prisma.staff.create({
      data: {
        ...account,
        email,
        passwordHash,
        verified: true,
        numberId: `DEMO-${index + 1}`,
        numberPhone: `+58 000 000 000${index + 1}`,
        address: "Clínica Luxury Smile (demo)",
        birthday: "1990-01-01",
      },
    });
    console.log(`Cuenta creada: ${email}`);
  }
};

const futureTestAppointments = () =>
  prisma.appointment.count({
    where: { email: { endsWith: TEST_DOMAIN }, date: { gte: toDay(clinicNow().day) } },
  });

try {
  await ensureAccounts();
  const missing = TARGET - (await futureTestAppointments());
  await prisma.$disconnect();
  if (missing > 0) {
    const script = fileURLToPath(new URL("./crear-citas-prueba.js", import.meta.url));
    execFileSync(process.execPath, [script, String(missing)], { stdio: "inherit" });
  } else {
    console.log(`Ya hay ${TARGET} o más citas de prueba futuras.`);
  }
  console.log(`\nDemo lista. Entra con admin${DEMO_DOMAIN} (o laura/andres/daniela${DEMO_DOMAIN}).`);
} catch (error) {
  console.error("\nNo se pudo preparar la demo:", error.message);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
