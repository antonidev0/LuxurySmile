import { Box, Button, Flex, Grid, HStack, IconButton, Text } from "@chakra-ui/react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { dayCounts, dayCountsText, STATUS_META, STATUSES } from "../../utils/appointments";
import { formatLongDay, formatMonth, todayKey, toDayKey } from "../../utils/dates";

const WEEKDAYS = [
  ["Lun", "Lunes"],
  ["Mar", "Martes"],
  ["Mié", "Miércoles"],
  ["Jue", "Jueves"],
  ["Vie", "Viernes"],
  ["Sáb", "Sábado"],
  ["Dom", "Domingo"],
];
const pad = (n) => String(n).padStart(2, "0");

// Cuadrícula del mes (semanas de lunes a domingo)
const buildMonth = (year, month) => {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array.from({ length: offset }, () => null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(`${year}-${pad(month + 1)}-${pad(d)}`);
  while (cells.length % 7) cells.push(null);
  return cells;
};

/**
 * Calendario mensual con el número de citas de cada día.
 * month es { year, month } (month 0-11). appointments llega ya filtrada: los contadores
 * muestran las citas vigentes y, aparte, las canceladas (que se conservan como histórico).
 */
const MonthCalendar = ({ month, onMonthChange, onToday, appointments, selected, onSelect }) => {
  const cells = buildMonth(month.year, month.month);
  const today = todayKey();

  const byDay = appointments.reduce((acc, a) => {
    const key = toDayKey(a.date);
    (acc[key] ??= []).push(a);
    return acc;
  }, {});

  const shift = (delta) => {
    const d = new Date(month.year, month.month + delta, 1);
    onMonthChange({ year: d.getFullYear(), month: d.getMonth() });
  };

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={4} gap={2}>
        <Text as="h2" fontWeight="700" fontSize="lg" aria-live="polite" sx={{ "&::first-letter": { textTransform: "uppercase" } }}>
          {formatMonth(`${month.year}-${pad(month.month + 1)}`, { month: "long", year: "numeric" })}
        </Text>
        <HStack spacing={1}>
          <Button size="sm" variant="outline" onClick={onToday}>
            Hoy
          </Button>
          <IconButton size="sm" variant="ghost" aria-label="Mes anterior" icon={<FiChevronLeft />} onClick={() => shift(-1)} />
          <IconButton size="sm" variant="ghost" aria-label="Mes siguiente" icon={<FiChevronRight />} onClick={() => shift(1)} />
        </HStack>
      </Flex>

      <Grid templateColumns="repeat(7, 1fr)" gap={{ base: 1, md: 2 }}>
        {WEEKDAYS.map(([short, long]) => (
          <Text key={short} as="abbr" title={long} textDecoration="none" fontSize="xs" fontWeight="600" color="text.muted" textAlign="center" pb={1}>
            {short}
          </Text>
        ))}
        {cells.map((key, i) => {
          if (!key) return <Box key={`empty-${i}`} />;
          const items = byDay[key] ?? [];
          const counts = dayCounts(items);
          const isSelected = key === selected;
          const isToday = key === today;
          const statuses = STATUSES.filter((s) => items.some((a) => a.status === s));
          return (
            <Box
              key={key}
              as="button"
              type="button"
              onClick={() => onSelect(key)}
              aria-label={`${formatLongDay(key)}: ${dayCountsText(counts).toLowerCase()}${isToday ? " (hoy)" : ""}`}
              aria-pressed={isSelected}
              aria-current={isToday ? "date" : undefined}
              minW={0}
              minH={{ base: "52px", md: "84px" }}
              p={{ base: 1, md: 2 }}
              borderRadius="lg"
              borderWidth="1px"
              borderColor={isSelected ? "brand.500" : "border.subtle"}
              // El día seleccionado lleva un borde doble, no solo otro color
              boxShadow={isSelected ? "inset 0 0 0 1px var(--chakra-colors-brand-500)" : undefined}
              bg={isSelected ? "brand.50" : "white"}
              textAlign="left"
              display="flex"
              flexDirection="column"
              transition="border-color .15s, background .15s"
              _hover={{ borderColor: "brand.300" }}
              _focusVisible={{ outline: "2px solid", outlineColor: "brand.500", outlineOffset: "2px" }}
            >
              <Text
                fontSize="sm"
                fontWeight={isToday ? 700 : 500}
                color={isToday ? "white" : "gray.700"}
                bg={isToday ? "brand.600" : "transparent"}
                borderRadius="full"
                boxSize={6}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                {Number(key.slice(8))}
              </Text>
              {counts.total > 0 && (
                <Box mt="auto" minW={0}>
                  {counts.active > 0 && (
                    <Text fontSize="xs" fontWeight="600" color="brand.700" display={{ base: "none", md: "block" }} noOfLines={1}>
                      {counts.active} {counts.active === 1 ? "cita" : "citas"}
                    </Text>
                  )}
                  {counts.cancelled > 0 && (
                    <Text fontSize="xs" color="text.muted" display={{ base: "none", md: "block" }} noOfLines={1}>
                      {counts.cancelled} {counts.cancelled === 1 ? "cancelada" : "canceladas"}
                    </Text>
                  )}
                  <HStack spacing={0.5} mt={0.5} aria-hidden="true">
                    {statuses.map((s) => (
                      <Box key={s} boxSize={1.5} borderRadius="full" bg={STATUS_META[s].hex} />
                    ))}
                  </HStack>
                </Box>
              )}
            </Box>
          );
        })}
      </Grid>
    </Box>
  );
};

export default MonthCalendar;
