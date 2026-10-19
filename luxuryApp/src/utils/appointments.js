import { lastMonths, monthKey, toDayKey, todayKey, toMinutes } from "./dates";

// Filtros vacíos de la lista de citas
export const EMPTY_FILTERS = { search: "", status: "", date: "", doctor: "" };

export const STATUSES = ["pendiente", "confirmada", "completada", "cancelada"];

export const STATUS_META = {
  pendiente: { label: "Pendiente", color: "orange", hex: "#dd6b20" },
  confirmada: { label: "Confirmada", color: "blue", hex: "#3182ce" },
  completada: { label: "Completada", color: "green", hex: "#38a169" },
  cancelada: { label: "Cancelada", color: "red", hex: "#e53e3e" },
};

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

// Texto de búsqueda libre: nombre, apellido, cédula o correo
export const matchesSearch = (appt, query) => {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [appt.firstName, appt.lastName, appt.ci, appt.email]
    .filter(Boolean)
    .some((field) => String(field).toLowerCase().includes(q));
};
