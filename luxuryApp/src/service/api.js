import axios from 'axios';

const API = axios.create({
  // Si falta VITE_BACKEND_URL en el .env, usamos el backend local por defecto
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3003',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Si el token expiró o es inválido, cerramos la sesión local.
// Solo redirigimos al login si el usuario estaba en una zona privada,
// para no sacar a un visitante de las páginas públicas.
API.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      delete API.defaults.headers.common.Authorization;

      const path = window.location.pathname;
      if (path.startsWith('/admin') || path.startsWith('/doctor')) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default API;
