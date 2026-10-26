// Gestión del personal (solo administradores): editar datos, horario, rol y acceso.
// El personal no se borra: se da de baja para conservar su historial, sus citas y las fichas que hizo.
import { AppError } from "../lib/AppError.js";
import { parseAvailability } from "../lib/availability.js";
import * as appointmentRepository from "../repositories/appointmentRepository.js";
import * as staffRepository from "../repositories/staffRepository.js";
import { assertUniqueStaffFields } from "./authService.js";

const findOrFail = async (id, message = "Personal no encontrado") => {
  const staff = await staffRepository.findById(id);
  if (!staff) throw new AppError(message, 404);
  return staff;
};

const assertAnotherAdminRemains = async () => {
  if ((await staffRepository.countActiveAdmins()) <= 1) {
    throw new AppError("Debe quedar al menos un administrador activo", 400);
  }
};

// Un doctor con citas abiertas las dejaría sin atender
const assertNoOpenAppointments = async (doctorId, message) => {
  const open = await appointmentRepository.findOpenAssignedTo(doctorId);
  if (open.length) throw new AppError(message(open.length), 409, { details: { appointments: open } });
};

export const listStaff = () => staffRepository.findAll();

// Activar a mano una cuenta, por ejemplo si no le llegó el correo de verificación
export const verifyStaff = async (id) => {
  await findOrFail(id);
  return staffRepository.update(id, { verified: true });
};

export const updateStaff = async (id, { name, lastName, email, numberPhone, specialty }) => {
  const staff = await findOrFail(id);
  if (staff.role === "doctor" && !specialty) {
    throw new AppError("La especialidad es obligatoria", 400, { field: "specialty" });
  }
  await assertUniqueStaffFields({ email, numberPhone }, staff.id);

  // A los administradores no se les muestra especialidad; se conserva su cargo
  const data = { name, lastName, email, numberPhone, ...(staff.role === "doctor" ? { specialty } : {}) };
  return staffRepository.update(id, data);
};

export const updateAvailability = async (id, availability) => {
  const staff = await findOrFail(id, "Doctor no encontrado");
  if (staff.role !== "doctor") throw new AppError("Doctor no encontrado", 404);
  return staffRepository.update(id, { availability: parseAvailability(availability) });
};

export const deactivateStaff = async (id, actorId) => {
  const staff = await findOrFail(id);
  if (staff.deactivatedAt) throw new AppError("La cuenta ya está desactivada", 400);
  if (staff.id === actorId) throw new AppError("No puedes desactivar tu propia cuenta", 400);
  if (staff.role === "admin") await assertAnotherAdminRemains();
  if (staff.role === "doctor") {
    await assertNoOpenAppointments(
      staff.id,
      (count) =>
        `Tiene ${count} ${count === 1 ? "cita abierta" : "citas abiertas"}. Reasígnalas antes de darlo de baja.`,
    );
  }
  return staffRepository.update(id, { deactivatedAt: new Date() });
};

export const reactivateStaff = async (id) => {
  await findOrFail(id);
  return staffRepository.update(id, { deactivatedAt: null });
};

// Devuelve { staff, changed } para que el controller distinga "sin cambios"
export const changeRole = async (id, { role, specialty }, actorId) => {
  const staff = await findOrFail(id);
  if (role === staff.role) return { staff, changed: false };
  if (staff.id === actorId) throw new AppError("No puedes cambiar tu propio rol", 400);

  if (role === "doctor") {
    if (!staff.deactivatedAt) await assertAnotherAdminRemains();
    if (!specialty) throw new AppError("La especialidad es obligatoria", 400, { field: "specialty" });
    return { staff: await staffRepository.update(id, { role, specialty }), changed: true };
  }

  await assertNoOpenAppointments(
    staff.id,
    () => "Tiene citas abiertas asignadas. Reasígnalas antes de cambiar su rol.",
  );
  return { staff: await staffRepository.update(id, { role, specialty: "Administración" }), changed: true };
};
