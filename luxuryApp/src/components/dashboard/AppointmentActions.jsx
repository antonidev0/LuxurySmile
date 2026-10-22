import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  FormControl,
  FormLabel,
  List,
  ListIcon,
  ListItem,
  Stack,
  Text,
  Textarea,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { useState } from "react";
import { FiAlertTriangle, FiCalendar, FiCheck, FiCheckCircle, FiPlus, FiUserX, FiX } from "react-icons/fi";
import { useNotify } from "../../hooks/useNotify";
import { updateAppointmentStatus } from "../../services/appointments.service";
import { doctorConflict, doctorName, hasDayArrived, STATUS_META } from "../../utils/appointments";
import { formatDay, formatTime, todayKey, toDayKey } from "../../utils/dates";
import ConfirmDialog from "../ui/ConfirmDialog";
import DoctorAssigner from "./DoctorAssigner";
import RescheduleModal from "./RescheduleModal";

// Acciones de estado con su confirmación
const STATUS_ACTIONS = {
  confirmada: {
    label: "Confirmar cita",
    icon: FiCheck,
    color: "blue",
    title: "Confirmar la cita",
    text: "La cita quedará confirmada con el doctor asignado.",
  },
  cancelada: {
    label: "Cancelar cita",
    icon: FiX,
    color: "red",
    title: "Cancelar la cita",
    text: "La cita se conservará como cancelada, con su doctor y su historial. Si el paciente vuelve a pedirla, podrás crear una nueva cita.",
    needsReason: true,
  },
  completada: {
    label: "Marcar completada",
    icon: FiCheckCircle,
    color: "green",
    title: "Marcar como completada",
    text: "Una cita completada ya no se puede modificar desde la agenda.",
  },
  no_asistio: {
    label: "No asistió",
    icon: FiUserX,
    color: "purple",
    title: "Marcar que el paciente no asistió",
    text: "Se conservará el registro de la cita. Si el paciente lo solicita, podrás crearle una nueva cita.",
  },
};

const isPastSlot = (appt) => {
  const day = toDayKey(appt.date);
  const today = todayKey();
  if (day !== today) return day < today;
  const now = new Date();
  const [h, m] = appt.time.split(":").map(Number);
  return h * 60 + m <= now.getHours() * 60 + now.getMinutes();
};

// Comprobación de los doctores asignados para la fecha y hora de la cita
const Availability = ({ appointment, doctors, appointments }) => {
  const assigned = appointment.assignedDoctors ?? [];
  // Sin la lista de personal todavía no se puede comprobar (el servidor lo hace igualmente)
  if (!assigned.length || !doctors.length) return null;
  const rows = assigned.map((a) => {
    // La ficha del doctor (horario, estado de la cuenta) está en la lista de personal
    const full = doctors.find((d) => d.id === a.id);
    const conflict = full
      ? doctorConflict(full, { date: appointment.date, time: appointment.time, excludeId: appointment.id }, appointments)
      : "no está en el personal";
    return { doctor: a, conflict };
  });
  return (
    <List spacing={1} fontSize="sm">
      {rows.map(({ doctor, conflict }) => (
        <ListItem key={doctor.id}>
          <ListIcon as={conflict ? FiAlertTriangle : FiCheckCircle} color={conflict ? "red.500" : "green.500"} />
          {doctorName(doctor)}: {conflict ? conflict : "disponible a esa hora"}
        </ListItem>
      ))}
    </List>
  );
};

/**
 * Gestión de la cita según su estado. Cada cambio es una acción explícita con confirmación.
 * El admin gestiona todo; el doctor solo puede cerrar sus citas confirmadas (completada / no asistió).
 */
const AppointmentActions = ({ appointment, isAdmin, doctors = [], appointments = [], cancellation, onUpdated, onCreated, onConflict }) => {
  const notify = useNotify();
  const [action, setAction] = useState(null);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState(null);
  const { status } = appointment;
  const assigned = appointment.assignedDoctors ?? [];
  const due = hasDayArrived(appointment);

  const ask = (next) => {
    setReason("");
    setAction(next);
  };

  const run = async () => {
    setSaving(true);
    try {
      const updated = await updateAppointmentStatus(appointment.id, action, reason.trim() || undefined);
      onUpdated?.(updated);
      notify.success("Estado actualizado", `La cita está ahora: ${STATUS_META[action].label.toLowerCase()}`);
      setAction(null);
    } catch (err) {
      notify.error("No se pudo cambiar el estado", err);
      if (err.response?.status === 409) onConflict?.();
    } finally {
      setSaving(false);
    }
  };

  const actionButton = (to) => {
    const meta = STATUS_ACTIONS[to];
    const Icon = meta.icon;
    return (
      <Button size="sm" variant="outline" colorScheme={meta.color} leftIcon={<Icon />} onClick={() => ask(to)}>
        {meta.label}
      </Button>
    );
  };

  const closeButtons = due ? (
    <>
      <WrapItem>
        {actionButton("completada")}
      </WrapItem>
      <WrapItem>
        {actionButton("no_asistio")}
      </WrapItem>
    </>
  ) : null;

  let content;
  if (!isAdmin) {
    content =
      status === "confirmada" && due ? (
        <Wrap spacing={2}>{closeButtons}</Wrap>
      ) : (
        <Text fontSize="sm" color="text.muted">
          {status === "confirmada"
            ? "Podrás marcarla como completada o como no asistió el día de la cita."
            : "La administración gestiona las confirmaciones, los cambios y las cancelaciones."}
        </Text>
      );
  } else if (status === "pendiente" || status === "confirmada") {
    const past = isPastSlot(appointment);
    const doctorIssue = doctors.length > 0 && assigned.some((a) => {
      const full = doctors.find((d) => d.id === a.id);
      return !full || doctorConflict(full, { date: appointment.date, time: appointment.time, excludeId: appointment.id }, appointments);
    });
    content = (
      <Stack spacing={4}>
        <Box>
          <FormLabel fontSize="sm" fontWeight="600" mb={2}>
            {status === "pendiente" ? "Asignar doctor" : "Doctor asignado"}
          </FormLabel>
          <DoctorAssigner appointment={appointment} doctors={doctors} appointments={appointments} onUpdated={onUpdated} />
        </Box>
        <Availability appointment={appointment} doctors={doctors} appointments={appointments} />

        {status === "pendiente" && !assigned.length && (
          <Alert status="warning" borderRadius="xl">
            <AlertIcon />
            <AlertDescription fontSize="sm">Para confirmar la cita, primero asígnale un doctor disponible en la lista de arriba.</AlertDescription>
          </Alert>
        )}
        {status === "pendiente" && past && (
          <Alert status="warning" borderRadius="xl">
            <AlertIcon />
            <AlertDescription fontSize="sm">La fecha de esta solicitud ya pasó. Reprográmala a un horario futuro o cancélala.</AlertDescription>
          </Alert>
        )}
        {status === "pendiente" && assigned.length > 0 && !past && doctorIssue && (
          <Alert status="error" borderRadius="xl">
            <AlertIcon />
            <AlertDescription fontSize="sm">El doctor asignado no puede atender a esa hora. Cámbialo o reprograma la cita.</AlertDescription>
          </Alert>
        )}

        <Wrap spacing={2}>
          {status === "pendiente" && (
            <WrapItem>
              <Button
                size="sm"
                colorScheme="blue"
                leftIcon={<FiCheck />}
                onClick={() => ask("confirmada")}
                isDisabled={!assigned.length || past || doctorIssue}
              >
                Confirmar cita
              </Button>
            </WrapItem>
          )}
          <WrapItem>
            <Button size="sm" variant="outline" leftIcon={<FiCalendar />} onClick={() => setModal("reschedule")}>
              Reprogramar
            </Button>
          </WrapItem>
          <WrapItem>
            {actionButton("cancelada")}
          </WrapItem>
          {status === "confirmada" && closeButtons}
        </Wrap>
        {status === "confirmada" && !due && (
          <Text fontSize="xs" color="text.muted">
            Podrás marcarla como completada o como no asistió el día de la cita.
          </Text>
        )}
      </Stack>
    );
  } else if (status === "completada") {
    content = (
      <Text fontSize="sm" color="text.muted">
        La cita está completada. Se puede consultar, pero ya no se modifica desde la agenda.
      </Text>
    );
  } else {
    // Cancelada o no asistió: se conserva tal cual y se puede crear una cita nueva
    content = (
      <Stack spacing={3}>
        {status === "cancelada" ? (
          <Box p={3} borderRadius="xl" bg="red.50">
            <Text fontSize="sm">
              <b>Motivo de cancelación:</b> {cancellation?.reason || "No registrado"}
            </Text>
            {cancellation && (
              <Text fontSize="xs" color="text.muted" mt={1}>
                {cancellation.actorName}
              </Text>
            )}
            {assigned.length > 0 && (
              <Text fontSize="xs" color="text.muted" mt={1}>
                El doctor se conserva como referencia histórica.
              </Text>
            )}
          </Box>
        ) : (
          <Text fontSize="sm" color="text.muted">
            El paciente no asistió. El registro de la cita se conserva.
          </Text>
        )}
        {appointment.rebookedAs?.length > 0 && (
          <Text fontSize="sm">
            Ya se creó una nueva cita: {appointment.rebookedAs.map((r) => `${formatDay(r.date)} · ${formatTime(r.time)} (${STATUS_META[r.status]?.label})`).join(", ")}
          </Text>
        )}
        <Box>
          <Button size="sm" variant="outline" leftIcon={<FiPlus />} onClick={() => setModal("rebook")}>
            Nueva cita para el paciente
          </Button>
        </Box>
      </Stack>
    );
  }

  const meta = action ? STATUS_ACTIONS[action] : null;

  return (
    <>
      {content}

      <ConfirmDialog
        isOpen={Boolean(action)}
        onClose={() => setAction(null)}
        onConfirm={run}
        title={meta?.title}
        confirmLabel={meta?.label}
        confirmColor={meta?.color}
        isLoading={saving}
        isConfirmDisabled={meta?.needsReason && !reason.trim()}
      >
        <Stack spacing={3}>
          <Text fontSize="sm">
            {appointment.firstName} {appointment.lastName} · {formatDay(appointment.date)} · {formatTime(appointment.time)}
          </Text>
          <Text fontSize="sm" color="text.muted">
            {meta?.text}
          </Text>
          {meta?.needsReason && (
            <FormControl isRequired>
              <FormLabel fontSize="sm">Motivo de la cancelación</FormLabel>
              <Textarea value={reason} onChange={(e) => setReason(e.target.value)} maxLength={500} rows={3} placeholder="Ej.: el paciente no puede asistir" />
            </FormControl>
          )}
        </Stack>
      </ConfirmDialog>

      {isAdmin && (
        <RescheduleModal
          appointment={appointment}
          mode={modal ?? "reschedule"}
          isOpen={Boolean(modal)}
          onClose={() => setModal(null)}
          doctors={doctors}
          appointments={appointments}
          onSaved={(saved) => (modal === "rebook" ? onCreated?.(saved) : onUpdated?.(saved))}
          onConflict={onConflict}
        />
      )}
    </>
  );
};

export default AppointmentActions;
