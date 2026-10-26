import { asyncHandler } from "../lib/asyncHandler.js";
import * as staffService from "../services/staffService.js";

export const getAllStaff = asyncHandler(async (request, response) => {
  response.status(200).json(await staffService.listStaff());
});

export const verifyStaffById = asyncHandler(async (request, response) => {
  const staff = await staffService.verifyStaff(request.params.id);
  response.status(200).json({ message: "Cuenta activada", staff });
});

export const updateStaff = asyncHandler(async (request, response) => {
  const staff = await staffService.updateStaff(request.params.id, request.body);
  response.status(200).json({ message: "Datos actualizados", staff });
});

export const updateAvailability = asyncHandler(async (request, response) => {
  const staff = await staffService.updateAvailability(request.params.id, request.body.availability);
  response.status(200).json({ message: "Disponibilidad actualizada", staff });
});

export const deactivateStaff = asyncHandler(async (request, response) => {
  const staff = await staffService.deactivateStaff(request.params.id, request.user.id);
  response.status(200).json({ message: "Cuenta desactivada", staff });
});

export const reactivateStaff = asyncHandler(async (request, response) => {
  const staff = await staffService.reactivateStaff(request.params.id);
  response.status(200).json({ message: "Cuenta reactivada", staff });
});

export const changeStaffRole = asyncHandler(async (request, response) => {
  const { staff, changed } = await staffService.changeRole(request.params.id, request.body, request.user.id);
  response.status(200).json({ message: changed ? "Rol actualizado" : "Sin cambios", staff });
});
