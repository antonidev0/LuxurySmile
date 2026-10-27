// Crea citas de prueba para medir la velocidad de la app con una agenda llena.
// Uso (desde luxuryBackend):
//   node scripts/crear-citas-prueba.js            -> crea 100 citas
//   node scripts/crear-citas-prueba.js 300        -> crea 300 citas
//   node scripts/crear-citas-prueba.js --borrar   -> borra las citas de prueba
// Las citas siguen las reglas de la agenda: lunes a sábado, de 8:00 a 16:40, cada 40 minutos,
// solo en horarios futuros y libres. Con doctor asignado nacen confirmadas; sin doctor, pendientes.
// Se identifican por el correo @citas-prueba.test, así se pueden borrar sin tocar las citas reales.
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import { FREE_STATUSES, SLOT_MINUTES, clinicNow, dayKey, isPast, toDay } from "../src/lib/appointmentRules.js";
import { CLINIC_CLOSING, CLINIC_DAYS, CLINIC_OPENING, isAvailableAt, toMinutes } from "../src/lib/availability.js";

const envPath = fileURLToPath(new URL("../.env", import.meta.url));
dotenv.config({ path: envPath });

if (!process.env.DATABASE_URL) {
  console.error(`No se encontró DATABASE_URL en ${envPath}.`);
  process.exit(1);
}

// Se importa después de cargar el .env para que el cliente encuentre DATABASE_URL
const { prisma } = await import("../src/lib/prisma.js");

const TEST_DOMAIN = "@citas-prueba.test";
const MAX_COUNT = 2000;

const FIRST_NAMES = ["Ana", "Luis", "María", "Carlos", "Sofía", "José", "Valentina", "Miguel", "Camila", "Andrés"];
const LAST_NAMES = ["Pérez", "González", "Rodríguez", "Hernández", "García", "Martínez", "López", "Díaz", "Torres"];

const pad = (n) => String(n).padStart(2, "0");
const toTime = (minutes) => `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;

// Horas en las que la clínica da citas: de la apertura al cierre, separadas SLOT_MINUTES
const DAY_TIMES = [];
for (let m = toMinutes(CLINIC_OPENING); m <= toMinutes(CLINIC_CLOSING); m += SLOT_MINUTES) DAY_TIMES.push(toTime(m));

const nextDay = (key) => dayKey(new Date(toDay(key).getTime() + 24 * 60 * 60 * 1000));

const parseCount = (arg) => {
  const count = Number(arg ?? 100);
  if (!Number.isInteger(count) || count < 1 || count > MAX_COUNT) {
    throw new Error(`La cantidad debe ser un número entero entre 1 y ${MAX_COUNT}.`);
  }
  return count;
};

const loadDoctors = () =>
  prisma.staff.findMany({
    where: { role: "doctor", verified: true, deactivatedAt: null },
    select: { id: true, availability: true },
  });

// Horas ya ocupadas ese día por citas activas (reales o de prueba)
const occupiedMinutes = async (date) => {
  const taken = await prisma.appointment.findMany({
    where: { date, status: { notIn: FREE_STATUSES } },
    select: { time: true },
  });
  return taken.map((a) => toMinutes(a.time));
};

const freeTimesOn = async (day) => {
  const date = toDay(day);
  if (!CLINIC_DAYS.includes(date.getUTCDay())) return [];
  const taken = await occupiedMinutes(date);
  return DAY_TIMES.filter(
    (time) => !isPast(day, time) && taken.every((m) => Math.abs(m - toMinutes(time)) >= SLOT_MINUTES),
  );
};

// Reparte los doctores por turnos; una de cada tres citas queda sin doctor (pendiente)
const pickDoctor = (doctors, index, date, time) => {
  if (!doctors.length || index % 3 === 2) return null;
  const start = index % doctors.length;
  for (let i = 0; i < doctors.length; i++) {
    const doctor = doctors[(start + i) % doctors.length];
    if (isAvailableAt(doctor.availability, date, time)) return doctor;
  }
  return null;
};

const buildAppointment = (index, day, time, doctor) => {
  const number = String(index + 1).padStart(4, "0");
  return {
    firstName: FIRST_NAMES[index % FIRST_NAMES.length],
    lastName: `${LAST_NAMES[index % LAST_NAMES.length]} (Prueba ${number})`,
    ci: `PRUEBA-${number}`,
    email: `paciente${number}${TEST_DOMAIN}`,
    date: toDay(day),
    time,
    status: doctor ? "confirmada" : "pendiente",
    ...(doctor ? { assignedDoctors: { connect: { id: doctor.id } } } : {}),
  };
};

const createAppointments = async (count) => {
  const doctors = await loadDoctors();
  const offset = await prisma.appointment.count({ where: { email: { endsWith: TEST_DOMAIN } } });
  let day = clinicNow().day;
  let created = 0;
  let lastDay = day;
  console.log(`Creando ${count} citas de prueba (doctores disponibles: ${doctors.length})...`);

  while (created < count) {
    for (const time of await freeTimesOn(day)) {
      if (created >= count) break;
      const index = offset + created;
      const doctor = pickDoctor(doctors, index, toDay(day), time);
      await prisma.appointment.create({ data: buildAppointment(index, day, time, doctor), select: { id: true } });
      created++;
      lastDay = day;
    }
    day = nextDay(day);
  }

  console.log(`Se crearon ${created} citas de prueba, hasta el ${lastDay}.`);
  if (!doctors.length) console.log("No hay doctores activos y verificados: todas quedaron pendientes.");
};

// Solo se borran las de prueba que nadie tocó desde la app: el historial de citas no se puede borrar
const deleteAppointments = async () => {
  const where = { email: { endsWith: TEST_DOMAIN } };
  const { count } = await prisma.appointment.deleteMany({
    where: { ...where, events: { none: {} }, createdRecords: { none: {} }, rebookedAs: { none: {} } },
  });
  const kept = await prisma.appointment.count({ where });
  console.log(`Se borraron ${count} citas de prueba.`);
  if (kept) {
    console.log(`${kept} no se pudieron borrar porque ya tienen historial o fichas (se modificaron desde la app).`);
  }
};

try {
  const arg = process.argv[2];
  if (arg === "--borrar") await deleteAppointments();
  else await createAppointments(parseCount(arg));
} catch (error) {
  console.error("\nFalló el script de citas de prueba:", error.message);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
