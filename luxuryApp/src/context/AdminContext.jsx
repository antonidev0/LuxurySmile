// src/context/AdminContext.jsx
import { createContext, useContext, useState } from "react";
import API from "../service/api";

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Obtener todas las citas (solo admin)
  const getAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await API.get("/api/admin/Allappointments");

      setAppointments(response.data); // ✅ actualiza correctamente
      return response.data;
    } catch (err) {
      handleError(err, "obtener las citas");
    } finally {
      setLoading(false);
    }
  };

  // Obtener todos los doctores (solo admin)
  const getDoctors = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await API.get("/api/admin/getDoctors");
      setDoctors(response.data); // ✅ actualiza correctamente
      return response.data;
    } catch (err) {
      handleError(err, "obtener doctores");
    } finally {
      setLoading(false);
    }
  };

  // asignar un doctor a un paciente (Admin)
  const assignDoctorToAppointment = async (appointmentId, doctorId) => {
    setLoading(true);
    try {

      const response = await API.put(`/api/admin/${appointmentId}/assign-doctor`, {
        doctorId,
      });

      return response.data;
    } catch (err) {
      handleError(err, "asignar doctor");
    } finally {
      setLoading(false);
    }
  };

  // Actualizar estado de las citas (admin y doctor)
  const updateAppointmentStatus = async (id, status) => {
    const response = await API.patch(`/api/admin/${id}/updateStatus`, { status });
    await getAppointments(); // actualiza citas tras cambiar estado
    return response.data;
  };

  const uploadPDFToAppointment = async (appointmentId, file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("pdf", file);

    setLoading(true);
    setError(null);

    try {
      const response = await API.patch(
        `/api/admin/${appointmentId}/upload-pdf`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Opcional: actualizar citas locales si quieres
      await getAppointments();

      return response.data;
    } catch (err) {
      handleError(err, "subir el historial PDF");
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async (appointmentId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/pdf/generate-pdf/${appointmentId}`, {
        method: "POST",
      });
      const data = await response.json();
      return data; // Retorna para usar en el componente si hace falta
    } catch (err) {
      console.error("Error al generar PDF:", err);
      throw err;
    }
  };

  // Eliminar un doctor por ID (Admin)
  const deleteDoctorById = async (id = "") => {
    console.log("holamindo");

  }


  // Manejo centralizado de errores
  const handleError = (err, contexto = "") => {
    console.error(`Error al ${contexto}:`, err);
    const mensaje = err.response?.data?.message || `Error inesperado al ${contexto}`;
    setError(mensaje);
    throw new Error(mensaje);
  };

  return (
    <AdminContext.Provider
      value={{
        loading,
        error,
        appointments,
        doctors,
        getAppointments,
        getDoctors,
        assignDoctorToAppointment,
        updateAppointmentStatus,
        deleteDoctorById,
        uploadPDFToAppointment,
        generatePDF,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => useContext(AdminContext);
