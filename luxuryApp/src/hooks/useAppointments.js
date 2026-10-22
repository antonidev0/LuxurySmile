import { useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchAppointmentsForRole } from "../services/appointments.service";
import { useAsync } from "./useAsync";

/**
 * Citas visibles para el usuario actual: todas (admin) o las asignadas (doctor).
 * replaceAppointment actualiza una cita en la lista sin volver a pedirlas todas;
 * addAppointment añade una cita nueva (p. ej. al reagendar una cancelada).
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

  const addAppointment = useCallback(
    (created) =>
      setData((list) =>
        list
          // La cita original pasa a enlazar con la nueva
          .map((a) => (a.id === created.previousAppointmentId ? { ...a, rebookedAs: [...(a.rebookedAs ?? []), created] } : a))
          .concat(created)
      ),
    [setData]
  );

  // Vuelve a pedir las citas sin mostrar la pantalla de carga (p. ej. tras un conflicto de horario)
  const refresh = useCallback(
    () => fetchAppointmentsForRole(role).then(setData).catch(() => {}),
    [role, setData]
  );

  return { appointments: data ?? [], loading, error, reload, refresh, replaceAppointment, addAppointment, role };
};
