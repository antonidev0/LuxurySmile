import { useCallback, useEffect, useState } from "react";
import { getErrorMessage } from "../services/api";
import { fetchAppointmentHistory } from "../services/appointments.service";

/**
 * Historial de cambios y notas de una cita (solo admin).
 * Se vuelve a pedir cuando cambia el estado, la fecha, la hora o los doctores de la cita.
 */
export const useAppointmentHistory = (appointment, enabled) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const id = appointment?.id;
  const version = appointment
    ? [appointment.status, appointment.date, appointment.time, (appointment.assignedDoctors ?? []).map((d) => d.id).join(",")].join("|")
    : "";

  const reload = useCallback(async () => {
    if (!enabled || !id) return;
    setLoading(true);
    setError(null);
    try {
      setEvents(await fetchAppointmentHistory(id));
    } catch (err) {
      setError(getErrorMessage(err, "No se pudo cargar el historial"));
    } finally {
      setLoading(false);
    }
  }, [enabled, id]);

  useEffect(() => {
    setEvents([]);
  }, [id]);

  useEffect(() => {
    reload();
  }, [reload, version]);

  const addEvent = useCallback((event) => setEvents((list) => [...list, event]), []);

  return { events, loading, error, reload, addEvent };
};
