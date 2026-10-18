import API from "./api";

export const signup = (data) => API.post("/auth/signup", data);

// Aca tambien agragaremos el login  logout
