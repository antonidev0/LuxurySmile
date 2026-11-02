import { asyncHandler } from "../lib/asyncHandler.js";
import * as recordService from "../services/recordService.js";

export const getRecordForm = asyncHandler(async (request, response) => {
  response.status(200).json(await recordService.getRecordForm(request.params.appointmentId, request.user));
});

export const saveRecord = asyncHandler(async (request, response) => {
  const { record, created, historialPDF } = await recordService.saveRecord(
    request.params.appointmentId,
    request.body,
    request.user,
  );
  response.status(created ? 201 : 200).json({
    message: created ? "Ficha creada" : "Ficha actualizada",
    record,
    historialPDF,
    medicalRecordId: record.id,
  });
});

export const uploadAppointmentPDF = asyncHandler(async (request, response) => {
  const historialPDF = await recordService.attachUploadedPdf(request.params.id, request.file, request.user);
  response.status(200).json({ message: "PDF subido exitosamente", historialPDF, medicalRecordId: null });
});

// Datos de salud: que no queden copias en cachés intermedias ni del navegador
const sendPrivatePdf = (response, filePath) => {
  response.set("Cache-Control", "no-store");
  response.sendFile(filePath);
};

export const getAppointmentPDF = asyncHandler(async (request, response) => {
  sendPrivatePdf(response, await recordService.getPdfFile(request.params.id, request.user));
});

export const getPatientRecords = asyncHandler(async (request, response) => {
  response.status(200).json(await recordService.listPatientRecords(request.params.appointmentId, request.user));
});

export const getRecordPDF = asyncHandler(async (request, response) => {
  sendPrivatePdf(response, await recordService.getRecordPdfFile(request.params.recordId, request.user));
});
