// Comprobaciones de agenda e historial compartidas por las acciones sobre citas
import { AppError } from "../lib/AppError.js";
import { SLOT_MINUTES, toMinutes } from "../lib/appointmentRules.js";
import { isAvailableAt } from "../lib/availability.js";
import * as appointmentRepository from "../repositories/appointmentRepository.js";
import * as staffRepository from "../repositories/staffRepository.js";

export const doctorLabel = (doctor) => `Dr. ${doctor.name} ${doctor.lastName}`;

// Copia de los doctores para el historial, para que no cambie si luego se edita su ficha
export const doctorSnapshot = (doctors) => doctors.map((d) => ({ id: d.id, name: `${d.name} ${d.lastName}` }));

export const isAssigned = (appointment, userId) => appointment.assignedDoctors.some((doc) => doc.id === userId);

export const sameIds = (a, b) => a.length === b.length && a.every((id) => b.includes(id));

// Quién hace el cambio, con su nombre copiado para que el historial no dependa de su ficha.
// Se lee antes de abrir la transacción: no forma parte de la agenda y así no la alarga.
export const actorOf = async (user) => {
  const staff = await staffRepository.findActorById(user.id);
  return {
    actorId: user.id,
    actorName: staff ? `${staff.name} ${staff.lastName}` : "Usuario",
    actorRole: staff?.role ?? user.role,
  };
};

// Error cuando una cita ya no admite cambios de agenda ordinarios
export const closedError = (status) => {
  if (status === "completada") return new AppError("Una cita completada no se puede modificar", 400);
  if (status === "cancelada") {
    return new AppError(
      "La cita está cancelada y conserva su doctor como referencia. Para volver a atender al paciente, crea una nueva cita.",
      400,
    );
  }
  return new AppError("El paciente no asistió a esta cita. Si lo solicita, crea una nueva cita.", 400);
};

export const loadWithDoctors = async (tx, id) => {
  const appointment = await appointmentRepository.findWithDoctors(id, tx);
  if (!appointment) throw new AppError("Cita no encontrada", 404);
  return appointment;
};

const describeHours = (availability, date) => {
  const range = availability?.[new Date(date).getUTCDay()];
  return range ? `ese día atiende de ${range.start} a ${range.end}` : "no atiende ese día de la semana";
};

const assertDoctorCanAttend = (doctor, { date, time, near }) => {
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
};

/**
 * Comprueba que una cita pueda ocupar ese día y hora con esos doctores.
 * - clinicGap: exige la separación mínima con el resto de citas de la clínica (igual que al crear una cita).
 * - Cada doctor debe estar activo, atender a esa hora y no tener otra cita que se solape.
 * Devuelve los doctores o lanza un error con el motivo.
 */
export const assertSlotFree = async (tx, { date, time, doctorIds, excludeId, clinicGap = true }) => {
  const minutes = toMinutes(time);
  const sameDay = await appointmentRepository.findActiveOnDay(date, { excludeId }, tx);
  const near = sameDay.filter((a) => Math.abs(toMinutes(a.time) - minutes) < SLOT_MINUTES);

  if (clinicGap && near.length) {
    throw new AppError(
      `Ya hay una cita a las ${near[0].time} ese día. Debe haber al menos ${SLOT_MINUTES} minutos entre citas.`,
      409,
    );
  }

  const doctors = doctorIds.length ? await staffRepository.findForScheduling(doctorIds, tx) : [];
  if (doctors.length !== doctorIds.length) throw new AppError("Alguno de los doctores no existe", 400);

  for (const doctor of doctors) assertDoctorCanAttend(doctor, { date, time, near });
  return doctors;
};
