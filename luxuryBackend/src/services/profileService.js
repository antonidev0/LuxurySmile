// Lo que cada miembro del personal gestiona de su propia cuenta desde «Mi perfil» y «Disponibilidad»
import { AppError } from "../lib/AppError.js";
import { dayKey, isPast } from "../lib/appointmentRules.js";
import { isAvailableAt, parseAvailability } from "../lib/availability.js";
import { hashPassword, verifyPassword } from "../lib/password.js";
import * as appointmentRepository from "../repositories/appointmentRepository.js";
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

// Citas abiertas y aún por llegar que quedarían fuera del nuevo horario
const appointmentsOutside = async (doctorId, availability) => {
  const open = await appointmentRepository.findOpenAssignedTo(doctorId);
  return open.filter((a) => !isPast(dayKey(a.date), a.time) && !isAvailableAt(availability, a.date, a.time));
};

// El doctor cambia su horario directamente, pero no puede dejar fuera citas que ya tiene:
// esas las reprograma o reasigna la administración antes del cambio
export const updateOwnAvailability = async (doctorId, input) => {
  const availability = parseAvailability(input);
  const outside = await appointmentsOutside(doctorId, availability);
  if (outside.length) {
    const count = outside.length;
    throw new AppError(
      `Tienes ${count} ${count === 1 ? "cita" : "citas"} fuera de este horario. Pide a la administración que las reprograme antes de cambiarlo.`,
      409,
      { code: "AVAILABILITY_CONFLICT", details: { appointments: outside } },
    );
  }
  return staffRepository.update(doctorId, { availability });
};
