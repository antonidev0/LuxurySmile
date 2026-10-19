import api from "./api";

export const fetchStaff = () => api.get("/api/admin/getDoctors").then((res) => res.data);

export const deleteDoctor = (id) => api.delete(`/api/admin/deleteDoctor/${id}`).then((res) => res.data);
