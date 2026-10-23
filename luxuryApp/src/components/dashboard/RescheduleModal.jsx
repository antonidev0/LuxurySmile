import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Checkbox,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Grid,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { useNotify } from "../../hooks/useNotify";
import { getErrorMessage } from "../../services/api";
import { createAdminAppointment, rebookAppointment, rescheduleAppointment } from "../../services/appointments.service";
import { assignableDoctors, doctorConflict, doctorName, fullName, occupiesSlot } from "../../utils/appointments";
import { formatLongDay, formatTime, fromDayKey, todayKey, toDayKey } from "../../utils/dates";
import { buildSlots } from "../../utils/slots";
import { appointmentSchema } from "../../validations/appointmentSchema";
import TimeSlotPicker from "../booking/TimeSlotPicker";

// Datos del paciente con las mismas reglas que el formulario de reserva
const patientSchema = appointmentSchema.pick({ firstName: true, lastName: true, ci: true, email: true });
const EMPTY_PATIENT = { firstName: "", lastName: "", ci: "", email: "" };
const PATIENT_FIELDS = [
  ["firstName", "Nombre", "Michelle"],
  ["lastName", "Apellido", "Rodríguez"],
  ["ci", "Cédula", "V12345678"],
  ["email", "Correo electrónico", "correo@gmail.com"],
];

const doctorList = (ids, doctors) =>
  ids.length ? ids.map((id) => doctors.find((d) => d.id === id)).filter(Boolean).map(doctorName).join(", ") : "Sin asignar";

const Summary = ({ label, date, time, doctors }) => (
  <Box p={3} borderRadius="xl" borderWidth="1px" borderColor="border.subtle">
    <Text fontSize="xs" color="text.muted" textTransform="uppercase" letterSpacing="0.06em">
      {label}
    </Text>
    <Text fontWeight="600">{date ? `${formatLongDay(date)} · ${formatTime(time)}` : "—"}</Text>
    <Text fontSize="sm" color="text.muted">
      {doctors}
    </Text>
  </Box>
);

/**
 * Cambia fecha, hora o doctores de una cita.
 * mode "reschedule": mueve una cita pendiente o confirmada.
 * mode "rebook": crea una cita nueva a partir de una cancelada o a la que el paciente no asistió;
 * la original no se toca y conserva su registro.
 * mode "create": registra una cita nueva desde la administración. Con patient (datos de una cita del
 * mismo paciente) se reutilizan sus datos; sin él se escriben. initialDate propone el día de partida.
 * Solo deja elegir horarios libres y doctores que pueden atender; pide confirmación antes de guardar.
 */
const RescheduleModal = ({
  appointment,
  mode = "reschedule",
  patient,
  initialDate,
  isOpen,
  onClose,
  doctors = [],
  appointments = [],
  onSaved,
  onConflict,
}) => {
  const notify = useNotify();
  const create = mode === "create";
  // Crear y reagendar generan una cita nueva; reprogramar mueve la existente
  const rebook = mode === "rebook" || create;
  const today = todayKey();
  const currentIds = useMemo(() => (appointment?.assignedDoctors ?? []).map((d) => d.id), [appointment]);
  const active = useMemo(() => assignableDoctors(doctors), [doctors]);

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [doctorIds, setDoctorIds] = useState([]);
  const [reason, setReason] = useState("");
  const [step, setStep] = useState("form");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [patientData, setPatientData] = useState(EMPTY_PATIENT);
  const [showPatientErrors, setShowPatientErrors] = useState(false);

  // Al abrir: la fecha actual (si no pasó) y los doctores actuales que siguen activos.
  // Al crear: el día de partida (si se puede reservar) y los datos del paciente, si se conocen
  useEffect(() => {
    if (!isOpen || (!appointment && !create)) return;
    const day = create ? initialDate ?? "" : toDayKey(appointment.date);
    const bookable = day >= today && (!create || fromDayKey(day).getDay() !== 0);
    setDate((!rebook || create) && day && bookable ? day : "");
    setTime("");
    setDoctorIds(create ? [] : currentIds.filter((id) => active.some((d) => d.id === id)));
    setPatientData(patient ? { firstName: patient.firstName, lastName: patient.lastName, ci: patient.ci, email: patient.email } : EMPTY_PATIENT);
    setShowPatientErrors(false);
    setReason("");
    setStep("form");
    setError("");
  }, [isOpen, appointment, create, initialDate, patient, rebook, today, currentIds, active]);

  const isSunday = date ? fromDayKey(date).getDay() === 0 : false;
  const validDate = Boolean(date) && date >= today && !isSunday;

  // Horarios del día: libres en la clínica y en los que todos los doctores elegidos pueden atender
  const slots = useMemo(() => {
    if (!validDate) return [];
    const occupied = appointments
      .filter((a) => a.id !== appointment?.id && occupiesSlot(a) && toDayKey(a.date) === date)
      .map((a) => a.time);
    const selected = active.filter((d) => doctorIds.includes(d.id));
    return buildSlots(occupied, { isToday: date === today }).map((slot) => ({
      ...slot,
      available: slot.available && selected.every((d) => !doctorConflict(d, { date, time: slot.time, excludeId: appointment?.id }, appointments)),
    }));
  }, [validDate, appointments, appointment, date, today, active, doctorIds]);

  // Si el horario elegido deja de estar libre (otro día u otro doctor), se descarta
  useEffect(() => {
    if (time && !slots.some((s) => s.time === time && s.available)) setTime("");
  }, [slots, time]);

  if (!appointment && !create) return null;

  const setPatientField = (key) => (e) =>
    setPatientData((p) => ({ ...p, [key]: key === "ci" ? e.target.value.trim().toUpperCase() : e.target.value }));
  // Si la cédula ya tiene citas, se ofrecen sus datos para no registrar al mismo paciente de dos formas
  const known =
    create && !patient && patientData.ci
      ? appointments.find((a) => String(a.ci).toUpperCase() === patientData.ci)
      : null;
  const knownDiffers =
    known && ["firstName", "lastName", "email"].some((key) => (known[key] ?? "") !== patientData[key]);
  // Los datos que se escriben siguen las reglas del formulario de reserva; los de un paciente ya registrado se reutilizan tal cual
  const patientCheck = create && !patient && (!known || knownDiffers) ? patientSchema.safeParse(patientData) : { success: true };
  const patientErrors = patientCheck.success ? {} : patientCheck.error.flatten().fieldErrors;
  const patientName = create ? fullName(patientData) : fullName(appointment);
  const patientCi = create ? patientData.ci : appointment.ci;

  const conflictFor = (doctor) => (validDate && time ? doctorConflict(doctor, { date, time, excludeId: appointment?.id }, appointments) : null);
  const toggleDoctor = (id) => setDoctorIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));

  const sameSlot = !rebook && date === toDayKey(appointment.date) && time === appointment.time;
  const sameDoctors = doctorIds.length === currentIds.length && doctorIds.every((id) => currentIds.includes(id));
  const needsDoctor = !rebook && appointment.status === "confirmada" && !doctorIds.length;
  const selectedConflict = active.filter((d) => doctorIds.includes(d.id)).some((d) => conflictFor(d));
  const canReview = validDate && time && !needsDoctor && !selectedConflict && !(sameSlot && sameDoctors);

  const review = () => {
    if (!patientCheck.success) return setShowPatientErrors(true);
    setStep("confirm");
  };

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const payload = { date, time, doctorIds, reason: reason.trim() };
      const saved = create
        ? await createAdminAppointment({ ...patientData, ...payload })
        : rebook
          ? await rebookAppointment(appointment.id, payload)
          : await rescheduleAppointment(appointment.id, payload);
      notify.success(
        rebook ? "Nueva cita creada" : "Cita reprogramada",
        `${formatLongDay(date)} · ${formatTime(time)}${rebook ? (saved.status === "confirmada" ? " (confirmada)" : " (pendiente de doctor)") : ""}`
      );
      onSaved?.(saved);
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, "No se pudo guardar el cambio"));
      setStep("form");
      // Otra persona ocupó ese horario: se recarga la agenda para verlo
      if (err.response?.status === 409) onConflict?.();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered scrollBehavior="inside" size="xl">
      <ModalOverlay />
      <ModalContent mx={4} borderRadius="2xl">
        <ModalHeader>
          {create && !patient ? "Nueva cita" : rebook ? "Nueva cita para el paciente" : "Reprogramar cita"}
          {patientName && (
            <Text fontSize="sm" fontWeight="400" color="text.muted">
              {patientName}
              {patientCi ? ` · ${patientCi}` : ""}
            </Text>
          )}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {step === "form" ? (
            <Stack spacing={5}>
              {create ? (
                patient ? (
                  <Text fontSize="sm" color="text.muted">
                    Se usarán los datos del paciente de la cita abierta ({patient.email}). Su cita actual no cambia.
                  </Text>
                ) : (
                  <Box>
                    <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap={3}>
                      {PATIENT_FIELDS.map(([key, label, placeholder]) => (
                        <FormControl key={key} isRequired isInvalid={showPatientErrors && Boolean(patientErrors[key])}>
                          <FormLabel fontSize="sm" fontWeight="600">
                            {label}
                          </FormLabel>
                          <Input
                            value={patientData[key]}
                            onChange={setPatientField(key)}
                            placeholder={placeholder}
                            type={key === "email" ? "email" : "text"}
                            bg="white"
                          />
                          {showPatientErrors && patientErrors[key] && <FormErrorMessage>{patientErrors[key][0]}</FormErrorMessage>}
                        </FormControl>
                      ))}
                    </Grid>
                    {knownDiffers && (
                      <Alert status="info" borderRadius="xl" mt={3}>
                        <AlertIcon />
                        <AlertDescription fontSize="sm" flex="1">
                          Esta cédula ya tiene citas a nombre de {fullName(known)} ({known.email}).
                        </AlertDescription>
                        <Button
                          size="xs"
                          onClick={() => setPatientData({ firstName: known.firstName, lastName: known.lastName, ci: patientData.ci, email: known.email })}
                        >
                          Usar sus datos
                        </Button>
                      </Alert>
                    )}
                  </Box>
                )
              ) : (
                <Summary
                  label={rebook ? `Cita ${appointment.status === "cancelada" ? "cancelada" : "a la que no asistió"}` : "Fecha y hora actuales"}
                  date={appointment.date}
                  time={appointment.time}
                  doctors={(appointment.assignedDoctors ?? []).map(doctorName).join(", ") || "Sin asignar"}
                />
              )}
              {rebook && !create && (
                <Text fontSize="sm" color="text.muted">
                  Se creará una cita nueva con los datos del paciente. La cita original se conserva con su estado y su historial.
                </Text>
              )}

              <FormControl isInvalid={Boolean(date) && !validDate}>
                <FormLabel fontSize="sm" fontWeight="600">
                  Nueva fecha
                </FormLabel>
                <Input type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} bg="white" />
                {date && !validDate && (
                  <FormHelperText color="red.500">{isSunday ? "La clínica no abre los domingos" : "Elige hoy o una fecha futura"}</FormHelperText>
                )}
              </FormControl>

              {validDate && (
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="600">
                    Hora disponible
                  </FormLabel>
                  <TimeSlotPicker slots={slots} value={time} onChange={setTime} />
                  <FormHelperText>Se ocultan las horas ocupadas y las que no atienden los doctores elegidos.</FormHelperText>
                </FormControl>
              )}

              <FormControl>
                <FormLabel fontSize="sm" fontWeight="600">
                  Doctor{rebook ? " (opcional)" : ""}
                </FormLabel>
                {active.length ? (
                  <Stack spacing={2}>
                    {active.map((doc) => {
                      const conflict = conflictFor(doc);
                      const checked = doctorIds.includes(doc.id);
                      return (
                        <Checkbox key={doc.id} isChecked={checked} isDisabled={Boolean(conflict) && !checked} onChange={() => toggleDoctor(doc.id)}>
                          <Text as="span" fontSize="sm">
                            {doctorName(doc)} · {doc.specialty}
                          </Text>
                          {conflict && (
                            <Text as="span" fontSize="xs" color={checked ? "red.500" : "text.muted"}>
                              {" "}
                              ({conflict})
                            </Text>
                          )}
                        </Checkbox>
                      );
                    })}
                  </Stack>
                ) : (
                  <Text fontSize="sm" color="text.muted">
                    No hay doctores activos.
                  </Text>
                )}
                {needsDoctor && <FormHelperText color="orange.600">Una cita confirmada necesita al menos un doctor.</FormHelperText>}
                {rebook && !doctorIds.length && (
                  <FormHelperText>Sin doctor, la nueva cita quedará pendiente hasta que se le asigne uno.</FormHelperText>
                )}
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" fontWeight="600">
                  {create ? "Nota para el historial (opcional)" : "Motivo del cambio (opcional)"}
                </FormLabel>
                <Textarea value={reason} onChange={(e) => setReason(e.target.value)} maxLength={500} rows={2} placeholder="Ej.: el paciente pidió otro día" />
              </FormControl>

              {error && (
                <Alert status="error" borderRadius="xl">
                  <AlertIcon />
                  <AlertDescription fontSize="sm">{error}</AlertDescription>
                </Alert>
              )}
            </Stack>
          ) : (
            <Stack spacing={4}>
              <Text fontSize="sm">{rebook ? "Revisa la nueva cita antes de crearla:" : "Revisa el cambio antes de guardarlo:"}</Text>
              <Grid templateColumns={{ base: "1fr", sm: create ? "1fr" : "1fr 1fr" }} gap={3}>
                {!create && (
                  <Summary
                    label={rebook ? "Cita original" : "Antes"}
                    date={appointment.date}
                    time={appointment.time}
                    doctors={(appointment.assignedDoctors ?? []).map(doctorName).join(", ") || "Sin asignar"}
                  />
                )}
                <Summary label={rebook ? "Nueva cita" : "Después"} date={date} time={time} doctors={doctorList(doctorIds, active)} />
              </Grid>
              {create && (
                <Text fontSize="sm">
                  <b>Paciente:</b> {patientName} · {patientData.ci} · {patientData.email}
                </Text>
              )}
              {reason.trim() && (
                <Text fontSize="sm">
                  <b>{create ? "Nota:" : "Motivo:"}</b> {reason.trim()}
                </Text>
              )}
              <Text fontSize="xs" color="text.muted">
                El cambio quedará registrado en el historial de la cita.
              </Text>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter gap={3}>
          {step === "form" ? (
            <>
              <Button variant="ghost" onClick={onClose}>
                Cancelar
              </Button>
              <Button onClick={review} isDisabled={!canReview}>
                Revisar
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setStep("form")} isDisabled={saving}>
                Volver
              </Button>
              <Button onClick={save} isLoading={saving}>
                {rebook ? "Crear cita" : "Guardar cambio"}
              </Button>
            </>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default RescheduleModal;
