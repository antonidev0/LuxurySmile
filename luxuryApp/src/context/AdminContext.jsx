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

      return response.data;
    } catch (err) {
      handleError(err, "subir el historial PDF");
    } finally {
      setLoading(false);
    }
  };

  // Usa API para que la petición lleve el token de sesión
  const generatePDF = async (appointmentId) => {
    try {
      const response = await API.post(`/api/pdf/generate-pdf/${appointmentId}`);
      return response.data; // Retorna para usar en el componente si hace falta
    } catch (err) {
      handleError(err, "generar el PDF");
    }
  };

  // Descarga el historial PDF (protegido) y devuelve una URL local para verlo o descargarlo
  const getAppointmentPDFUrl = async (appointmentId) => {
    try {
      const response = await API.get(`/api/admin/${appointmentId}/pdf`, { responseType: "blob" });
      return URL.createObjectURL(response.data);
    } catch (err) {
      handleError(err, "obtener el historial PDF");
    }
  };

  // Eliminar un doctor por ID (Admin)
  const deleteDoctorById = async (id) => {
    try {
      const response = await API.delete(`/api/admin/deleteDoctor/${id}`);
      setDoctors((prev) => prev.filter((doc) => doc.id !== id));
      return response.data;
    } catch (err) {
      handleError(err, "eliminar el doctor");
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
        getAppointmentPDFUrl,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => useContext(AdminContext);
