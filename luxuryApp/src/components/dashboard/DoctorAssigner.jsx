import { Select, Stack, Tag, TagCloseButton, TagLabel, Text, Wrap, WrapItem } from "@chakra-ui/react";
import { useState } from "react";
import { useNotify } from "../../hooks/useNotify";
import { assignDoctor, unassignDoctor } from "../../services/appointments.service";
import { doctorName } from "../../utils/appointments";
import { isAvailableAt } from "../../utils/availability";

// Asigna o quita doctores de una cita (solo admin)
const DoctorAssigner = ({ appointment, doctors, onUpdated }) => {
  const notify = useNotify();
  const [saving, setSaving] = useState(false);
  const assigned = appointment.assignedDoctors ?? [];
  // Los doctores dados de baja ya no reciben citas
  const available = doctors.filter((d) => !d.deactivatedAt && !assigned.some((a) => a.id === d.id));
  const locked = appointment.status === "completada";

  const save = async (fn, okMessage, errorMessage) => {
    setSaving(true);
    try {
      onUpdated?.(await fn());
      notify.success(okMessage);
    } catch (err) {
      notify.error(errorMessage, err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack spacing={3}>
      {assigned.length ? (
        <Wrap>
          {assigned.map((doc) => (
            <WrapItem key={doc.id}>
              <Tag size="md" borderRadius="full" colorScheme="brand" variant="subtle">
                <TagLabel>{doctorName(doc)}</TagLabel>
                {!locked && (
                  <TagCloseButton
                    aria-label={`Quitar a ${doctorName(doc)}`}
                    isDisabled={saving}
                    onClick={() => save(() => unassignDoctor(appointment.id, doc.id), "Doctor retirado", "No se pudo retirar al doctor")}
                  />
                )}
              </Tag>
            </WrapItem>
          ))}
        </Wrap>
      ) : (
        <Text fontSize="sm" color="orange.600">
          Sin doctor asignado
        </Text>
      )}
      {!locked && available.length > 0 && (
        <Select
          size="sm"
          borderRadius="lg"
          placeholder="Asignar doctor…"
          value=""
          isDisabled={saving}
          onChange={(e) => e.target.value && save(() => assignDoctor(appointment.id, e.target.value), "Doctor asignado", "No se pudo asignar al doctor")}
        >
          {available.map((doc) => {
            // Solo se puede asignar a quien atiende ese día y a esa hora
            const free = isAvailableAt(doc.availability, appointment.date, appointment.time);
            return (
              <option key={doc.id} value={doc.id} disabled={!free}>
                {doctorName(doc)} · {doc.specialty}
                {free ? "" : " (no atiende a esa hora)"}
              </option>
            );
          })}
        </Select>
      )}
    </Stack>
  );
};

export default DoctorAssigner;
