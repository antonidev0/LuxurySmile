import fs from "fs";
import path from "path";
import { prisma } from "../config/db.js";
import { actorOf } from "../services/appointmentService.js";
import { PDF_DIR } from "../middlewares/upload.js";
import { AppError } from "../utils/AppError.js";
import { renderFichaPDF, sanitizeFicha } from "../utils/ficha.js";

// Las fichas de un paciente se agrupan por cédula, sin distinguir mayúsculas ni espacios
const patientKey = (ci) => String(ci ?? "").toUpperCase().replace(/\s+/g, "");

const RECORD_FIELDS = {
  id: true,
  data: true,
  createdAt: true,
  updatedAt: true,
  createdByName: true,
  updatedByName: true,
  appointment: { select: { id: true, date: true, time: true } },
};

// Cita con su control de acceso: un doctor solo trabaja con las fichas de sus citas asignadas
const loadAppointment = async (appointmentId, user) => {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { assignedDoctors: { select: { id: true } } },
  });
  if (!appointment) throw new AppError("Cita no encontrada", 404);
  if (user.role === "doctor" && !appointment.assignedDoctors.some((doc) => doc.id === user.id)) {
    throw new AppError("No tienes asignada esta cita", 403);
  }
  return appointment;
};

const removeFile = (publicPath) => {
  if (publicPath) fs.unlink(path.join(PDF_DIR, path.basename(publicPath)), () => {});
};

// Datos para el formulario de la ficha de una cita: la ficha que ya usa la cita,
// la última ficha del paciente y los datos de la cita para empezar una ficha nueva
export const getRecordForm = async (request, response, next) => {
  try {
    const appointment = await loadAppointment(request.params.appointmentId, request.user);

    const [current, latest] = await Promise.all([
      appointment.medicalRecordId
        ? prisma.medicalRecord.findUnique({ where: { id: appointment.medicalRecordId }, select: RECORD_FIELDS })
        : null,
      prisma.medicalRecord.findFirst({
        where: { patientCi: patientKey(appointment.ci) },
        orderBy: { createdAt: "desc" },
        select: RECORD_FIELDS,
      }),
    ]);

    response.status(200).json({
      current,
      latest,
      defaults: {
        fecha: appointment.date.toISOString().slice(0, 10),
        nombre: `${appointment.firstName} ${appointment.lastName}`.trim(),
        ci: appointment.ci,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Guarda la ficha de una cita y genera su PDF con el formato oficial.
// Con recordId se actualiza esa ficha del paciente (p. ej. la de su última historia);
// sin él se crea una ficha nueva aparte. La cita queda enlazada a la ficha guardada.
export const saveRecord = async (request, response, next) => {
  let newPath = null;
  try {
    const appointment = await loadAppointment(request.params.appointmentId, request.user);
    const data = sanitizeFicha(request.body?.data);
    const { recordId } = request.body ?? {};
    const ci = patientKey(appointment.ci);

    let existing = null;
    if (recordId) {
      existing = await prisma.medicalRecord.findUnique({ where: { id: String(recordId) } });
      if (!existing || existing.patientCi !== ci) {
        throw new AppError("La ficha no pertenece a este paciente", 400);
      }
    }

    // Cada versión del PDF tiene su propio nombre para que nadie vea una copia anterior en caché
    const fileName = `ficha-${Date.now()}-${Math.round(Math.random() * 1e9)}.pdf`;
    fs.mkdirSync(PDF_DIR, { recursive: true });
    fs.writeFileSync(path.join(PDF_DIR, fileName), await renderFichaPDF(data));
    newPath = `/uploads/pdf/${fileName}`;

    const { actorId, actorName } = await actorOf(request.user);
    const record = await prisma.$transaction(async (tx) => {
      const saved = existing
        ? await tx.medicalRecord.update({
            where: { id: existing.id },
            data: { data, pdfPath: newPath, updatedById: actorId, updatedByName: actorName },
          })
        : await tx.medicalRecord.create({
            data: {
              patientCi: ci,
              appointmentId: appointment.id,
              data,
              pdfPath: newPath,
              createdById: actorId,
              createdByName: actorName,
            },
          });

      // Las citas que ya usaban esta ficha pasan a ver el PDF nuevo
      if (existing) {
        await tx.appointment.updateMany({ where: { medicalRecordId: saved.id }, data: { historialPDF: newPath } });
      }
      await tx.appointment.update({
        where: { id: appointment.id },
        data: { medicalRecordId: saved.id, historialPDF: newPath },
      });
      return tx.medicalRecord.findUnique({ where: { id: saved.id }, select: RECORD_FIELDS });
    });

    // El PDF anterior de la ficha ya no lo usa ninguna cita
    if (existing) removeFile(existing.pdfPath);

    response.status(existing ? 200 : 201).json({
      message: existing ? "Ficha actualizada" : "Ficha creada",
      record,
      historialPDF: newPath,
      medicalRecordId: record.id,
    });
  } catch (error) {
    removeFile(newPath);
    next(error);
  }
};
