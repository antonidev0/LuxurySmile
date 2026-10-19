import { Box, Flex, Grid, HStack, IconButton, Text } from "@chakra-ui/react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { STATUS_META } from "../../utils/appointments";
import { formatMonth, todayKey, toDayKey } from "../../utils/dates";

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
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
 * month es { year, month } (month 0-11).
 */
const MonthCalendar = ({ month, onMonthChange, appointments, selected, onSelect }) => {
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
      <Flex justify="space-between" align="center" mb={4}>
        <Text fontWeight="700" fontSize="lg" sx={{ "&::first-letter": { textTransform: "uppercase" } }}>
          {formatMonth(`${month.year}-${pad(month.month + 1)}`, { month: "long", year: "numeric" })}
        </Text>
        <HStack>
          <IconButton size="sm" variant="ghost" aria-label="Mes anterior" icon={<FiChevronLeft />} onClick={() => shift(-1)} />
          <IconButton size="sm" variant="ghost" aria-label="Mes siguiente" icon={<FiChevronRight />} onClick={() => shift(1)} />
        </HStack>
      </Flex>

      <Grid templateColumns="repeat(7, 1fr)" gap={{ base: 1, md: 2 }}>
        {WEEKDAYS.map((d) => (
          <Text key={d} fontSize="xs" fontWeight="600" color="text.muted" textAlign="center" pb={1}>
            {d}
          </Text>
        ))}
        {cells.map((key, i) => {
          if (!key) return <Box key={`empty-${i}`} />;
          const items = byDay[key] ?? [];
          const isSelected = key === selected;
          const isToday = key === today;
          const statuses = [...new Set(items.map((a) => a.status))];
          return (
            <Box
              key={key}
              as="button"
              type="button"
              onClick={() => onSelect(key)}
              aria-label={`${key}: ${items.length} citas`}
              aria-pressed={isSelected}
              minH={{ base: "52px", md: "84px" }}
              p={{ base: 1, md: 2 }}
              borderRadius="lg"
              borderWidth="1px"
              borderColor={isSelected ? "brand.500" : "border.subtle"}
              bg={isSelected ? "brand.50" : "white"}
              textAlign="left"
              display="flex"
              flexDirection="column"
              transition="border-color .15s, background .15s"
              _hover={{ borderColor: "brand.300" }}
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
              {items.length > 0 && (
                <Box mt="auto">
                  <Text fontSize="xs" fontWeight="600" color="brand.700" display={{ base: "none", md: "block" }}>
                    {items.length} {items.length === 1 ? "cita" : "citas"}
                  </Text>
                  <HStack spacing={0.5} mt={0.5}>
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
