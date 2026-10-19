import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { tokenStorage } from "../services/api";
import { fetchCurrentUser, loginRequest } from "../services/auth.service";

const AuthContext = createContext(null);

/**
 * Guarda la sesión del personal (admin o doctor).
 * Al cargar la app, si hay un token guardado, recupera los datos del usuario.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = tokenStorage.get();
    if (!storedToken) {
      setLoading(false);
      return;
    }

    tokenStorage.set(storedToken);
    fetchCurrentUser()
      .then(setUser)
      .catch(() => tokenStorage.clear())
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (credentials) => {
    const token = await loginRequest(credentials);
    if (!token) throw new Error("Token no recibido del backend");

    tokenStorage.set(token);
    const currentUser = await fetchCurrentUser();
    setUser(currentUser);
    return currentUser;
  }, []);

  const logout = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, isAuthenticated: Boolean(user), login, logout }),
    [user, loading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
};
