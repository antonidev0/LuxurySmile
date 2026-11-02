// Lo que cada miembro del personal gestiona de su propia cuenta desde «Mi perfil»
import { AppError } from "../lib/AppError.js";
import { hashPassword, verifyPassword } from "../lib/password.js";
import * as staffRepository from "../repositories/staffRepository.js";
import { assertUniqueStaffFields } from "./authService.js";

export const updateOwnProfile = async (userId, { numberPhone, address }) => {
  await assertUniqueStaffFields({ numberPhone }, userId);
  return staffRepository.update(userId, { numberPhone, address });
};

export const changeOwnPassword = async (userId, { currentPassword, newPassword }) => {
  const staff = await staffRepository.findPasswordHashById(userId);
  if (!staff || !(await verifyPassword(currentPassword, staff.passwordHash))) {
    throw new AppError("La contraseña actual no es correcta", 400, { field: "currentPassword" });
  }
  await staffRepository.update(userId, { passwordHash: await hashPassword(newPassword) });
};
