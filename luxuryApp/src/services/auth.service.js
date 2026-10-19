import api from "./api";

export const loginRequest = (credentials) =>
  api.post("/api/users/login", credentials).then((res) => res.data.data.token);

export const fetchCurrentUser = () => api.get("/api/auth/me").then((res) => res.data);

// Solo un administrador con sesión iniciada puede registrar personal
export const registerStaff = (data) => api.post("/api/users/register", data);

export const resendVerification = (email) =>
  api.post("/api/users/resend-verification", { email });

export const verifyAccount = (id, token) => api.get(`/api/users/verify/${id}/${token}`);
