// src/context/AppointmentContext.jsx
import { createContext, useContext, useState } from "react";
import API from "../service/api";

const AppointmentContext = createContext();

export const AppointmentProvider = ({ children }) => {
  const [appointments, setAppointments] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Crear cita (vista pública)
  const createAppointment = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await API.post("/api/appointment", data);
      return response.data;
    } catch (err) {
      handleError(err, "crear la cita");
    } finally {
      setLoading(false);
    }
  };

 
  // Manejo centralizado de errores
  const handleError = (err, contexto = "") => {
    console.error(`Error al ${contexto}:`, err);
    const mensaje = err.response?.data?.message || `Error inesperado al ${contexto}`;
    setError(mensaje);
    throw new Error(mensaje);
  };

  return (
    <AppointmentContext.Provider
      value={{
        appointments,
        loading,
        error,
        createAppointment,
      }}
    >
      {children}
    </AppointmentContext.Provider>
  );
};

export const useAppointment = () => useContext(AppointmentContext);
