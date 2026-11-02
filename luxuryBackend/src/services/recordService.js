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

// Un doctor ve todas las fichas de sus pacientes (continuidad clínica), pero solo edita las que creó él.
// La administración puede editar cualquiera.
const canEditRecord = (record, user) => user.role === "admin" || record.createdById === user.id;

// El id de quien la creó no sale del backend: el front solo necesita saber si puede editarla
const withPermissions = (record, user) => {
  if (!record) return null;
  const { createdById, ...rest } = record;
  return { ...rest, canEdit: canEditRecord({ createdById }, user) };
};

// La ficha que ya usa la cita, la última del paciente y los datos de la cita para empezar una nueva
export const getRecordForm = async (appointmentId, user) => {
  const appointment = await loadAccessible(appointmentId, user);
  const [current, latest] = await Promise.all([
    appointment.medicalRecordId ? medicalRecordRepository.findById(appointment.medicalRecordId) : null,
    medicalRecordRepository.findLatestForPatient(patientKey(appointment.ci)),
  ]);
  return {
    current: withPermissions(current, user),
    latest: withPermissions(latest, user),
    defaults: {
      fecha: appointment.date.toISOString().slice(0, 10),
      nombre: `${appointment.firstName} ${appointment.lastName}`.trim(),
      ci: appointment.ci,
    },
  };
};

const loadEditableRecord = async (recordId, ci, user) => {
  if (!recordId) return null;
  const record = await medicalRecordRepository.findOwnership(recordId);
  if (!record || record.patientCi !== ci) throw new AppError("La ficha no pertenece a este paciente", 400);
  if (!canEditRecord(record, user)) {
    throw new AppError("Solo puedes editar las fichas que creaste. Crea una ficha nueva para esta consulta.", 403);
  }
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
  const existing = await loadEditableRecord(recordId, ci, user);
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
    return { record: withPermissions(record, user), created: !existing, historialPDF: pdfPath };
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

// Un doctor solo consulta la historia de pacientes con los que tiene o tuvo alguna cita
const assertTreatsPatient = async (patientCi, user) => {
  if (user.role !== "doctor") return;
  const cis = await appointmentRepository.findPatientCisAssignedTo(user.id);
  if (!cis.some((ci) => patientKey(ci) === patientCi)) throw new AppError("No tienes acceso a este paciente", 403);
};

// Historia clínica completa del paciente de una cita: todas sus fichas, las escriba quien las escriba
export const listPatientRecords = async (appointmentId, user) => {
  const appointment = await loadAccessible(appointmentId, user);
  const records = await medicalRecordRepository.findAllForPatient(patientKey(appointment.ci));
  return records.map((record) => withPermissions(record, user));
};

// PDF de una ficha concreta del historial del paciente
export const getRecordPdfFile = async (recordId, user) => {
  const record = await medicalRecordRepository.findOwnership(recordId);
  if (!record) throw new AppError("Ficha no encontrada", 404);
  await assertTreatsPatient(record.patientCi, user);
  if (!pdfExists(record.pdfPath)) throw new AppError("Archivo no encontrado", 404);
  return resolvePdf(record.pdfPath);
};
