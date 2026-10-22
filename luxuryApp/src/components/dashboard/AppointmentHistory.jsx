import { Alert, AlertDescription, AlertIcon, Box, Button, Flex, Skeleton, Stack, Text, Textarea } from "@chakra-ui/react";
import { useState } from "react";
import { useNotify } from "../../hooks/useNotify";
import { addAppointmentNote } from "../../services/appointments.service";
import { STATUS_META } from "../../utils/appointments";
import { formatDateTime, formatDay, formatTime } from "../../utils/dates";
import StatusBadge from "../ui/StatusBadge";

const doctorsText = (list) => (Array.isArray(list) && list.length ? list.map((d) => `Dr. ${d.name}`).join(", ") : "Sin asignar");
const slotText = (date, time) => `${formatDay(date)} · ${formatTime(time)}`;

const Change = ({ label, from, to }) => (
  <Text fontSize="sm">
    <Text as="span" color="text.muted">
      {label}:{" "}
    </Text>
    {from} → {to}
  </Text>
);

// Qué cambió en cada entrada del historial
const EventBody = ({ event }) => {
  switch (event.type) {
    case "creada":
      return (
        <Stack spacing={1}>
          <Text fontSize="sm" fontWeight="600">
            {event.actorRole ? "Cita creada por la administración" : "Solicitud recibida desde la web"}
          </Text>
          {event.toDate && <Text fontSize="sm">{slotText(event.toDate, event.toTime)}</Text>}
          {Array.isArray(event.toDoctors) && event.toDoctors.length > 0 && <Text fontSize="sm">{doctorsText(event.toDoctors)}</Text>}
        </Stack>
      );
    case "estado":
      return (
        <Flex align="center" gap={2} wrap="wrap">
          <StatusBadge status={event.fromStatus} />
          <Text fontSize="sm">→</Text>
          <StatusBadge status={event.toStatus} />
        </Flex>
      );
    case "doctores":
      return <Change label="Doctor" from={doctorsText(event.fromDoctors)} to={doctorsText(event.toDoctors)} />;
    case "reprogramada":
      return (
        <Stack spacing={1}>
          <Text fontSize="sm" fontWeight="600">
            Reprogramada
          </Text>
          {(event.fromDate !== event.toDate || event.fromTime !== event.toTime) && (
            <Change label="Fecha" from={slotText(event.fromDate, event.fromTime)} to={slotText(event.toDate, event.toTime)} />
          )}
          {event.toDoctors && <Change label="Doctor" from={doctorsText(event.fromDoctors)} to={doctorsText(event.toDoctors)} />}
        </Stack>
      );
    default:
      return null;
  }
};

const reasonLabel = (event) => (event.toStatus === "cancelada" ? "Motivo de cancelación" : "Motivo");

/**
 * Historial de cambios de la cita. Lo escribe el servidor con cada acción y no se puede editar.
 */
export const AppointmentHistory = ({ events, loading, error, onRetry }) => {
  const changes = events.filter((e) => e.type !== "nota");
  if (loading && !events.length) return <Skeleton h={16} borderRadius="xl" />;
  if (error) {
    return (
      <Alert status="error" borderRadius="xl">
        <AlertIcon />
        <AlertDescription fontSize="sm" flex="1">
          {error}
        </AlertDescription>
        <Button size="xs" onClick={onRetry}>
          Reintentar
        </Button>
      </Alert>
    );
  }
  if (!changes.length) {
    return (
      <Text fontSize="sm" color="text.muted">
        No hay cambios registrados. Las citas anteriores a la activación del historial no tienen registro previo.
      </Text>
    );
  }

  return (
    <Stack spacing={0} borderLeftWidth="2px" borderColor="border.subtle" pl={4} ml={1}>
      {[...changes].reverse().map((event) => (
        <Box key={event.id} position="relative" pb={4}>
          <Box position="absolute" left="-21px" top="6px" boxSize="10px" borderRadius="full" bg={STATUS_META[event.toStatus]?.hex ?? "gray.300"} />
          <EventBody event={event} />
          {event.reason && (
            <Text fontSize="sm" mt={1}>
              <Text as="span" color="text.muted">
                {reasonLabel(event)}:{" "}
              </Text>
              {event.reason}
            </Text>
          )}
          <Text fontSize="xs" color="text.muted" mt={1}>
            {event.actorName} · {formatDateTime(event.createdAt)}
          </Text>
        </Box>
      ))}
    </Stack>
  );
};

/**
 * Notas administrativas internas (no son historia clínica). Se añaden y quedan registradas; no se editan.
 */
export const AppointmentNotes = ({ appointmentId, events, onAdded }) => {
  const notify = useNotify();
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const notes = events.filter((e) => e.type === "nota");

  const add = async () => {
    setSaving(true);
    try {
      onAdded(await addAppointmentNote(appointmentId, note.trim()));
      setNote("");
      notify.success("Nota guardada");
    } catch (err) {
      notify.error("No se pudo guardar la nota", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack spacing={3}>
      {notes.length ? (
        notes.map((n) => (
          <Box key={n.id} p={3} borderRadius="xl" bg="bg.muted">
            <Text fontSize="sm" whiteSpace="pre-wrap">
              {n.reason}
            </Text>
            <Text fontSize="xs" color="text.muted" mt={1}>
              {n.actorName} · {formatDateTime(n.createdAt)}
            </Text>
          </Box>
        ))
      ) : (
        <Text fontSize="sm" color="text.muted">
          Sin notas.
        </Text>
      )}
      <Textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        maxLength={1000}
        rows={2}
        placeholder="Ej.: el paciente llamó para avisar que llegará tarde"
        aria-label="Nueva nota administrativa"
      />
      <Flex justify="space-between" align="center" gap={3}>
        <Text fontSize="xs" color="text.muted">
          Internas de la clínica. No forman parte de la historia clínica y no se pueden editar.
        </Text>
        <Button size="sm" variant="outline" onClick={add} isLoading={saving} isDisabled={!note.trim()} flexShrink={0}>
          Añadir nota
        </Button>
      </Flex>
    </Stack>
  );
};
