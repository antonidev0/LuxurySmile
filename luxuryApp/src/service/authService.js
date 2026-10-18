import API from "./api";

// Solo un administrador con sesión iniciada puede registrar personal
export const registerStaff = (data) => API.post("/api/users/register", data);

export const resendVerification = (email) => API.post("/api/users/resend-verification", { email });

export const verifyAccount = (id, token) => API.get(`/api/users/verify/${id}/${token}`);
