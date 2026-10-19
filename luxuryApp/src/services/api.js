import axios from "axios";

const TOKEN_KEY = "token";

const api = axios.create({
  // Si falta VITE_BACKEND_URL en el .env, usamos el backend local por defecto
  baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:3003",
  headers: { Accept: "application/json" },
});

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => {
    localStorage.setItem(TOKEN_KEY, token);
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    delete api.defaults.headers.common.Authorization;
  },
};

// Si el token expiró o es inválido, cerramos la sesión local.
// Solo redirigimos al login si el usuario estaba en una zona privada,
// para no sacar a un visitante de las páginas públicas.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      tokenStorage.clear();
      const path = window.location.pathname;
      if (path.startsWith("/admin") || path.startsWith("/doctor")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Mensaje legible para mostrar en la interfaz
export const getErrorMessage = (error, fallback = "Ocurrió un error inesperado") =>
  error?.response?.data?.message || error?.message || fallback;

export default api;
