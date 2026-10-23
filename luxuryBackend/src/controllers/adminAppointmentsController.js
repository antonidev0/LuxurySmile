import fs from "fs";
import path from "path";
import { prisma } from "../config/db.js";
import {
  actorOf,
  ADMIN_INCLUDE,
  assertSlotFree,
  DOCTOR_FIELDS,
  doctorSnapshot,
  inScheduleTransaction,
} from "../services/appointmentService.js";
import { AppError } from "../utils/AppError.js";
import {
  dayKey,
  DOCTOR_STATUSES,
  hasDayArrived,
  isPast,
  NEEDS_DAY_REACHED,
  OPEN_STATUSES,
  parseSlot,
  STATUS_LABELS,
  STATUSES,
  transitionError,
  TRANSITIONS,
} from "../utils/appointmentRules.js";
import { DOCTOR_PUBLIC_FIELDS, forDoctor } from "../utils/staffPrivacy.js";

const WITH_DOCTORS = { assignedDoctors: { select: DOCTOR_FIELDS } };

// Comprueba si un usuario esta entre los doctores asignados
const isAssigned = (appointment, userId) =>
  appointment.assignedDoctors.some((doc) => doc.id === userId);

// Texto libre opcional (motivos y notas), recortado
const cleanText = (value, max = 500) => String(value ?? "").trim().slice(0, max);

// Lista de ids de doctores sin repetidos
const parseDoctorIds = (value) => {
  if (!Array.isArray(value) || value.some((id) => typeof id !== "string" || !id)) {
    throw new AppError("Lista de doctores inválida", 400);
  }
  return [...new Set(value)];
};

const sameIds = (a, b) => a.length === b.length && a.every((id) => b.includes(id));

// Mensaje cuando una cita ya no admite cambios de agenda ordinarios
const closedError = (status) =>
  new AppError(
    status === "completada"
      ? "Una cita completada no se puede modificar"
      : status === "cancelada"
        ? "La cita está cancelada y conserva su doctor como referencia. Para volver a atender al paciente, crea una nueva cita."
        : "El paciente no asistió a esta cita. Si lo solicita, crea una nueva cita.",
    400
  );

// Ruta para obtener todas las citas del admin
export const getAllAppointments = async (request, response) => {
  try {
    // Buscar todas las citas (con datos de los doctores asignados y las citas enlazadas)
    const appointments = await prisma.appointment.findMany({
      include: ADMIN_INCLUDE,
      orderBy: [{ date: "asc" }, { time: "asc" }],
    });

    response.status(200).json(appointments);

  } catch (error) {
    console.error("Error al obtener citas (Admin):", error);
    response.status(500).json({ message: "Error interno del servidor" });
  }
};

// Obtener todo el personal médico
// Esta ruta es para que el admin pueda ver todos los doctores y administradores 
export const getAllStaff = async (request, response) => {
  try {
    const staff = await prisma.staff.findMany({ orderBy: { createdAt: "asc" } });
    response.json(staff);
  } catch (error) {
    response.status(500).json({ message: "Error al obtener el personal médico" });
  }
};

// Asignar un doctor a una cita pendiente o confirmada.
// Con replaceDoctorId se cambia un doctor por otro en un solo paso.
export const assignDoctorToAppointment = async (request, response, next) => {
  const appointmentId = request.params.id;
  const { doctorId, replaceDoctorId } = request.body;

  if (!doctorId) {
    return response.status(400).json({ message: "DoctorId es requerido" });
  }

  try {
    const updated = await inScheduleTransaction(async (tx) => {
      const appointment = await tx.appointment.findUnique({ where: { id: appointmentId }, include: WITH_DOCTORS });
      if (!appointment) throw new AppError("Cita no encontrada", 404);
      if (!OPEN_STATUSES.includes(appointment.status)) throw closedError(appointment.status);

      // Verificar si el doctor ya está asignado
      if (isAssigned(appointment, doctorId)) throw new AppError("El doctor ya está asignado a esta cita", 400);
      if (replaceDoctorId && !isAssigned(appointment, replaceDoctorId)) {
        throw new AppError("El doctor que quieres sustituir no está asignado a esta cita", 400);
      }

      // Activo, con horario a esa hora y sin otra cita que se solape
      await assertSlotFree(tx, {
        date: appointment.date,
        time: appointment.time,
        doctorIds: [doctorId],
        excludeId: appointment.id,
        clinicGap: false,
      });

      const result = await tx.appointment.update({
        where: { id: appointmentId },
        data: {
          assignedDoctors: {
            connect: { id: doctorId },
            ...(replaceDoctorId ? { disconnect: { id: replaceDoctorId } } : {}),
          },
        },
        include: ADMIN_INCLUDE,
      });

      await tx.appointmentEvent.create({
        data: {
          appointmentId,
          type: "doctores",
          fromDoctors: doctorSnapshot(appointment.assignedDoctors),
          toDoctors: doctorSnapshot(result.assignedDoctors),
          ...(await actorOf(tx, request.user)),
        },
      });
      return result;
    });

    return response.status(200).json({
      message: replaceDoctorId ? "Doctor cambiado exitosamente" : "Doctor asignado exitosamente",
      appointment: updated,
    });
  } catch (error) {
    next(error);
  }
};


// Quitar un doctor de una cita pendiente o confirmada
export const unassignDoctorFromAppointment = async (request, response, next) => {
  const { id, doctorId } = request.params;

  try {
    const updated = await inScheduleTransaction(async (tx) => {
      const appointment = await tx.appointment.findUnique({ where: { id }, include: WITH_DOCTORS });
      if (!appointment) throw new AppError("Cita no encontrada", 404);
      if (!OPEN_STATUSES.includes(appointment.status)) throw closedError(appointment.status);
      if (!isAssigned(appointment, doctorId)) throw new AppError("El doctor no está asignado a esta cita", 400);

      if (appointment.status === "confirmada" && appointment.assignedDoctors.length === 1) {
        throw new AppError("Una cita confirmada necesita un doctor. Usa «Cambiar» para sustituirlo por otro.", 400);
      }

      const result = await tx.appointment.update({
        where: { id },
        data: { assignedDoctors: { disconnect: { id: doctorId } } },
        include: ADMIN_INCLUDE,
      });

      await tx.appointmentEvent.create({
        data: {
          appointmentId: id,
          type: "doctores",
          fromDoctors: doctorSnapshot(appointment.assignedDoctors),
          toDoctors: doctorSnapshot(result.assignedDoctors),
          ...(await actorOf(tx, request.user)),
        },
      });
      return result;
    });

    return response.status(200).json({ message: "Doctor retirado de la cita", appointment: updated });
  } catch (error) {
    next(error);
  }
};
  
// Cambiar el estado de una cita con una acción explícita (confirmar, cancelar, completar, no asistió).
// El admin gestiona todas; un doctor solo puede cerrar (completada / no asistió) las citas que tiene asignadas.
// Al completar una cita, tambien se guardan los datos de los doctores que la completaron
export const updateAppointment = async (request, response, next) => {
  const { id } = request.params;
  // Solo se permite cambiar el estado; el resto de campos no se toca desde aqui
  const { status } = request.body;
  const reason = cleanText(request.body.reason);
  const isDoctor = request.user.role === "doctor";

  if (!status) {
    return response.status(400).json({ message: "El estado es obligatorio" });
  }

  if (!STATUSES.includes(status)) {
    return response.status(400).json({ message: "Estado de cita inválido" });
  }

  if (isDoctor && !DOCTOR_STATUSES.includes(status)) {
    return response
      .status(403)
      .json({ message: "Solo la administración puede confirmar, cancelar o reprogramar citas" });
  }

  try {
    const updatedAppointment = await inScheduleTransaction(async (tx) => {
      const appointment = await tx.appointment.findUnique({ where: { id }, include: WITH_DOCTORS });
      if (!appointment) throw new AppError("Cita no encontrada", 404);

      // Un doctor solo puede modificar las citas que tiene asignadas
      if (isDoctor && !isAssigned(appointment, request.user.id)) {
        throw new AppError("No tienes asignada esta cita", 403);
      }

      if (appointment.status === status) {
        throw new AppError(`La cita ya está ${STATUS_LABELS[status]}`, 400);
      }

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

      if (status === "cancelada" && !reason) {
        throw new AppError("Indica el motivo de la cancelación", 400);
      }

      if (status === "confirmada") {
        if (!appointment.assignedDoctors.length) {
          throw new AppError("Asigna un doctor antes de confirmar la cita", 400);
        }
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
      }

      const data = { status };

      // Si se está completando ahora, guarda info de todos los doctores asignados
      if (status === "completada" && appointment.assignedDoctors.length > 0) {
        data.completedBy = appointment.assignedDoctors.map((doc) => ({
          name: `${doc.name} ${doc.lastName}`,
          ci: `V${doc.numberId}`,
          email: doc.email,
          specialty: doc.specialty,
        }));
      }

      const result = await tx.appointment.update({
        where: { id },
        data,
        // Un doctor no ve los datos de contacto del resto del personal
        include: isDoctor ? { assignedDoctors: { select: DOCTOR_PUBLIC_FIELDS } } : ADMIN_INCLUDE,
      });

      await tx.appointmentEvent.create({
        data: {
          appointmentId: id,
          type: "estado",
          fromStatus: appointment.status,
          toStatus: status,
          reason: reason || null,
          ...(await actorOf(tx, request.user)),
        },
      });
      return result;
    });

    response.status(200).json(isDoctor ? forDoctor(updatedAppointment) : updatedAppointment);
  } catch (error) {
    next(error);
  }
};

// Reprogramar una cita pendiente o confirmada: nueva fecha, hora y/o doctores.
// Solo se guarda si el horario está libre y los doctores pueden atender; queda en el historial.
export const rescheduleAppointment = async (request, response, next) => {
  const { id } = request.params;
  const reason = cleanText(request.body.reason);

  try {
    const slot = parseSlot(request.body.date, request.body.time);

    const updated = await inScheduleTransaction(async (tx) => {
      const appointment = await tx.appointment.findUnique({ where: { id }, include: WITH_DOCTORS });
      if (!appointment) throw new AppError("Cita no encontrada", 404);
      if (!OPEN_STATUSES.includes(appointment.status)) throw closedError(appointment.status);

      const currentIds = appointment.assignedDoctors.map((d) => d.id);
      const doctorIds = request.body.doctorIds === undefined ? currentIds : parseDoctorIds(request.body.doctorIds);
      const slotChanged = dayKey(appointment.date) !== slot.day || appointment.time !== slot.time;
      const doctorsChanged = !sameIds(currentIds, doctorIds);

      if (!slotChanged && !doctorsChanged) throw new AppError("No hay cambios que guardar", 400);
      if (appointment.status === "confirmada" && !doctorIds.length) {
        throw new AppError("Una cita confirmada necesita al menos un doctor", 400);
      }

      await assertSlotFree(tx, {
        date: slot.date,
        time: slot.time,
        doctorIds,
        excludeId: appointment.id,
        clinicGap: slotChanged,
      });

      const result = await tx.appointment.update({
        where: { id },
        data: { date: slot.date, time: slot.time, assignedDoctors: { set: doctorIds.map((doctorId) => ({ id: doctorId })) } },
        include: ADMIN_INCLUDE,
      });

      await tx.appointmentEvent.create({
        data: {
          appointmentId: id,
          type: "reprogramada",
          fromDate: appointment.date,
          toDate: slot.date,
          fromTime: appointment.time,
          toTime: slot.time,
          ...(doctorsChanged
            ? { fromDoctors: doctorSnapshot(appointment.assignedDoctors), toDoctors: doctorSnapshot(result.assignedDoctors) }
            : {}),
          reason: reason || null,
          ...(await actorOf(tx, request.user)),
        },
      });
      return result;
    });

    response.status(200).json({ message: "Cita reprogramada", appointment: updated });
  } catch (error) {
    next(error);
  }
};

// Nueva cita para un paciente cuya cita se canceló o a la que no asistió.
// La cita original no se toca: conserva su estado, su motivo y su historial.
export const rebookAppointment = async (request, response, next) => {
  const { id } = request.params;
  const reason = cleanText(request.body.reason);

  try {
    const slot = parseSlot(request.body.date, request.body.time);
    const doctorIds = request.body.doctorIds === undefined ? [] : parseDoctorIds(request.body.doctorIds);

    const created = await inScheduleTransaction(async (tx) => {
      const source = await tx.appointment.findUnique({ where: { id } });
      if (!source) throw new AppError("Cita no encontrada", 404);
      if (source.status !== "cancelada" && source.status !== "no_asistio") {
        throw new AppError(
          "Solo se crea una nueva cita a partir de una cancelada o de una a la que el paciente no asistió. Para mover esta cita, usa Reprogramar.",
          400
        );
      }

      await assertSlotFree(tx, { date: slot.date, time: slot.time, doctorIds });

      // Con doctor asignado y horario comprobado, la cita nace confirmada; sin doctor queda pendiente
      const status = doctorIds.length ? "confirmada" : "pendiente";
      const result = await tx.appointment.create({
        data: {
          firstName: source.firstName,
          lastName: source.lastName,
          ci: source.ci,
          email: source.email,
          date: slot.date,
          time: slot.time,
          status,
          previousAppointmentId: source.id,
          assignedDoctors: { connect: doctorIds.map((doctorId) => ({ id: doctorId })) },
        },
        include: ADMIN_INCLUDE,
      });

      await tx.appointmentEvent.create({
        data: {
          appointmentId: result.id,
          type: "creada",
          toStatus: status,
          toDate: slot.date,
          toTime: slot.time,
          toDoctors: doctorSnapshot(result.assignedDoctors),
          reason: reason || null,
          ...(await actorOf(tx, request.user)),
        },
      });
      return result;
    });

    response.status(201).json({ message: "Nueva cita creada", appointment: created });
  } catch (error) {
    next(error);
  }
};

// Nueva cita registrada por la administración (p. ej. desde el calendario).
// Mismas comprobaciones de agenda que al reprogramar; queda en el historial con quién la creó.
const EMAIL_FORMAT = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const createAdminAppointment = async (request, response, next) => {
  const reason = cleanText(request.body.reason);
  const firstName = cleanText(request.body.firstName, 100);
  const lastName = cleanText(request.body.lastName, 100);
  const ci = cleanText(request.body.ci, 30).toUpperCase();
  const email = cleanText(request.body.email, 200);

  try {
    if (!firstName || !lastName || !ci || !email) throw new AppError("Los datos del paciente son obligatorios", 400);
    if (!EMAIL_FORMAT.test(email)) throw new AppError("Correo electrónico inválido", 400);
    const slot = parseSlot(request.body.date, request.body.time);
    const doctorIds = request.body.doctorIds === undefined ? [] : parseDoctorIds(request.body.doctorIds);

    const created = await inScheduleTransaction(async (tx) => {
      await assertSlotFree(tx, { date: slot.date, time: slot.time, doctorIds });

      // Igual que al reagendar: con doctor asignado y horario comprobado nace confirmada; sin doctor queda pendiente
      const status = doctorIds.length ? "confirmada" : "pendiente";
      const result = await tx.appointment.create({
        data: {
          firstName,
          lastName,
          ci,
          email,
          date: slot.date,
          time: slot.time,
          status,
          assignedDoctors: { connect: doctorIds.map((doctorId) => ({ id: doctorId })) },
        },
        include: ADMIN_INCLUDE,
      });

      await tx.appointmentEvent.create({
        data: {
          appointmentId: result.id,
          type: "creada",
          toStatus: status,
          toDate: slot.date,
          toTime: slot.time,
          toDoctors: doctorSnapshot(result.assignedDoctors),
          reason: reason || null,
          ...(await actorOf(tx, request.user)),
        },
      });
      return result;
    });

    response.status(201).json({ message: "Cita creada", appointment: created });
  } catch (error) {
    next(error);
  }
};

// Historial de cambios y notas administrativas de una cita (solo admin)
export const getAppointmentHistory = async (request, response, next) => {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: request.params.id },
      select: { id: true, events: { orderBy: { createdAt: "asc" } } },
    });
    if (!appointment) throw new AppError("Cita no encontrada", 404);
    response.status(200).json(appointment.events);
  } catch (error) {
    next(error);
  }
};

// Añadir una nota administrativa (no forma parte de la historia clínica y no se puede editar)
export const addAppointmentNote = async (request, response, next) => {
  try {
    const note = cleanText(request.body.note, 1000);
    if (!note) throw new AppError("Escribe la nota", 400);

    const event = await prisma.$transaction(async (tx) => {
      const appointment = await tx.appointment.findUnique({ where: { id: request.params.id }, select: { id: true } });
      if (!appointment) throw new AppError("Cita no encontrada", 404);
      return tx.appointmentEvent.create({
        data: { appointmentId: appointment.id, type: "nota", reason: note, ...(await actorOf(tx, request.user)) },
      });
    });
    response.status(201).json(event);
  } catch (error) {
    next(error);
  }
};


// Activar a mano la cuenta de un miembro del personal (Admin),
// por ejemplo si no le llegó el correo de verificacion
export const verifyStaffById = async (request, response) => {
  try {
    const staff = await prisma.staff.findUnique({ where: { id: request.params.id } });
    if (!staff) {
      return response.status(404).json({ message: "Personal no encontrado" });
    }

    const updated = await prisma.staff.update({ where: { id: staff.id }, data: { verified: true } });
    response.status(200).json({ message: "Cuenta activada", staff: updated });
  } catch (error) {
    console.error("Error al activar la cuenta:", error);
    response.status(500).json({ message: "Error al activar la cuenta" });
  }
};

export const uploadAppointmentPDF = async (request, response) => {
  try {
    const { id } = request.params;

    if (!request.file) {
      return response.status(400).json({ message: "Debes adjuntar un archivo PDF" });
    }

    const filePath = `/uploads/pdf/${request.file.filename}`;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: WITH_DOCTORS,
    });

    if (!appointment) {
      fs.unlink(request.file.path, () => {});
      return response.status(404).json({ message: "Cita no encontrada" });
    }

    if (request.user.role === "doctor" && !isAssigned(appointment, request.user.id)) {
      fs.unlink(request.file.path, () => {});
      return response.status(403).json({ message: "No tienes asignada esta cita" });
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: { historialPDF: filePath },
    });

    return response.status(200).json({
      message: "PDF subido exitosamente",
      historialPDF: updated.historialPDF,
    });
  } catch (error) {
    console.error("Error al subir el PDF:", error);
    response.status(500).json({ message: "Error del servidor" });
  }
};

// Descargar el historial PDF de una cita (solo personal con sesion iniciada)
export const getAppointmentPDF = async (request, response) => {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: request.params.id },
      include: WITH_DOCTORS,
    });

    if (!appointment || !appointment.historialPDF) {
      return response.status(404).json({ message: "Historial no encontrado" });
    }

    if (request.user.role === "doctor" && !isAssigned(appointment, request.user.id)) {
      return response.status(403).json({ message: "No tienes asignada esta cita" });
    }

    // historialPDF se guarda como "/uploads/pdf/<archivo>.pdf"; usamos solo el nombre del archivo
    const fileName = path.basename(appointment.historialPDF);
    const filePath = path.resolve("uploads", "pdf", fileName);

    if (!fs.existsSync(filePath)) {
      return response.status(404).json({ message: "Archivo no encontrado" });
    }

    response.sendFile(filePath);
  } catch (error) {
    console.error("Error al obtener el PDF:", error);
    response.status(500).json({ message: "Error del servidor" });
  }
};
