import { z } from "zod";
import { STATUSES } from "../lib/appointmentRules.js";
import { doctorIds, email, id, optionalId, optionalText, requiredText, slotFields } from "./common.js";

export const updateStatusBody = z.object({
  status: z.enum(STATUSES, "Estado de cita inválido"),
  reason: optionalText(500),
});

export const assignDoctorBody = z.object({
  doctorId: id,
  replaceDoctorId: optionalId,
});

export const unassignDoctorParams = z.object({ id, doctorId: id });

export const rescheduleBody = z.object({
  ...slotFields,
  // Sin doctorIds se conservan los doctores actuales
  doctorIds: doctorIds.optional(),
  reason: optionalText(500),
});

export const rebookBody = z.object({
  ...slotFields,
  doctorIds: doctorIds.default([]),
  reason: optionalText(500),
});

export const createAppointmentBody = z.object({
  firstName: requiredText("El nombre del paciente", 100),
  lastName: requiredText("El apellido del paciente", 100),
  ci: requiredText("La cédula del paciente", 30).toUpperCase(),
  email,
  ...slotFields,
  doctorIds: doctorIds.default([]),
  reason: optionalText(500),
});

export const noteBody = z.object({
  note: requiredText("La nota", 1000),
});

export const occupiedQuery = z.object({
  date: z.string("Fecha requerida (YYYY-MM-DD)").regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha requerida (YYYY-MM-DD)"),
});
