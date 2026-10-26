import { z } from "zod";
import { email, personName, phone } from "./common.js";

// Si es obligatoria depende del rol actual del miembro del personal, así que eso lo decide el service
const specialty = z.string().trim().max(100, "La especialidad admite como máximo 100 caracteres").default("");

export const updateStaffBody = z.object({
  name: personName("El nombre"),
  lastName: personName("El apellido"),
  email,
  numberPhone: phone,
  specialty,
});

// Las reglas del horario (días de apertura, horas de la clínica) las aplica parseAvailability
export const availabilityBody = z.object({
  availability: z.record(z.string(), z.unknown(), "Horario inválido"),
});

export const changeRoleBody = z.object({
  role: z.enum(["doctor", "admin"], "Rol inválido"),
  specialty,
});
