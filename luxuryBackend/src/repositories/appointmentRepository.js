import { prisma } from "../lib/prisma.js";
import { FREE_STATUSES, OPEN_STATUSES } from "../lib/appointmentRules.js";
import { DOCTOR_PUBLIC_FIELDS } from "../lib/staffPrivacy.js";

// Datos de los doctores que ve la administración junto a cada cita
const DOCTOR_FIELDS = { id: true, name: true, lastName: true, email: true, specialty: true, numberId: true };

// Citas enlazadas al reagendar una cancelada o una a la que el paciente no asistió
const LINKED_FIELDS = { id: true, date: true, time: true, status: true };

const ADMIN_INCLUDE = {
  assignedDoctors: { select: DOCTOR_FIELDS },
  previousAppointment: { select: LINKED_FIELDS },
  rebookedAs: { select: LINKED_FIELDS, orderBy: { createdAt: "asc" } },
};

// Un doctor no ve los datos de contacto del resto del personal
const DOCTOR_INCLUDE = { assignedDoctors: { select: DOCTOR_PUBLIC_FIELDS } };

const WITH_DOCTORS = { assignedDoctors: { select: DOCTOR_FIELDS } };

const BY_SCHEDULE = [{ date: "asc" }, { time: "asc" }];

export const findAllForAdmin = () => prisma.appointment.findMany({ include: ADMIN_INCLUDE, orderBy: BY_SCHEDULE });

export const findForAdmin = (id) => prisma.appointment.findUnique({ where: { id }, include: ADMIN_INCLUDE });

export const findForDoctor = (id) => prisma.appointment.findUnique({ where: { id }, include: DOCTOR_INCLUDE });

export const findAssignedTo = (doctorId) =>
  prisma.appointment.findMany({
    where: { assignedDoctors: { some: { id: doctorId } } },
    include: DOCTOR_INCLUDE,
    orderBy: BY_SCHEDULE,
  });

export const findById = (id, db = prisma) => db.appointment.findUnique({ where: { id } });

export const findWithDoctors = (id, db = prisma) => db.appointment.findUnique({ where: { id }, include: WITH_DOCTORS });

export const findOpenAssignedTo = (doctorId) =>
  prisma.appointment.findMany({
    where: { status: { in: OPEN_STATUSES }, assignedDoctors: { some: { id: doctorId } } },
    select: { id: true, firstName: true, lastName: true, date: true, time: true, status: true },
    orderBy: BY_SCHEDULE,
  });

// Citas que ocupan horario ese día, para comprobar solapes
export const findActiveOnDay = (date, { excludeId } = {}, db = prisma) =>
  db.appointment.findMany({
    where: { date, status: { notIn: FREE_STATUSES }, ...(excludeId ? { id: { not: excludeId } } : {}) },
    select: { id: true, time: true, firstName: true, lastName: true, assignedDoctors: { select: { id: true } } },
  });

export const findOccupiedTimes = async (date) => {
  const appointments = await prisma.appointment.findMany({
    where: { date, status: { notIn: FREE_STATUSES } },
    select: { time: true },
  });
  return appointments.map((a) => a.time);
};

export const create = (data, db = prisma) => db.appointment.create({ data, select: { id: true } });

export const update = (id, data, db = prisma) => db.appointment.update({ where: { id }, data, select: { id: true } });

export const updateMany = (where, data, db = prisma) => db.appointment.updateMany({ where, data });

export const findEvents = async (id) => {
  const appointment = await prisma.appointment.findUnique({
    where: { id },
    select: { events: { orderBy: { createdAt: "asc" } } },
  });
  return appointment?.events ?? null;
};

export const createEvent = (data, db = prisma) => db.appointmentEvent.create({ data });
