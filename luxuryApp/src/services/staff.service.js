import api from "./api";

export const fetchStaff = () => api.get("/api/admin/getDoctors").then((res) => res.data);

export const deleteDoctor = (id) => api.delete(`/api/admin/deleteDoctor/${id}`).then((res) => res.data);

// Activa a mano la cuenta (si no le llegó el correo de verificación)
export const verifyStaff = (id) => api.patch(`/api/admin/staff/${id}/verify`).then((res) => res.data.staff);
