import { isAvailableAt } from "./availability";
import { accountStatus } from "./staff";
import { SLOT_MINUTES } from "./slots";
import { lastMonths, monthKey, toDayKey, todayKey, toMinutes } from "./dates";

// Filtros vacíos de la lista de citas. dateMode: "day" (un día) o "range" (desde / hasta)
export const EMPTY_FILTERS = { search: "", status: "", doctor: "", dateMode: "day", date: "", dateFrom: "", dateTo: "" };

export const STATUSES = ["pendiente", "confirmada", "completada", "cancelada", "no_asistio"];

export const STATUS_META = {
  pendiente: { label: "Pendiente", color: "orange", hex: "#dd6b20" },
  confirmada: { label: "Confirmada", color: "blue", hex: "#3182ce" },
  completada: { label: "Completada", color: "green", hex: "#38a169" },
  cancelada: { label: "Cancelada", color: "red", hex: "#e53e3e" },
  no_asistio: { label: "No asistió", color: "purple", hex: "#805ad5" },
};

// Las citas canceladas o a las que el paciente no asistió no ocupan horario (igual que el backend)
export const occupiesSlot = (appt) => appt.status !== "cancelada" && appt.status !== "no_asistio";

export const fullName = (person) => [person?.firstName ?? person?.name, person?.lastName].filter(Boolean).join(" ");

export const doctorName = (doctor) => `Dr. ${doctor.name} ${doctor.lastName}`;

// Ordena por fecha y hora
export const sortByDateTime = (list) =>
  [...list].sort((a, b) =>
    toDayKey(a.date) === toDayKey(b.date)
      ? toMinutes(a.time) - toMinutes(b.time)
      : toDayKey(a.date).localeCompare(toDayKey(b.date))
  );

export const isActive = (appt) => appt.status === "pendiente" || appt.status === "confirmada";

// "1 cita", "2 citas"
export const plural = (count, singular, pluralForm = `${singular}s`) => `${count} ${count === 1 ? singular : pluralForm}`;

// Citas de una lista contadas una sola vez (por id): las vigentes (todas salvo las canceladas) y las canceladas aparte
export const dayCounts = (appointments) => {
  const unique = [...new Map(appointments.map((a) => [a.id, a])).values()];
  const cancelled = unique.filter((a) => a.status === "cancelada").length;
  return { active: unique.length - cancelled, cancelled, total: unique.length };
};

// Texto de los contadores: "2 citas · 1 cancelada", "1 cancelada", "Sin citas"
export const dayCountsText = ({ active, cancelled }) =>
  [active && plural(active, "cita"), cancelled && plural(cancelled, "cancelada")].filter(Boolean).join(" · ") || "Sin citas";

export const appointmentsOn = (appointments, dayKey) =>
  sortByDateTime(appointments.filter((a) => toDayKey(a.date) === dayKey));

export const upcomingAppointments = (appointments, limit = 6) => {
  const today = todayKey();
  return sortByDateTime(appointments.filter((a) => isActive(a) && toDayKey(a.date) >= today)).slice(0, limit);
};

export const countByStatus = (appointments) =>
  STATUSES.reduce((acc, status) => {
    acc[status] = appointments.filter((a) => a.status === status).length;
    return acc;
  }, {});

// Serie mensual de los últimos meses, separando completadas del resto
export const monthlySeries = (appointments, months = 6) =>
  lastMonths(months).map((key) => {
    const inMonth = appointments.filter((a) => monthKey(toDayKey(a.date)) === key);
    return {
      key,
      total: inMonth.length,
      completadas: inMonth.filter((a) => a.status === "completada").length,
      canceladas: inMonth.filter((a) => a.status === "cancelada").length,
    };
  });

// Agrupa las citas por paciente usando la cédula
export const groupPatients = (appointments) => {
  const today = todayKey();
  const map = new Map();

  sortByDateTime(appointments).forEach((appt) => {
    const key = String(appt.ci).toUpperCase();
    const patient = map.get(key) ?? {
      ci: appt.ci,
      firstName: appt.firstName,
      lastName: appt.lastName,
      email: appt.email,
      appointments: [],
    };
    patient.appointments.push(appt);
    map.set(key, patient);
  });

  return [...map.values()].map((patient) => {
    const past = patient.appointments.filter((a) => toDayKey(a.date) < today || a.status === "completada");
    const next = patient.appointments.find((a) => isActive(a) && toDayKey(a.date) >= today);
    return {
      ...patient,
      visits: patient.appointments.filter((a) => a.status === "completada").length,
      lastVisit: past.at(-1) ?? null,
      nextVisit: next ?? null,
      hasRecord: patient.appointments.some((a) => a.historialPDF),
    };
  });
};

// ¿Ya llegó el día de la cita? (para marcarla como completada o no asistió)
export const hasDayArrived = (appt) => toDayKey(appt.date) <= todayKey();

export const hasDateFilter = (filters) =>
  filters.dateMode === "range" ? Boolean(filters.dateFrom || filters.dateTo) : Boolean(filters.date);

// Búsqueda, estado, doctor y fechas combinados
export const applyFilters = (appointments, filters) =>
  appointments.filter((a) => {
    const day = toDayKey(a.date);
    if (filters.status && a.status !== filters.status) return false;
    if (filters.dateMode === "range") {
      if (filters.dateFrom && day < filters.dateFrom) return false;
      if (filters.dateTo && day > filters.dateTo) return false;
    } else if (filters.date && day !== filters.date) return false;
    if (filters.doctor === "none" && a.assignedDoctors?.length) return false;
    if (filters.doctor && filters.doctor !== "none" && !a.assignedDoctors?.some((d) => d.id === filters.doctor)) return false;
    return matchesSearch(a, filters.search);
  });

// Orden por prioridad: primero las solicitudes pendientes y luego las confirmadas (las más próximas antes);
// al final las ya cerradas, de la más reciente a la más antigua
const PRIORITY = { pendiente: 0, confirmada: 1 };
const dateTimeKey = (a) => `${toDayKey(a.date)} ${a.time}`;

export const sortAppointments = (list, order = "priority") =>
  [...list].sort((a, b) => {
    if (order === "asc") return dateTimeKey(a).localeCompare(dateTimeKey(b));
    if (order === "desc") return dateTimeKey(b).localeCompare(dateTimeKey(a));
    const ra = PRIORITY[a.status] ?? 2;
    const rb = PRIORITY[b.status] ?? 2;
    if (ra !== rb) return ra - rb;
    return ra === 2 ? dateTimeKey(b).localeCompare(dateTimeKey(a)) : dateTimeKey(a).localeCompare(dateTimeKey(b));
  });

// Contadores de la cabecera. Cada cita se cuenta una sola vez por tarjeta (se agrupan por id)
export const summaryCounts = (appointments) => {
  const today = todayKey();
  const unique = [...new Map(appointments.map((a) => [a.id, a])).values()];
  return {
    pendiente: unique.filter((a) => a.status === "pendiente").length,
    confirmada: unique.filter((a) => a.status === "confirmada").length,
    // Programadas hoy: todas las del día salvo las canceladas
    today: unique.filter((a) => toDayKey(a.date) === today && a.status !== "cancelada").length,
    cancelada: unique.filter((a) => a.status === "cancelada").length,
  };
};

// Doctores que se pueden asignar: cuenta activa (verificada y sin baja)
export const assignableDoctors = (doctors) => doctors.filter((d) => accountStatus(d) === "active");

/**
 * ¿Puede el doctor atender esa cita? Devuelve null si puede, o el motivo si no.
 * appointments es la lista que ya tiene cargada el admin; el servidor vuelve a comprobarlo al guardar.
 */
export const doctorConflict = (doctor, { date, time, excludeId }, appointments = []) => {
  if (accountStatus(doctor) === "inactive") return "dado de baja";
  if (accountStatus(doctor) === "pending") return "cuenta sin activar";
  if (!isAvailableAt(doctor.availability, date, time)) return "no atiende a esa hora";
  const day = toDayKey(date);
  const clash = appointments.find(
    (a) =>
      a.id !== excludeId &&
      occupiesSlot(a) &&
      toDayKey(a.date) === day &&
      Math.abs(toMinutes(a.time) - toMinutes(time)) < SLOT_MINUTES &&
      a.assignedDoctors?.some((d) => d.id === doctor.id)
  );
  return clash ? `tiene otra cita a las ${clash.time}` : null;
};

// Texto de búsqueda libre: nombre, apellido, cédula o correo
export const matchesSearch = (appt, query) => {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [appt.firstName, appt.lastName, appt.ci, appt.email]
    .filter(Boolean)
    .some((field) => String(field).toLowerCase().includes(q));
};
