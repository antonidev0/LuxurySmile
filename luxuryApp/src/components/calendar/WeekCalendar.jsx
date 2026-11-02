import { Box, Grid, Stack, Text } from "@chakra-ui/react";
import { appointmentsOn, fullName, STATUS_META } from "../../utils/appointments";
import { addDays, formatDay, formatLongDay, formatTime, todayKey, WEEKDAY_NAMES } from "../../utils/dates";
import CalendarToolbar from "./CalendarToolbar";

const AppointmentChip = ({ appointment, onSelect }) => {
  const cancelled = appointment.status === "cancelada";
  return (
    <Box
      as="button"
      type="button"
      onClick={() => onSelect(appointment)}
      textAlign="left"
      w="full"
      px={2}
      py={1.5}
      borderRadius="md"
      borderLeftWidth="3px"
      borderLeftColor={STATUS_META[appointment.status].hex}
      bg={cancelled ? "gray.50" : "white"}
      boxShadow="xs"
      _hover={{ bg: "gray.50" }}
      _focusVisible={{ outline: "2px solid", outlineColor: "brand.500", outlineOffset: "1px" }}
      aria-label={`${formatTime(appointment.time)}, ${fullName(appointment)}, ${STATUS_META[appointment.status].label}`}
    >
      <Text fontSize="xs" fontWeight="700" color={cancelled ? "text.muted" : "brand.700"} textDecoration={cancelled ? "line-through" : undefined}>
        {formatTime(appointment.time)}
      </Text>
      <Text fontSize="xs" noOfLines={1} color={cancelled ? "text.muted" : undefined}>
        {fullName(appointment)}
      </Text>
    </Box>
  );
};

/**
 * Semana de lunes a domingo con las citas de cada día.
 * Tocar la cabecera de un día abre su vista diaria; tocar una cita abre su ficha.
 */
const WeekCalendar = ({ weekStart, appointments, onSelectDay, onSelectAppointment, onPrev, onNext, onToday }) => {
  const today = todayKey();
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const title = `${formatDay(days[0], { day: "numeric", month: "short" })} – ${formatDay(days[6], { day: "numeric", month: "short", year: "numeric" })}`;

  return (
    <Box>
      <CalendarToolbar title={title} unit="Semana" onPrev={onPrev} onNext={onNext} onToday={onToday} />
      <Grid templateColumns={{ base: "minmax(0, 1fr)", md: "repeat(7, minmax(0, 1fr))" }} gap={2}>
        {days.map((key, i) => {
          const items = appointmentsOn(appointments, key);
          const isToday = key === today;
          return (
            <Box key={key} borderWidth="1px" borderColor={isToday ? "brand.300" : "border.subtle"} borderRadius="lg" bg={isToday ? "brand.50" : "gray.50"} p={2} minH={{ md: "220px" }}>
              <Box
                as="button"
                type="button"
                onClick={() => onSelectDay(key)}
                w="full"
                textAlign="left"
                mb={2}
                aria-label={`Ver el día ${formatLongDay(key)}`}
                aria-current={isToday ? "date" : undefined}
                _focusVisible={{ outline: "2px solid", outlineColor: "brand.500" }}
              >
                <Text fontSize="xs" fontWeight="600" color="text.muted">
                  {WEEKDAY_NAMES[i][0]}
                </Text>
                <Text fontWeight="700" color={isToday ? "brand.700" : "gray.800"}>
                  {Number(key.slice(8))}
                </Text>
              </Box>
              {items.length ? (
                <Stack spacing={1.5}>
                  {items.map((appt) => (
                    <AppointmentChip key={appt.id} appointment={appt} onSelect={onSelectAppointment} />
                  ))}
                </Stack>
              ) : (
                <Text fontSize="xs" color="text.muted">
                  Sin citas
                </Text>
              )}
            </Box>
          );
        })}
      </Grid>
    </Box>
  );
};

export default WeekCalendar;
