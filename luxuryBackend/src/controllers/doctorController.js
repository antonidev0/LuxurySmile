// Agenda del doctor con sesión iniciada
import { asyncHandler } from "../lib/asyncHandler.js";
import * as appointmentService from "../services/appointmentService.js";

export const getMyAppointments = asyncHandler(async (request, response) => {
  response.status(200).json(await appointmentService.listForDoctor(request.user.id));
});
