// Acciones de la agenda desde el panel de administración (algunas también para doctores)
import { asyncHandler } from "../lib/asyncHandler.js";
import * as appointmentService from "../services/appointmentService.js";

export const getAllAppointments = asyncHandler(async (request, response) => {
  response.status(200).json(await appointmentService.listForAdmin());
});

export const assignDoctorToAppointment = asyncHandler(async (request, response) => {
  const appointment = await appointmentService.assignDoctor(request.params.id, request.body, request.user);
  const message = request.body.replaceDoctorId ? "Doctor cambiado exitosamente" : "Doctor asignado exitosamente";
  response.status(200).json({ message, appointment });
});

export const unassignDoctorFromAppointment = asyncHandler(async (request, response) => {
  const { id, doctorId } = request.params;
  const appointment = await appointmentService.unassignDoctor(id, doctorId, request.user);
  response.status(200).json({ message: "Doctor retirado de la cita", appointment });
});

export const updateAppointment = asyncHandler(async (request, response) => {
  response.status(200).json(await appointmentService.changeStatus(request.params.id, request.body, request.user));
});

export const rescheduleAppointment = asyncHandler(async (request, response) => {
  const appointment = await appointmentService.reschedule(request.params.id, request.body, request.user);
  response.status(200).json({ message: "Cita reprogramada", appointment });
});

export const rebookAppointment = asyncHandler(async (request, response) => {
  const appointment = await appointmentService.rebook(request.params.id, request.body, request.user);
  response.status(201).json({ message: "Nueva cita creada", appointment });
});

export const createAdminAppointment = asyncHandler(async (request, response) => {
  const appointment = await appointmentService.createForAdmin(request.body, request.user);
  response.status(201).json({ message: "Cita creada", appointment });
});

export const getAppointmentHistory = asyncHandler(async (request, response) => {
  response.status(200).json(await appointmentService.getHistory(request.params.id));
});

export const addAppointmentNote = asyncHandler(async (request, response) => {
  response.status(201).json(await appointmentService.addNote(request.params.id, request.body.note, request.user));
});
