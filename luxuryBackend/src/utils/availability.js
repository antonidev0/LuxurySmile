// Horario semanal de atención de los doctores.
// Se guarda por día de la semana (0 = domingo ... 6 = sábado): { "1": { start: "08:00", end: "17:00" } }
// Si un doctor no tiene horario guardado, atiende en el horario de la clínica.

const TIME_FORMAT = /^([01]\d|2[0-3]):[0-5]\d$/;
export const CLINIC_OPENING = "08:00";
export const CLINIC_CLOSING = "17:00";
// La clínica abre de lunes a sábado
export const CLINIC_DAYS = [1, 2, 3, 4, 5, 6];

const toMinutes = (time) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

// Valida el horario que envía el front y lo deja limpio. Lanza un mensaje legible si algo no cuadra.
export const parseAvailability = (input) => {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Horario inválido");
  }
  const result = {};
  for (const [day, range] of Object.entries(input)) {
    if (!range) continue;
    const weekday = Number(day);
    if (!CLINIC_DAYS.includes(weekday)) {
      throw new Error("La clínica no abre los domingos");
    }
    const { start, end } = range;
    if (!TIME_FORMAT.test(start ?? "") || !TIME_FORMAT.test(end ?? "")) {
      throw new Error("Las horas deben tener el formato HH:MM");
    }
    if (toMinutes(start) < toMinutes(CLINIC_OPENING) || toMinutes(end) > toMinutes(CLINIC_CLOSING)) {
      throw new Error("El horario debe estar entre las 8:00 a.m. y las 5:00 p.m.");
    }
    if (toMinutes(start) >= toMinutes(end)) {
      throw new Error("La hora de inicio debe ser anterior a la de fin");
    }
    result[weekday] = { start, end };
  }
  if (!Object.keys(result).length) {
    throw new Error("Marca al menos un día de atención");
  }
  return result;
};

// ¿El doctor atiende ese día ("date" a medianoche UTC) y a esa hora ("HH:MM")?
export const isAvailableAt = (availability, date, time) => {
  if (!availability) return true;
  const range = availability[new Date(date).getUTCDay()];
  if (!range) return false;
  const minutes = toMinutes(time);
  return minutes >= toMinutes(range.start) && minutes <= toMinutes(range.end);
};
