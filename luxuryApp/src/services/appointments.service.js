import api from "./api";

// --- Público ---
export const createAppointment = (data) => api.post("/api/appointment", data).then((res) => res.data);

export const fetchOccupiedTimes = (date) =>
  api.get("/api/appointment/occupied", { params: { date } }).then((res) => res.data.occupiedTimes || []);

// --- Personal ---
// El admin ve todas las citas; el doctor solo las que tiene asignadas
export const fetchAppointmentsForRole = (role) =>
  api
    .get(role === "admin" ? "/api/admin/Allappointments" : "/api/doctor/appointments")
    .then((res) => res.data);

export const updateAppointmentStatus = (id, status) =>
  api.patch(`/api/admin/${id}/updateStatus`, { status }).then((res) => res.data);

export const assignDoctor = (appointmentId, doctorId) =>
  api.put(`/api/admin/${appointmentId}/assign-doctor`, { doctorId }).then((res) => res.data.appointment);

export const unassignDoctor = (appointmentId, doctorId) =>
  api.delete(`/api/admin/${appointmentId}/assign-doctor/${doctorId}`).then((res) => res.data.appointment);
