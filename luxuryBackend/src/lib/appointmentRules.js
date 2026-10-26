// Reglas de la agenda: estados, transiciones permitidas, horario y fechas en la zona de la clínica
import { CLINIC_TIMEZONE } from "../config.js";
import { AppError } from "./AppError.js";
import { CLINIC_CLOSING, CLINIC_DAYS, CLINIC_OPENING, TIME_FORMAT, toMinutes } from "./availability.js";

export { TIME_FORMAT, toMinutes };

export const STATUSES = ["pendiente", "confirmada", "completada", "cancelada", "no_asistio"];

export const STATUS_LABELS = {
  pendiente: "pendiente",
  confirmada: "confirmada",
  completada: "completada",
  cancelada: "cancelada",
  no_asistio: "marcada como no asistió",
};

// Citas que siguen abiertas y se pueden gestionar desde la agenda
export const OPEN_STATUSES = ["pendiente", "confirmada"];

// Las citas canceladas o a las que el paciente no asistió no ocupan horario
export const FREE_STATUSES = ["cancelada", "no_asistio"];

// Cambios de estado permitidos con las acciones ordinarias de la agenda.
// Completada, cancelada y no asistió son estados finales: para volver a atender
// al paciente se crea una cita nueva y la anterior se conserva tal cual.
// Una pendiente cuyo día ya llegó también se puede cerrar directamente, por si nadie la confirmó a tiempo.
export const TRANSITIONS = {
  pendiente: ["confirmada", "cancelada", "completada", "no_asistio"],
  confirmada: ["cancelada", "completada", "no_asistio"],
  completada: [],
  cancelada: [],
  no_asistio: [],
};

// Solo se pueden marcar cuando ya llegó el día de la cita
export const NEEDS_DAY_REACHED = ["completada", "no_asistio"];

// Lo único que un doctor puede hacer con sus citas; el resto lo gestiona la administración
export const DOCTOR_STATUSES = ["completada", "no_asistio"];

// Separación mínima entre citas de la clínica
export const SLOT_MINUTES = 40;

export const DATE_FORMAT = /^\d{4}-\d{2}-\d{2}$/;

// La columna "date" solo guarda el día: "YYYY-MM-DD" <-> medianoche UTC
export const toDay = (key) => new Date(`${key}T00:00:00.000Z`);
export const dayKey = (date) => new Date(date).toISOString().slice(0, 10);

// Día ("YYYY-MM-DD") y minuto actuales en la clínica
export const clinicNow = (now = new Date()) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: CLINIC_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type) => parts.find((p) => p.type === type).value;
  return {
    day: `${get("year")}-${get("month")}-${get("day")}`,
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
  };
};

export const isPast = (day, time) => {
  const now = clinicNow();
  return day < now.day || (day === now.day && toMinutes(time) <= now.minutes);
};

export const hasDayArrived = (date) => dayKey(date) <= clinicNow().day;

// Valida una fecha y hora nuevas para la agenda. Devuelve { day, date, time } o lanza un error legible.
export const parseSlot = (rawDate, rawTime) => {
  const day = typeof rawDate === "string" ? rawDate.slice(0, 10) : "";
  const time = typeof rawTime === "string" ? rawTime : "";
  if (!DATE_FORMAT.test(day) || isNaN(toDay(day).getTime())) throw new AppError("Fecha inválida", 400);
  if (!TIME_FORMAT.test(time)) throw new AppError("Hora inválida", 400);
  if (!CLINIC_DAYS.includes(toDay(day).getUTCDay())) throw new AppError("La clínica no abre los domingos", 400);
  const minutes = toMinutes(time);
  if (minutes < toMinutes(CLINIC_OPENING) || minutes > toMinutes(CLINIC_CLOSING)) {
    throw new AppError("Horario laboral: 8:00 a.m. a 5:00 p.m.", 400);
  }
  if (isPast(day, time)) throw new AppError("Esa fecha y hora ya pasaron. Elige un horario futuro.", 400);
  return { day, date: toDay(day), time };
};

// Mensaje para un cambio de estado que no se permite
export const transitionError = (from, to) => {
  if (from === "completada") return "Una cita completada no se puede modificar";
  if (from === "cancelada")
    return "La cita está cancelada. Para volver a atender al paciente, crea una nueva cita desde la ficha.";
  if (from === "no_asistio")
    return "El paciente no asistió a esta cita. Si lo solicita, crea una nueva cita desde la ficha.";
  if (to === "pendiente") return "Una cita confirmada no puede volver a pendiente";
  if (from === "pendiente") return "Primero confirma la cita";
  return "Cambio de estado no permitido";
};
