import {
  Box,
  Button,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Grid,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useMemo } from "react";
import { useAppointmentHistory } from "../../hooks/useAppointmentHistory";
import { doctorName, STATUS_META } from "../../utils/appointments";
import { formatDateTime, formatDay, formatLongDay, formatTime } from "../../utils/dates";
import StatusBadge from "../ui/StatusBadge";
import AppointmentActions from "./AppointmentActions";
import { AppointmentHistory, AppointmentNotes } from "./AppointmentHistory";
import MedicalRecordActions from "./MedicalRecordActions";

const NOT_RECORDED = "No registrado";

const Detail = ({ label, children, muted = false }) => (
  <Box>
    <Text fontSize="xs" color="text.muted" textTransform="uppercase" letterSpacing="0.06em">
      {label}
    </Text>
    <Box fontWeight="500" wordBreak="break-word" color={muted ? "text.muted" : undefined}>
      {children}
    </Box>
  </Box>
);

const SectionTitle = ({ children, hint }) => (
  <Box mb={3}>
    <Text fontWeight="700" fontSize="sm">
      {children}
    </Text>
    {hint && (
      <Text fontSize="xs" color="text.muted">
        {hint}
      </Text>
    )}
  </Box>
);

// Enlace a otra cita del mismo paciente (la original o la nueva al reagendar)
const LinkedAppointment = ({ appt, onOpen }) => {
  const label = `${formatDay(appt.date)} · ${formatTime(appt.time)} (${STATUS_META[appt.status]?.label ?? appt.status})`;
  return onOpen ? (
    <Button variant="link" size="sm" onClick={() => onOpen(appt)} whiteSpace="normal" textAlign="left">
      {label}
    </Button>
  ) : (
    <Text fontSize="sm">{label}</Text>
  );
};

/**
 * Ficha completa de una cita: información, paciente, gestión, notas, historial e historia clínica.
 * canAssign = admin (gestiona la cita y ve notas e historial). doctors y appointments solo se usan en el admin
 * para comprobar disponibilidad antes de guardar.
 */
const AppointmentDrawer = ({ appointment, isOpen, onClose, onUpdated, onCreated, onOpen, onConflict, doctors, appointments, canAssign = false }) => {
  const history = useAppointmentHistory(appointment, canAssign && isOpen);
  // Última cancelación registrada (motivo y quién la hizo)
  const cancellation = useMemo(
    () => [...history.events].reverse().find((e) => e.type === "estado" && e.toStatus === "cancelada"),
    [history.events]
  );

  const handleCreated = (created) => {
    onCreated?.(created);
    onOpen?.(created);
  };

  return (
    <Drawer isOpen={isOpen && Boolean(appointment)} onClose={onClose} placement="right" size="md">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton mt={2} />
        {appointment && (
          <>
            <DrawerHeader borderBottomWidth="1px">
              <Text fontSize="xl" pr={8}>
                {appointment.firstName} {appointment.lastName}
              </Text>
              <StatusBadge status={appointment.status} mt={1} />
            </DrawerHeader>
            <DrawerBody py={6}>
              <Stack spacing={6}>
                <Box>
                  <SectionTitle>Información de la cita</SectionTitle>
                  <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap={4}>
                    <Detail label="Fecha">{formatLongDay(appointment.date)}</Detail>
                    <Detail label="Hora">{formatTime(appointment.time)}</Detail>
                    <Detail label="Estado">
                      <StatusBadge status={appointment.status} />
                    </Detail>
                    <Detail label={appointment.status === "cancelada" ? "Doctor (histórico)" : "Doctor asignado"} muted={!appointment.assignedDoctors?.length}>
                      {(appointment.assignedDoctors ?? []).map(doctorName).join(", ") || "Sin asignar"}
                    </Detail>
                    <Detail label="Motivo de la consulta" muted>
                      {NOT_RECORDED}
                    </Detail>
                    <Detail label="Solicitud creada" muted={!appointment.createdAt}>
                      {appointment.createdAt ? formatDateTime(appointment.createdAt) : NOT_RECORDED}
                    </Detail>
                    {appointment.previousAppointment && (
                      <Detail label="Reagenda la cita del">
                        <LinkedAppointment appt={appointment.previousAppointment} onOpen={onOpen} />
                      </Detail>
                    )}
                    {appointment.rebookedAs?.length > 0 && (
                      <Detail label="Nueva cita">
                        <Stack spacing={1} align="flex-start">
                          {appointment.rebookedAs.map((r) => (
                            <LinkedAppointment key={r.id} appt={r} onOpen={onOpen} />
                          ))}
                        </Stack>
                      </Detail>
                    )}
                  </Grid>
                  {Array.isArray(appointment.completedBy) && appointment.completedBy.length > 0 && (
                    <Box mt={4}>
                      <Detail label="Completada por">
                        {appointment.completedBy.map((d) => (
                          <Text key={d.name} fontSize="sm">
                            {d.name} · {d.specialty}
                          </Text>
                        ))}
                      </Detail>
                    </Box>
                  )}
                </Box>

                <Divider />
                <Box>
                  <SectionTitle>Datos del paciente</SectionTitle>
                  <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap={4}>
                    <Detail label="Nombre completo">
                      {appointment.firstName} {appointment.lastName}
                    </Detail>
                    <Detail label="Cédula">{appointment.ci || NOT_RECORDED}</Detail>
                    <Detail label="Correo">{appointment.email || NOT_RECORDED}</Detail>
                    <Detail label="Teléfono" muted>
                      {NOT_RECORDED}
                    </Detail>
                  </Grid>
                </Box>

                <Divider />
                <Box>
                  <SectionTitle>Gestión de la cita</SectionTitle>
                  <AppointmentActions
                    appointment={appointment}
                    isAdmin={canAssign}
                    doctors={doctors}
                    appointments={appointments}
                    cancellation={cancellation}
                    onUpdated={onUpdated}
                    onCreated={handleCreated}
                    onConflict={onConflict}
                  />
                </Box>

                {canAssign && (
                  <>
                    <Divider />
                    <Box>
                      <SectionTitle hint="Comentarios internos de la clínica sobre la cita.">Notas administrativas</SectionTitle>
                      <AppointmentNotes appointmentId={appointment.id} events={history.events} onAdded={history.addEvent} />
                    </Box>

                    <Divider />
                    <Box>
                      <SectionTitle hint="Lo registra el sistema con cada acción y no se puede editar.">Historial de cambios</SectionTitle>
                      <AppointmentHistory events={history.events} loading={history.loading} error={history.error} onRetry={history.reload} />
                    </Box>
                  </>
                )}

                <Divider />
                <Box>
                  <SectionTitle hint="Documento clínico del paciente, independiente de las notas administrativas.">Historia clínica</SectionTitle>
                  <MedicalRecordActions appointment={appointment} onUpdated={onUpdated} />
                </Box>
              </Stack>
            </DrawerBody>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
};

export default AppointmentDrawer;
