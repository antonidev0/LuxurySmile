import { AppError } from "../lib/AppError.js";
import {
  dayKey,
  DOCTOR_STATUSES,
  hasDayArrived,
  isPast,
  NEEDS_DAY_REACHED,
  OPEN_STATUSES,
  parseSlot,
  STATUS_LABELS,
  toDay,
  transitionError,
  TRANSITIONS,
} from "../lib/appointmentRules.js";
import { forDoctor } from "../lib/staffPrivacy.js";
import * as appointmentRepository from "../repositories/appointmentRepository.js";
import { inScheduleTransaction, inTransaction } from "../repositories/transaction.js";
import {
  actorOf,
  assertSlotFree,
  closedError,
  doctorSnapshot,
  isAssigned,
  loadWithDoctors,
  sameIds,
} from "./scheduleChecks.js";

const connectDoctors = (doctorIds) => doctorIds.map((id) => ({ id }));

// Con doctor asignado y horario comprobado la cita nace confirmada; sin doctor queda pendiente
const initialStatus = (doctorIds) => (doctorIds.length ? "confirmada" : "pendiente");

const loadOpen = async (tx, id) => {
  const appointment = await loadWithDoctors(tx, id);
  if (!OPEN_STATUSES.includes(appointment.status)) throw closedError(appointment.status);
  return appointment;
};

export const listForAdmin = () => appointmentRepository.findAllForAdmin();

export const listForDoctor = async (doctorId) => (await appointmentRepository.findAssignedTo(doctorId)).map(forDoctor);

// Solo las horas: el doctor no ve los pacientes de agendas ajenas, pero sí qué horarios no puede proponer
export const occupiedTimes = (day) => appointmentRepository.findOccupiedTimes(toDay(day));

// Con replaceDoctorId se cambia un doctor por otro en un solo paso
export const assignDoctor = async (id, { doctorId, replaceDoctorId }, user) => {
  const actor = await actorOf(user);
  await inScheduleTransaction(async (tx) => {
    const appointment = await loadOpen(tx, id);
    if (isAssigned(appointment, doctorId)) throw new AppError("El doctor ya está asignado a esta cita", 400);
    if (replaceDoctorId && !isAssigned(appointment, replaceDoctorId)) {
      throw new AppError("El doctor que quieres sustituir no está asignado a esta cita", 400);
    }

    const [doctor] = await assertSlotFree(tx, {
      date: appointment.date,
      time: appointment.time,
      doctorIds: [doctorId],
      excludeId: appointment.id,
      clinicGap: false,
    });

    const disconnect = replaceDoctorId ? { disconnect: { id: replaceDoctorId } } : {};
    await appointmentRepository.update(id, { assignedDoctors: { connect: { id: doctorId }, ...disconnect } }, tx);

    const remaining = appointment.assignedDoctors.filter((d) => d.id !== replaceDoctorId);
    await appointmentRepository.createEvent(
      {
        appointmentId: id,
        type: "doctores",
        fromDoctors: doctorSnapshot(appointment.assignedDoctors),
        toDoctors: doctorSnapshot([...remaining, doctor]),
        ...actor,
      },
      tx,
    );
  });
  return appointmentRepository.findForAdmin(id);
};

export const unassignDoctor = async (id, doctorId, user) => {
  const actor = await actorOf(user);
  await inScheduleTransaction(async (tx) => {
    const appointment = await loadOpen(tx, id);
    if (!isAssigned(appointment, doctorId)) throw new AppError("El doctor no está asignado a esta cita", 400);
    if (appointment.status === "confirmada" && appointment.assignedDoctors.length === 1) {
      throw new AppError("Una cita confirmada necesita un doctor. Usa «Cambiar» para sustituirlo por otro.", 400);
    }

    await appointmentRepository.update(id, { assignedDoctors: { disconnect: { id: doctorId } } }, tx);
    await appointmentRepository.createEvent(
      {
        appointmentId: id,
        type: "doctores",
        fromDoctors: doctorSnapshot(appointment.assignedDoctors),
        toDoctors: doctorSnapshot(appointment.assignedDoctors.filter((d) => d.id !== doctorId)),
        ...actor,
      },
      tx,
    );
  });
  return appointmentRepository.findForAdmin(id);
};

const assertTransitionAllowed = (appointment, status, reason) => {
  if (appointment.status === status) throw new AppError(`La cita ya está ${STATUS_LABELS[status]}`, 400);
  if (!TRANSITIONS[appointment.status].includes(status)) {
    throw new AppError(transitionError(appointment.status, status), 400);
  }
  if (NEEDS_DAY_REACHED.includes(status) && !hasDayArrived(appointment.date)) {
    throw new AppError("Solo se puede marcar el día de la cita o después", 400);
  }
  // Para dejar constancia de quién la atendió, una cita completada necesita doctor
  if (status === "completada" && !appointment.assignedDoctors.length) {
    throw new AppError("Asigna el doctor que atendió al paciente antes de marcar la cita como completada", 400);
  }
  if (status === "cancelada" && !reason) throw new AppError("Indica el motivo de la cancelación", 400);
};

const assertCanConfirm = async (tx, appointment) => {
  if (!appointment.assignedDoctors.length) throw new AppError("Asigna un doctor antes de confirmar la cita", 400);
  if (isPast(dayKey(appointment.date), appointment.time)) {
    throw new AppError("La fecha de la cita ya pasó. Reprográmala antes de confirmarla.", 400);
  }
  await assertSlotFree(tx, {
    date: appointment.date,
    time: appointment.time,
    doctorIds: appointment.assignedDoctors.map((d) => d.id),
    excludeId: appointment.id,
    clinicGap: false,
  });
};

// Copia de los doctores que la atendieron, para conservarla aunque luego cambie su ficha
const completedBySnapshot = (doctors) =>
  doctors.map((doc) => ({
    name: `${doc.name} ${doc.lastName}`,
    ci: `V${doc.numberId}`,
    email: doc.email,
    specialty: doc.specialty,
  }));

// El admin gestiona todas; un doctor solo puede cerrar (completada / no asistió) las citas que tiene asignadas
export const changeStatus = async (id, { status, reason }, user) => {
  const isDoctor = user.role === "doctor";
  if (isDoctor && !DOCTOR_STATUSES.includes(status)) {
    throw new AppError("Solo la administración puede confirmar, cancelar o reprogramar citas", 403);
  }

  const actor = await actorOf(user);
  await inScheduleTransaction(async (tx) => {
    const appointment = await loadWithDoctors(tx, id);
    if (isDoctor && !isAssigned(appointment, user.id)) throw new AppError("No tienes asignada esta cita", 403);
    assertTransitionAllowed(appointment, status, reason);
    if (status === "confirmada") await assertCanConfirm(tx, appointment);

    const completedBy =
      status === "completada" ? { completedBy: completedBySnapshot(appointment.assignedDoctors) } : {};
    await appointmentRepository.update(id, { status, ...completedBy }, tx);
    await appointmentRepository.createEvent(
      {
        appointmentId: id,
        type: "estado",
        fromStatus: appointment.status,
        toStatus: status,
        reason: reason || null,
        ...actor,
      },
      tx,
    );
  });

  return isDoctor ? forDoctor(await appointmentRepository.findForDoctor(id)) : appointmentRepository.findForAdmin(id);
};

// Solo se guarda si el horario está libre y los doctores pueden atender; queda en el historial
export const reschedule = async (id, { date, time, doctorIds, reason }, user) => {
  const slot = parseSlot(date, time);
  const actor = await actorOf(user);

  await inScheduleTransaction(async (tx) => {
    const appointment = await loadOpen(tx, id);
    const currentIds = appointment.assignedDoctors.map((d) => d.id);
    const nextIds = doctorIds ?? currentIds;
    const slotChanged = dayKey(appointment.date) !== slot.day || appointment.time !== slot.time;
    const doctorsChanged = !sameIds(currentIds, nextIds);

    if (!slotChanged && !doctorsChanged) throw new AppError("No hay cambios que guardar", 400);
    if (appointment.status === "confirmada" && !nextIds.length) {
      throw new AppError("Una cita confirmada necesita al menos un doctor", 400);
    }

    const doctors = await assertSlotFree(tx, {
      date: slot.date,
      time: slot.time,
      doctorIds: nextIds,
      excludeId: appointment.id,
      clinicGap: slotChanged,
    });

    await appointmentRepository.update(
      id,
      { date: slot.date, time: slot.time, assignedDoctors: { set: connectDoctors(nextIds) } },
      tx,
    );
    const doctorChange = doctorsChanged
      ? { fromDoctors: doctorSnapshot(appointment.assignedDoctors), toDoctors: doctorSnapshot(doctors) }
      : {};
    await appointmentRepository.createEvent(
      {
        appointmentId: id,
        type: "reprogramada",
        fromDate: appointment.date,
        toDate: slot.date,
        fromTime: appointment.time,
        toTime: slot.time,
        ...doctorChange,
        reason: reason || null,
        ...actor,
      },
      tx,
    );
  });
  return appointmentRepository.findForAdmin(id);
};

// Crea la cita con su primera entrada del historial y devuelve su id
const createWithHistory = async (tx, { patient, slot, doctorIds, reason, actor, previousAppointmentId }) => {
  const doctors = await assertSlotFree(tx, { date: slot.date, time: slot.time, doctorIds });
  const status = initialStatus(doctorIds);

  const { id } = await appointmentRepository.create(
    {
      ...patient,
      date: slot.date,
      time: slot.time,
      status,
      previousAppointmentId,
      assignedDoctors: { connect: connectDoctors(doctorIds) },
    },
    tx,
  );
  await appointmentRepository.createEvent(
    {
      appointmentId: id,
      type: "creada",
      toStatus: status,
      toDate: slot.date,
      toTime: slot.time,
      toDoctors: doctorSnapshot(doctors),
      reason: reason || null,
      ...actor,
    },
    tx,
  );
  return id;
};

// Nueva cita para un paciente cuya cita se canceló o a la que no asistió.
// La cita original no se toca: conserva su estado, su motivo y su historial.
export const rebook = async (id, { date, time, doctorIds, reason }, user) => {
  const slot = parseSlot(date, time);
  const actor = await actorOf(user);

  const createdId = await inScheduleTransaction(async (tx) => {
    const source = await appointmentRepository.findById(id, tx);
    if (!source) throw new AppError("Cita no encontrada", 404);
    if (source.status !== "cancelada" && source.status !== "no_asistio") {
      throw new AppError(
        "Solo se crea una nueva cita a partir de una cancelada o de una a la que el paciente no asistió. Para mover esta cita, usa Reprogramar.",
        400,
      );
    }
    const { firstName, lastName, ci, email } = source;
    const patient = { firstName, lastName, ci, email };
    return createWithHistory(tx, { patient, slot, doctorIds, reason, actor, previousAppointmentId: source.id });
  });
  return appointmentRepository.findForAdmin(createdId);
};

const createForStaff = async ({ firstName, lastName, ci, email, date, time, reason }, doctorIds, user) => {
  const slot = parseSlot(date, time);
  const actor = await actorOf(user);
  const patient = { firstName, lastName, ci, email };
  return inScheduleTransaction((tx) => createWithHistory(tx, { patient, slot, doctorIds, reason, actor }));
};

// El admin crea citas para cualquier doctor (o sin doctor, pendientes de asignar)
export const createForAdmin = async (data, user) => {
  const id = await createForStaff(data, data.doctorIds, user);
  return appointmentRepository.findForAdmin(id);
};

// El doctor solo crea citas en su propia agenda: el doctor asignado es siempre el de la sesión,
// nunca un id enviado desde el navegador
export const createForDoctor = async (data, user) => {
  if (data.doctorIds.some((id) => id !== user.id)) {
    throw new AppError("Solo puedes crear citas en tu propia agenda", 403);
  }
  const id = await createForStaff(data, [user.id], user);
  return forDoctor(await appointmentRepository.findForDoctor(id));
};

export const getHistory = async (id) => {
  const events = await appointmentRepository.findEvents(id);
  if (!events) throw new AppError("Cita no encontrada", 404);
  return events;
};

// Nota administrativa: no forma parte de la historia clínica y no se puede editar
export const addNote = async (id, note, user) => {
  const actor = await actorOf(user);
  return inTransaction(async (tx) => {
    const appointment = await appointmentRepository.findById(id, tx);
    if (!appointment) throw new AppError("Cita no encontrada", 404);
    return appointmentRepository.createEvent({ appointmentId: id, type: "nota", reason: note, ...actor }, tx);
  });
};
