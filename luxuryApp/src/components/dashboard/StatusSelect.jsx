import { Select } from "@chakra-ui/react";
import { useState } from "react";
import { useNotify } from "../../hooks/useNotify";
import { updateAppointmentStatus } from "../../services/appointments.service";
import { STATUS_META, STATUSES } from "../../utils/appointments";

// Cambia el estado de una cita. Una cita completada ya no puede cambiar.
const StatusSelect = ({ appointment, onUpdated, size = "sm", ...props }) => {
  const notify = useNotify();
  const [saving, setSaving] = useState(false);

  const handleChange = async (event) => {
    const status = event.target.value;
    if (status === "completada" && !window.confirm("Una cita completada ya no se puede modificar. ¿Continuar?")) return;
    setSaving(true);
    try {
      const updated = await updateAppointmentStatus(appointment.id, status);
      onUpdated?.(updated);
      notify.success("Estado actualizado", `${STATUS_META[status].label}`);
    } catch (err) {
      notify.error("No se pudo cambiar el estado", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Select
      size={size}
      value={appointment.status}
      onChange={handleChange}
      isDisabled={saving || appointment.status === "completada"}
      borderRadius="lg"
      bg="white"
      aria-label="Estado de la cita"
      {...props}
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {STATUS_META[s].label}
        </option>
      ))}
    </Select>
  );
};

export default StatusSelect;
