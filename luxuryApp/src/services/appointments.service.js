import api from "./api";

// Solo el personal con sesión gestiona y crea citas: la web pública no tiene reserva.
// El admin ve todas las citas; el doctor solo las que tiene asignadas
export const fetchAppointmentsForRole = (role) =>
  api
    .get(role === "admin" ? "/api/admin/Allappointments" : "/api/doctor/appointments")
    .then((res) => res.data);

// Confirmar, cancelar (con motivo), completar o marcar que el paciente no asistió
export const updateAppointmentStatus = (id, status, reason) =>
  api.patch(`/api/admin/${id}/updateStatus`, { status, reason }).then((res) => res.data);

// Con replaceDoctorId se cambia un doctor por otro en un solo paso
export const assignDoctor = (appointmentId, doctorId, replaceDoctorId) =>
  api.put(`/api/admin/${appointmentId}/assign-doctor`, { doctorId, replaceDoctorId }).then((res) => res.data.appointment);

export const unassignDoctor = (appointmentId, doctorId) =>
  api.delete(`/api/admin/${appointmentId}/assign-doctor/${doctorId}`).then((res) => res.data.appointment);

// Nueva fecha, hora y doctores de una cita pendiente o confirmada
export const rescheduleAppointment = (id, { date, time, doctorIds, reason }) =>
  api.patch(`/api/admin/${id}/reschedule`, { date, time, doctorIds, reason }).then((res) => res.data.appointment);

// Nueva cita a partir de una cancelada o de una a la que el paciente no asistió (la original se conserva)
export const rebookAppointment = (id, { date, time, doctorIds, reason }) =>
  api.post(`/api/admin/${id}/rebook`, { date, time, doctorIds, reason }).then((res) => res.data.appointment);

// Historial de cambios y notas administrativas (solo admin)
export const fetchAppointmentHistory = (id) => api.get(`/api/admin/${id}/history`).then((res) => res.data);

export const addAppointmentNote = (id, note) => api.post(`/api/admin/${id}/notes`, { note }).then((res) => res.data);

// Nueva cita registrada por la administración (paciente nuevo o ya conocido por su cédula)
export const createAdminAppointment = ({ firstName, lastName, ci, email, date, time, doctorIds, reason }) =>
  api.post("/api/admin/appointments", { firstName, lastName, ci, email, date, time, doctorIds, reason }).then((res) => res.data.appointment);

// Nueva cita en la agenda del doctor con sesión: el servidor la asigna siempre a ese doctor
export const createDoctorAppointment = ({ firstName, lastName, ci, email, date, time, reason }) =>
  api.post("/api/doctor/appointments", { firstName, lastName, ci, email, date, time, reason }).then((res) => res.data.appointment);

// Horas ocupadas de la clínica un día (sin datos de pacientes), para que el doctor vea los horarios libres
export const fetchOccupiedTimes = (date) =>
  api.get("/api/doctor/occupied", { params: { date } }).then((res) => res.data.occupiedTimes || []);
