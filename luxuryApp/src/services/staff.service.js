import api from "./api";

export const fetchStaff = () => api.get("/api/admin/getDoctors").then((res) => res.data);

// Activa a mano la cuenta (si no le llegó el correo de verificación)
export const verifyStaff = (id) => api.patch(`/api/admin/staff/${id}/verify`).then((res) => res.data.staff);

// Vuelve a enviar el correo de verificación (invitación)
export const resendInvitation = (email) => api.post("/api/users/resend-verification", { email }).then((res) => res.data);

export const updateStaff = (id, data) => api.patch(`/api/admin/staff/${id}`, data).then((res) => res.data.staff);

export const updateAvailability = (id, availability) =>
  api.put(`/api/admin/staff/${id}/availability`, { availability }).then((res) => res.data.staff);

// Baja: la cuenta queda desactivada, pero su historial y sus datos se conservan
export const deactivateStaff = (id) => api.patch(`/api/admin/staff/${id}/deactivate`).then((res) => res.data.staff);

export const reactivateStaff = (id) => api.patch(`/api/admin/staff/${id}/reactivate`).then((res) => res.data.staff);

export const changeStaffRole = (id, role, specialty) =>
  api.patch(`/api/admin/staff/${id}/role`, { role, specialty }).then((res) => res.data.staff);
