// Historia clínica de las citas: la ficha oficial de la clínica y su PDF, o un PDF subido a mano
import { AppError } from "../lib/AppError.js";
import { renderFichaPDF, sanitizeFicha } from "../lib/ficha.js";
import { pdfExists, removePdf, resolvePdf, savePdf, storedPathOf } from "../lib/pdfStorage.js";
import * as appointmentRepository from "../repositories/appointmentRepository.js";
import * as medicalRecordRepository from "../repositories/medicalRecordRepository.js";
import { inTransaction } from "../repositories/transaction.js";
import { actorOf, isAssigned } from "./scheduleChecks.js";

// Las fichas de un paciente se agrupan por cédula, sin distinguir mayúsculas ni espacios
export const patientKey = (ci) =>
  String(ci ?? "")
    .toUpperCase()
    .replace(/\s+/g, "");

// Un doctor solo trabaja con la historia clínica de sus citas asignadas
const loadAccessible = async (appointmentId, user) => {
  const appointment = await appointmentRepository.findWithDoctors(appointmentId);
  if (!appointment) throw new AppError("Cita no encontrada", 404);
  if (user.role === "doctor" && !isAssigned(appointment, user.id)) {
    throw new AppError("No tienes asignada esta cita", 403);
  }
  return appointment;
};

// La ficha que ya usa la cita, la última del paciente y los datos de la cita para empezar una nueva
export const getRecordForm = async (appointmentId, user) => {
  const appointment = await loadAccessible(appointmentId, user);
  const [current, latest] = await Promise.all([
    appointment.medicalRecordId ? medicalRecordRepository.findById(appointment.medicalRecordId) : null,
    medicalRecordRepository.findLatestForPatient(patientKey(appointment.ci)),
  ]);
  return {
    current,
    latest,
    defaults: {
      fecha: appointment.date.toISOString().slice(0, 10),
      nombre: `${appointment.firstName} ${appointment.lastName}`.trim(),
      ci: appointment.ci,
    },
  };
};

const loadPatientRecord = async (recordId, ci) => {
  if (!recordId) return null;
  const record = await medicalRecordRepository.findOwnership(recordId);
  if (!record || record.patientCi !== ci) throw new AppError("La ficha no pertenece a este paciente", 400);
  return record;
};

const persistRecord = (tx, { existing, appointment, ci, data, pdfPath, actor }) => {
  if (existing) {
    const changes = { data, pdfPath, updatedById: actor.actorId, updatedByName: actor.actorName };
    return medicalRecordRepository.update(existing.id, changes, tx);
  }
  return medicalRecordRepository.create(
    {
      patientCi: ci,
      appointmentId: appointment.id,
      data,
      pdfPath,
      createdById: actor.actorId,
      createdByName: actor.actorName,
    },
    tx,
  );
};

// Con recordId se actualiza esa ficha del paciente (p. ej. la de su última historia);
// sin él se crea una ficha nueva aparte. La cita queda enlazada a la ficha guardada.
export const saveRecord = async (appointmentId, { recordId, data: input }, user) => {
  const appointment = await loadAccessible(appointmentId, user);
  const data = sanitizeFicha(input);
  const ci = patientKey(appointment.ci);
  const existing = await loadPatientRecord(recordId, ci);
  const actor = await actorOf(user);

  // Cada versión del PDF tiene su propio nombre para que nadie vea una copia anterior en caché
  const pdfPath = await savePdf(await renderFichaPDF(data), "ficha");
  try {
    const record = await inTransaction(async (tx) => {
      const saved = await persistRecord(tx, { existing, appointment, ci, data, pdfPath, actor });
      // Las citas que ya usaban esta ficha pasan a ver el PDF nuevo
      if (existing) {
        await appointmentRepository.updateMany({ medicalRecordId: saved.id }, { historialPDF: pdfPath }, tx);
      }
      await appointmentRepository.update(appointment.id, { medicalRecordId: saved.id, historialPDF: pdfPath }, tx);
      return medicalRecordRepository.findById(saved.id, tx);
    });
    // El PDF anterior de la ficha ya no lo usa ninguna cita
    if (existing) await removePdf(existing.pdfPath);
    return { record, created: !existing, historialPDF: pdfPath };
  } catch (error) {
    await removePdf(pdfPath);
    throw error;
  }
};

// El PDF subido sustituye a la ficha generada: la cita deja de usarla
export const attachUploadedPdf = async (appointmentId, file, user) => {
  if (!file) throw new AppError("Debes adjuntar un archivo PDF", 400);
  const historialPDF = storedPathOf(file.filename);
  try {
    await loadAccessible(appointmentId, user);
    await appointmentRepository.update(appointmentId, { historialPDF, medicalRecordId: null });
    return historialPDF;
  } catch (error) {
    await removePdf(historialPDF);
    throw error;
  }
};

// Ruta en disco del historial de la cita, tras comprobar que el usuario puede verlo
export const getPdfFile = async (appointmentId, user) => {
  const appointment = await loadAccessible(appointmentId, user);
  if (!appointment.historialPDF) throw new AppError("Historial no encontrado", 404);
  if (!pdfExists(appointment.historialPDF)) throw new AppError("Archivo no encontrado", 404);
  return resolvePdf(appointment.historialPDF);
};
