import { fromMinutes, toMinutes } from "./dates";

const OPENING = 8 * 60; // 08:00
const LAST_START = 17 * 60; // 17:00
export const SLOT_MINUTES = 40; // separación mínima entre citas (igual que el backend)

/**
 * Horarios del día cada 40 minutos. Un horario no está disponible si queda
 * a menos de 40 minutos de una cita ocupada o, si es hoy, si ya pasó.
 */
export const buildSlots = (occupiedTimes, { isToday = false, now = new Date() } = {}) => {
  const occupied = occupiedTimes.map(toMinutes);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const slots = [];

  for (let m = OPENING; m <= LAST_START; m += SLOT_MINUTES) {
    const clash = occupied.some((o) => Math.abs(o - m) < SLOT_MINUTES);
    const past = isToday && m <= nowMinutes;
    slots.push({ time: fromMinutes(m), available: !clash && !past });
  }
  return slots;
};
