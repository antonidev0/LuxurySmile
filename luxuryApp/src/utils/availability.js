import { fromDayKey, toDayKey, toMinutes } from "./dates";

// Horario semanal de los doctores (igual que el backend): { "1": { start: "08:00", end: "17:00" } }
// 0 = domingo. Sin horario guardado, el doctor atiende en el horario de la clínica.
export const CLINIC_HOURS = { start: "08:00", end: "17:00" };

// La clínica abre de lunes a sábado
export const WEEKDAYS = [
  { day: 1, label: "Lunes" },
  { day: 2, label: "Martes" },
  { day: 3, label: "Miércoles" },
  { day: 4, label: "Jueves" },
  { day: 5, label: "Viernes" },
  { day: 6, label: "Sábado" },
];

export const clinicAvailability = () => Object.fromEntries(WEEKDAYS.map(({ day }) => [day, { ...CLINIC_HOURS }]));

export const isAvailableAt = (availability, date, time) => {
  if (!availability) return true;
  const range = availability[fromDayKey(toDayKey(date)).getDay()];
  if (!range) return false;
  const minutes = toMinutes(time);
  return minutes >= toMinutes(range.start) && minutes <= toMinutes(range.end);
};
