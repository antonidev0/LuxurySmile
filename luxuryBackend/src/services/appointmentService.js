// Comprobaciones de agenda e historial compartidos por las acciones sobre citas
import { Prisma } from "@prisma/client";
import { prisma } from "../config/db.js";
import { AppError } from "../utils/AppError.js";
import { FREE_STATUSES, SLOT_MINUTES, toMinutes } from "../utils/appointmentRules.js";
import { isAvailableAt } from "../utils/availability.js";

// Datos de los doctores que se devuelven junto a cada cita (vista del admin)
export const DOCTOR_FIELDS = { id: true, name: true, lastName: true, email: true, specialty: true, numberId: true };

// Citas enlazadas al reagendar una cancelada o una a la que el paciente no asistió
const LINKED_FIELDS = { id: true, date: true, time: true, status: true };

export const ADMIN_INCLUDE = {
  assignedDoctors: { select: DOCTOR_FIELDS },
  previousAppointment: { select: LINKED_FIELDS },
  rebookedAs: { select: LINKED_FIELDS, orderBy: { createdAt: "asc" } },
};

// Cita con todos los datos que ve el admin. Se carga después del commit para no alargar la transacción.
export const loadForAdmin = (id) => prisma.appointment.findUnique({ where: { id }, include: ADMIN_INCLUDE });

export const doctorLabel = (doctor) => `Dr. ${doctor.name} ${doctor.lastName}`;

// Copia de los doctores para el historial
export const doctorSnapshot = (doctors) => doctors.map((d) => ({ id: d.id, name: `${d.name} ${d.lastName}` }));

// Quién hace el cambio, con su nombre copiado para que el historial no dependa de su ficha.
// Se lee antes de abrir la transacción: no forma parte de la agenda y así no la alarga.
export const actorOf = async (user) => {
  const staff = await prisma.staff.findUnique({ where: { id: user.id }, select: { name: true, lastName: true, role: true } });
  return { actorId: user.id, actorName: staff ? `${staff.name} ${staff.lastName}` : "Usuario", actorRole: staff?.role ?? user.role };
};

// Tiempos de las transacciones interactivas. Las transacciones solo hacen las consultas que protegen la
// agenda, pero con una base de datos remota cada una es un viaje de ida y vuelta: este margen evita que
// Prisma las cierre a mitad (P2028, "Transaction not found") con los 5 s que da por defecto.
export const TRANSACTION_OPTIONS = { maxWait: 5_000, timeout: 15_000 };

// Ejecuta fn en una transacción serializable: dos cambios simultáneos no pueden dejar citas solapadas
export const inScheduleTransaction = async (fn) => {
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await prisma.$transaction(fn, {
        ...TRANSACTION_OPTIONS,
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      });
    } catch (error) {
      // La transacción se agotó y Prisma la deshizo: no se guardó nada
      if (error?.code === "P2028") {
        throw new AppError("La base de datos tardó demasiado en responder y no se guardó el cambio. Vuelve a intentarlo.", 503);
      }
      if (error?.code !== "P2034") throw error;
      if (attempt >= 2) throw new AppError("Otra persona modificó la agenda al mismo tiempo. Vuelve a intentarlo.", 409);
    }
  }
};

const describeHours = (availability, date) => {
  const range = availability?.[new Date(date).getUTCDay()];
  return range ? `ese día atiende de ${range.start} a ${range.end}` : "no atiende ese día de la semana";
};

/**
 * Comprueba que una cita pueda ocupar ese día y hora con esos doctores.
 * - clinicGap: exige la separación mínima con el resto de citas de la clínica (igual que al reservar).
 * - Cada doctor debe estar activo, atender a esa hora y no tener otra cita que se solape.
 * Devuelve los doctores o lanza un error con el motivo.
 */
export const assertSlotFree = async (tx, { date, time, doctorIds, excludeId, clinicGap = true }) => {
  const minutes = toMinutes(time);
  const sameDay = await tx.appointment.findMany({
    where: { date, status: { notIn: FREE_STATUSES }, ...(excludeId ? { id: { not: excludeId } } : {}) },
    select: { id: true, time: true, firstName: true, lastName: true, assignedDoctors: { select: { id: true } } },
  });
  const near = sameDay.filter((a) => Math.abs(toMinutes(a.time) - minutes) < SLOT_MINUTES);

  if (clinicGap && near.length) {
    throw new AppError(
      `Ya hay una cita a las ${near[0].time} ese día. Debe haber al menos ${SLOT_MINUTES} minutos entre citas.`,
      409
    );
  }

  const doctors = doctorIds.length ? await tx.staff.findMany({ where: { id: { in: doctorIds } } }) : [];
  if (doctors.length !== doctorIds.length) throw new AppError("Alguno de los doctores no existe", 400);

  for (const doctor of doctors) {
    const name = doctorLabel(doctor);
    if (doctor.role !== "doctor") throw new AppError(`${doctor.name} ${doctor.lastName} no es doctor`, 400);
    if (doctor.deactivatedAt) throw new AppError(`${name} está dado de baja y no puede atender citas`, 400);
    if (!doctor.verified) {
      throw new AppError(`${name} aún no ha activado su cuenta. Actívala desde Personal antes de asignarle citas.`, 400);
    }
    if (!isAvailableAt(doctor.availability, date, time)) {
      throw new AppError(`${name} no atiende a esa hora: ${describeHours(doctor.availability, date)}.`, 409);
    }
    const clash = near.find((a) => a.assignedDoctors.some((d) => d.id === doctor.id));
    if (clash) {
      throw new AppError(`${name} ya tiene otra cita a las ${clash.time} (${clash.firstName} ${clash.lastName}).`, 409);
    }
  }
  return doctors;
};
