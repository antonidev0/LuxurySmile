import { useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchAppointmentsForRole } from "../services/appointments.service";
import { useAsync } from "./useAsync";

/**
 * Citas visibles para el usuario actual: todas (admin) o las asignadas (doctor).
 * replaceAppointment actualiza una cita en la lista sin volver a pedirlas todas.
 */
export const useAppointments = () => {
  const { user } = useAuth();
  const role = user?.role;
  const { data, loading, error, reload, setData } = useAsync(
    () => fetchAppointmentsForRole(role),
    [role],
    []
  );

  const replaceAppointment = useCallback(
    (updated) => setData((list) => list.map((a) => (a.id === updated.id ? { ...a, ...updated } : a))),
    [setData]
  );

  return { appointments: data ?? [], loading, error, reload, replaceAppointment, role };
};
