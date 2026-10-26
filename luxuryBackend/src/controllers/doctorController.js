// Agenda del doctor con sesión iniciada
import { asyncHandler } from "../lib/asyncHandler.js";
import * as appointmentService from "../services/appointmentService.js";

export const getMyAppointments = asyncHandler(async (request, response) => {
  response.status(200).json(await appointmentService.listForDoctor(request.user.id));
});

export const createDoctorAppointment = asyncHandler(async (request, response) => {
  const appointment = await appointmentService.createForDoctor(request.body, request.user);
  response.status(201).json({ message: "Cita creada", appointment });
});

export const getOccupiedTimes = asyncHandler(async (request, response) => {
  response.status(200).json({ occupiedTimes: await appointmentService.occupiedTimes(request.query.date) });
});
