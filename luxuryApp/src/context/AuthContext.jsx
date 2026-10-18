import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../service/api'; // Instancia Axios configurada con interceptores

// Contexto de autenticación
export const AuthContext = createContext();

/**
 * Provider de autenticación que maneja estado de usuario y token
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      setLoading(false);
      return;
    }

    setToken(storedToken);
    API.defaults.headers.common.Authorization = `Bearer ${storedToken}`;

    API.get('/api/auth/me')
      .then(response => setUser(response.data))
      .catch(() => {
        localStorage.removeItem('token');
        delete API.defaults.headers.common.Authorization;
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  /**
   * Login: obtiene JWT, lo guarda y carga datos de usuario
   */
  const login = async (credentials) => {
    try {
      const response = await API.post('/api/users/login', credentials);  
      const token = response.data.data.token;

      if (!token) throw new Error('Token no recibido del backend');

      localStorage.setItem('token', token);
      API.defaults.headers.common.Authorization = `Bearer ${token}`;
      setToken(token);

      const userRes = await API.get('/api/auth/me'); 
      setUser(userRes.data);

      return userRes.data;
      
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  };

  /**
   * Logout: limpia token y user
   */
  const logout = () => {
    localStorage.removeItem('token');
    delete API.defaults.headers.common.Authorization;
    setToken(null);
    setUser(null);
  };

  const authValue = {
    user,
    token,
    isAuthenticated: Boolean(token),
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook para acceder al contexto de autenticación
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
};

export default AuthProvider;
