// Las fechas de las citas llegan como "2025-07-29T00:00:00.000Z" (solo importa el día).
// Trabajamos con claves "YYYY-MM-DD" para no desplazar el día por la zona horaria.

const pad = (n) => String(n).padStart(2, "0");

export const toDayKey = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value.slice(0, 10);
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
};

export const todayKey = () => toDayKey(new Date());

// Convierte "YYYY-MM-DD" en una fecha local
export const fromDayKey = (key) => {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const addDays = (key, days) => {
  const date = fromDayKey(key);
  date.setDate(date.getDate() + days);
  return toDayKey(date);
};

// Días de la semana del calendario, de lunes a domingo: [abreviatura, nombre]
export const WEEKDAY_NAMES = [
  ["Lun", "Lunes"],
  ["Mar", "Martes"],
  ["Mié", "Miércoles"],
  ["Jue", "Jueves"],
  ["Vie", "Viernes"],
  ["Sáb", "Sábado"],
  ["Dom", "Domingo"],
];

export const monthKey = (key) => key.slice(0, 7);

// Lunes de la semana del día (las semanas del calendario van de lunes a domingo)
export const startOfWeek = (key) => addDays(key, -((fromDayKey(key).getDay() + 6) % 7));

// Mismo día (o el último que exista) N meses antes o después
export const addMonths = (key, months) => {
  const date = fromDayKey(key);
  const target = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(date.getDate(), lastDay));
  return toDayKey(target);
};

const LOCALE = "es-VE";

export const formatDay = (key, options = { day: "numeric", month: "short", year: "numeric" }) =>
  key ? fromDayKey(toDayKey(key)).toLocaleDateString(LOCALE, options) : "";

const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);

export const formatLongDay = (key) => capitalize(formatDay(key, { weekday: "long", day: "numeric", month: "long" }));

export const formatMonth = (key, options = { month: "short" }) =>
  fromDayKey(`${key.slice(0, 7)}-01`).toLocaleDateString(LOCALE, options);

// "14:30" -> "2:30 p. m."
export const formatTime = (time) => {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(h, m, 0, 0);
  return date.toLocaleTimeString(LOCALE, { hour: "numeric", minute: "2-digit" });
};

// Fecha y hora de un instante (p. ej. cuándo se hizo un cambio): "21 oct 2026, 3:15 p. m."
export const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString(LOCALE, { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" })
    : "";

export const toMinutes = (time) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

export const fromMinutes = (minutes) => `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;

// Últimos N meses como "YYYY-MM", del más antiguo al actual
export const lastMonths = (count) => {
  const now = new Date();
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (count - 1 - i), 1);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
  });
};

export const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Buenos días";
  if (hour < 19) return "Buenas tardes";
  return "Buenas noches";
};
