import { Button, HStack, Select, Stack, Tag, TagCloseButton, TagLabel, Text, Wrap, WrapItem } from "@chakra-ui/react";
import { useState } from "react";
import { useNotify } from "../../hooks/useNotify";
import { assignDoctor, unassignDoctor } from "../../services/appointments.service";
import { assignableDoctors, doctorConflict, doctorName, isActive } from "../../utils/appointments";

/**
 * Asigna, cambia o quita doctores de una cita pendiente o confirmada (solo admin).
 * Solo ofrece doctores con la cuenta activa y marca los que no pueden atender a esa hora.
 * appointments (opcional) es la agenda cargada, para avisar de solapamientos antes de guardar;
 * el servidor lo vuelve a comprobar siempre.
 */
const DoctorAssigner = ({ appointment, doctors, onUpdated, appointments }) => {
  const notify = useNotify();
  const [saving, setSaving] = useState(false);
  // Doctor que se está sustituyendo con «Cambiar»
  const [replacing, setReplacing] = useState(null);
  const assigned = appointment.assignedDoctors ?? [];
  const candidates = assignableDoctors(doctors).filter((d) => !assigned.some((a) => a.id === d.id));
  const editable = isActive(appointment);
  // Una cita confirmada siempre necesita un doctor: se cambia, no se quita
  const canRemove = appointment.status !== "confirmada" || assigned.length > 1;

  const save = async (fn, okMessage, errorMessage) => {
    setSaving(true);
    try {
      onUpdated?.(await fn());
      notify.success(okMessage);
      setReplacing(null);
    } catch (err) {
      notify.error(errorMessage, err);
    } finally {
      setSaving(false);
    }
  };

  const handleSelect = (doctorId) => {
    if (!doctorId) return;
    if (replacing) {
      save(() => assignDoctor(appointment.id, doctorId, replacing.id), "Doctor cambiado", "No se pudo cambiar el doctor");
    } else {
      save(() => assignDoctor(appointment.id, doctorId), "Doctor asignado", "No se pudo asignar al doctor");
    }
  };

  return (
    <Stack spacing={3}>
      {assigned.length ? (
        <Wrap>
          {assigned.map((doc) => (
            <WrapItem key={doc.id}>
              <Tag size="md" borderRadius="full" colorScheme={replacing?.id === doc.id ? "orange" : "brand"} variant="subtle">
                <TagLabel>{doctorName(doc)}</TagLabel>
                {editable && canRemove && (
                  <TagCloseButton
                    aria-label={`Quitar a ${doctorName(doc)}`}
                    isDisabled={saving}
                    onClick={() => save(() => unassignDoctor(appointment.id, doc.id), "Doctor retirado", "No se pudo retirar al doctor")}
                  />
                )}
              </Tag>
              {editable && candidates.length > 0 && replacing?.id !== doc.id && (
                <Button size="xs" variant="link" ml={2} onClick={() => setReplacing(doc)} isDisabled={saving}>
                  Cambiar
                </Button>
              )}
            </WrapItem>
          ))}
        </Wrap>
      ) : (
        <Text fontSize="sm" color="orange.600">
          Sin doctor asignado
        </Text>
      )}
      {editable && candidates.length > 0 && (
        <Stack spacing={1}>
          {replacing && (
            <HStack justify="space-between">
              <Text fontSize="xs" color="text.muted">
                Elige quién sustituye a {doctorName(replacing)}
              </Text>
              <Button size="xs" variant="ghost" onClick={() => setReplacing(null)}>
                No cambiar
              </Button>
            </HStack>
          )}
          <Select
            size="sm"
            borderRadius="lg"
            placeholder={replacing ? "Sustituir por…" : "Asignar doctor…"}
            value=""
            isDisabled={saving}
            onChange={(e) => handleSelect(e.target.value)}
          >
            {candidates.map((doc) => {
              // Solo se puede asignar a quien atiende ese día, a esa hora y no tiene otra cita encima
              const conflict = doctorConflict(doc, { date: appointment.date, time: appointment.time, excludeId: appointment.id }, appointments);
              return (
                <option key={doc.id} value={doc.id} disabled={Boolean(conflict)}>
                  {doctorName(doc)} · {doc.specialty}
                  {conflict ? ` (${conflict})` : ""}
                </option>
              );
            })}
          </Select>
        </Stack>
      )}
      {editable && !candidates.length && !assigned.length && (
        <Text fontSize="xs" color="text.muted">
          No hay doctores activos. Activa o registra uno en Personal.
        </Text>
      )}
    </Stack>
  );
};

export default DoctorAssigner;
