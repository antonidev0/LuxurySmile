import { asyncHandler } from "../lib/asyncHandler.js";
import * as profileService from "../services/profileService.js";

export const updateMyProfile = asyncHandler(async (request, response) => {
  const user = await profileService.updateOwnProfile(request.user.id, request.body);
  response.status(200).json({ message: "Perfil actualizado", user });
});

export const changeMyPassword = asyncHandler(async (request, response) => {
  await profileService.changeOwnPassword(request.user.id, request.body);
  response.status(200).json({ message: "Contraseña actualizada" });
});
