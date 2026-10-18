import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true, // necesario para enviar cookies como el refreshToken
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Interceptor para manejar tokens expirados automáticamente
API.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // Si el error fue por token expirado y no hemos reintentado aún
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Intenta renovar el token
        await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        // Reintenta la petición original
        return API(originalRequest);
      } catch (refreshError) {
        // Si la renovación falla, redirige al login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default API;
