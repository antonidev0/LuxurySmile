import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Heading,
  HStack,
  Icon,
  Input,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { FiCalendar, FiCheckCircle, FiClock, FiMail, FiMapPin, FiPhone } from "react-icons/fi";
import TimeSlotPicker from "../../components/booking/TimeSlotPicker";
import { CLINIC } from "../../constants/clinic";
import { useNotify } from "../../hooks/useNotify";
import { createAppointment, fetchOccupiedTimes } from "../../services/appointments.service";
import { formatLongDay, formatTime, todayKey } from "../../utils/dates";
import { buildSlots } from "../../utils/slots";
import { appointmentSchema } from "../../validations/appointmentSchema";

const MotionBox = motion(Box);

const Field = ({ label, error, helper, children }) => (
  <FormControl isInvalid={Boolean(error)}>
    <FormLabel fontSize="sm" fontWeight="600">
      {label}
    </FormLabel>
    {children}
    {error ? <FormErrorMessage>{error.message}</FormErrorMessage> : helper && <FormHelperText>{helper}</FormHelperText>}
  </FormControl>
);

const InfoLine = ({ icon, title, children }) => (
  <HStack align="flex-start" spacing={4}>
    <Flex boxSize={10} borderRadius="xl" bg="whiteAlpha.100" color="gold.300" align="center" justify="center" flexShrink={0}>
      <Icon as={icon} />
    </Flex>
    <Box>
      <Text fontWeight="600" color="white" fontSize="sm">
        {title}
      </Text>
      <Text color="whiteAlpha.800" fontSize="sm">
        {children}
      </Text>
    </Box>
  </HStack>
);

const SuccessCard = ({ appointment, onReset }) => (
  <MotionBox initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} textAlign="center" py={{ base: 6, md: 10 }}>
    <Icon as={FiCheckCircle} boxSize={14} color="green.500" mb={4} />
    <Heading fontSize="3xl" mb={3}>
      ¡Solicitud enviada!
    </Heading>
    <Text color="text.muted" maxW="md" mx="auto" mb={6}>
      Registramos tu cita para el <b>{formatLongDay(appointment.date)}</b> a las <b>{formatTime(appointment.time)}</b>. La
      clínica te contactará en <b>{appointment.email}</b> para confirmarla.
    </Text>
    <Button onClick={onReset} variant="outline">
      Agendar otra cita
    </Button>
  </MotionBox>
);

const BookAppointmentPage = () => {
  const notify = useNotify();
  const [occupied, setOccupied] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booked, setBooked] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(appointmentSchema), mode: "onTouched" });

  const date = watch("date");
  const time = watch("time");
  const dateField = register("date");
  register("time");

  const slots = useMemo(
    () => (date ? buildSlots(occupied, { isToday: date === todayKey() }) : []),
    [date, occupied]
  );

  const onDateChange = async (event) => {
    dateField.onChange(event);
    setValue("time", "", { shouldValidate: false });
    const value = event.target.value;
    if (!value) return setOccupied([]);

    setLoadingSlots(true);
    try {
      setOccupied(await fetchOccupiedTimes(value));
    } catch (err) {
      notify.error("No pudimos cargar los horarios", err);
    } finally {
      setLoadingSlots(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      await createAppointment(data);
      setBooked(data);
      reset();
      setOccupied([]);
    } catch (err) {
      notify.error("No se pudo registrar la cita", err);
      // Si alguien tomó el horario mientras tanto, refrescamos la disponibilidad
      if (err.response?.status === 409) setOccupied(await fetchOccupiedTimes(data.date).catch(() => occupied));
    }
  };

  return (
    <Box pt={{ base: 24, md: 32 }} pb={{ base: 16, md: 24 }} bgGradient="linear(to-b, ivory, #f3ede2)">
      <Container maxW="6xl" px={{ base: 4, md: 8 }}>
        <Box textAlign="center" mb={{ base: 8, md: 12 }}>
          <Text textTransform="uppercase" letterSpacing="0.2em" fontSize="xs" fontWeight="700" color="gold.500" mb={3}>
            Agenda en línea
          </Text>
          <Heading as="h1" fontSize={{ base: "4xl", md: "5xl" }}>
            Reserva tu cita
          </Heading>
          <Text color="text.muted" mt={3}>
            Elige el día y la hora que prefieras. Te confirmaremos por correo.
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, lg: 5 }} spacing={{ base: 6, lg: 8 }} alignItems="start">
          <Box gridColumn={{ lg: "span 2" }} bg="brand.900" borderRadius="3xl" p={{ base: 6, md: 8 }} color="white" order={{ base: 2, lg: 1 }}>
            <Heading as="h2" fontSize="2xl" color="white" mb={6}>
              Información útil
            </Heading>
            <Stack spacing={5}>
              <InfoLine icon={FiClock} title="Horario">
                {CLINIC.hours.map((h) => `${h.days}: ${h.time}`).join(" · ")}
              </InfoLine>
              <InfoLine icon={FiCalendar} title="Duración">
                Cada consulta dura unos 40 minutos.
              </InfoLine>
              <InfoLine icon={FiMapPin} title="Dirección">
                {CLINIC.address}
              </InfoLine>
              <InfoLine icon={FiPhone} title="Teléfono">
                {CLINIC.phone}
              </InfoLine>
              <InfoLine icon={FiMail} title="Correo">
                {CLINIC.email}
              </InfoLine>
            </Stack>
          </Box>

          <Box gridColumn={{ lg: "span 3" }} bg="white" borderRadius="3xl" boxShadow="lift" p={{ base: 5, md: 8 }} order={{ base: 1, lg: 2 }}>
            {booked ? (
              <SuccessCard appointment={booked} onReset={() => setBooked(null)} />
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <Stack spacing={8}>
                  <Box>
                    <Text fontWeight="700" mb={4} color="brand.800">
                      1. Tus datos
                    </Text>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <Field label="Nombre" error={errors.firstName}>
                        <Input autoComplete="given-name" placeholder="Michelle" {...register("firstName")} />
                      </Field>
                      <Field label="Apellido" error={errors.lastName}>
                        <Input autoComplete="family-name" placeholder="Rodríguez" {...register("lastName")} />
                      </Field>
                      <Field label="Cédula" error={errors.ci} helper="V o E seguido del número. Ej: V12345678">
                        <Input placeholder="V12345678" {...register("ci", { setValueAs: (v) => v.trim().toUpperCase() })} />
                      </Field>
                      <Field label="Correo electrónico" error={errors.email}>
                        <Input type="email" autoComplete="email" placeholder="tucorreo@gmail.com" {...register("email")} />
                      </Field>
                    </SimpleGrid>
                  </Box>

                  <Box>
                    <Text fontWeight="700" mb={4} color="brand.800">
                      2. Fecha y hora
                    </Text>
                    <Stack spacing={4}>
                      <Field label="Fecha" error={errors.date} helper="De lunes a sábado.">
                        <Input type="date" min={todayKey()} {...dateField} onChange={onDateChange} maxW={{ md: "260px" }} />
                      </Field>
                      <FormControl isInvalid={Boolean(errors.time)}>
                        <FormLabel fontSize="sm" fontWeight="600">
                          Hora
                        </FormLabel>
                        {date ? (
                          <TimeSlotPicker
                            slots={slots}
                            value={time}
                            loading={loadingSlots}
                            onChange={(value) => setValue("time", value, { shouldValidate: true })}
                          />
                        ) : (
                          <Text fontSize="sm" color="text.muted">
                            Primero elige una fecha para ver los horarios libres.
                          </Text>
                        )}
                        <FormErrorMessage>{errors.time?.message}</FormErrorMessage>
                      </FormControl>
                    </Stack>
                  </Box>

                  {Object.keys(errors).length > 0 && (
                    <Alert status="warning" borderRadius="lg" fontSize="sm">
                      <AlertIcon />
                      Revisa los campos marcados antes de continuar.
                    </Alert>
                  )}

                  <Button type="submit" size="lg" isLoading={isSubmitting} loadingText="Enviando">
                    Solicitar cita
                  </Button>
                </Stack>
              </form>
            )}
          </Box>
        </SimpleGrid>
      </Container>
    </Box>
  );
};

export default BookAppointmentPage;
