import { useCallback, useState } from "react";

// Guarda qué cita está abierta en la ficha; se busca en la lista para verla siempre actualizada
export const useSelectedAppointment = (appointments) => {
  const [selectedId, setSelectedId] = useState(null);
  const selected = appointments.find((a) => a.id === selectedId) ?? null;
  const open = useCallback((appt) => setSelectedId(appt.id), []);
  const close = useCallback(() => setSelectedId(null), []);
  return { selected, open, close, isOpen: Boolean(selected) };
};
