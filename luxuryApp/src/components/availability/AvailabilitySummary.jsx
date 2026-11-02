import { Flex, Stack, Text } from "@chakra-ui/react";
import { CLINIC_HOURS, WEEKDAYS } from "../../utils/availability";
import { formatTime } from "../../utils/dates";

// Horario semanal de un doctor en modo lectura. Sin horario propio atiende en el de la clínica.
const AvailabilitySummary = ({ availability, highlightDay }) => (
  <Stack spacing={1} fontSize="sm">
    {!availability && (
      <Text color="text.muted" mb={1}>
        Horario de la clínica (sin horario propio).
      </Text>
    )}
    {WEEKDAYS.map(({ day, label }) => {
      const range = availability ? availability[day] : CLINIC_HOURS;
      const isHighlighted = day === highlightDay;
      return (
        <Flex
          key={day}
          justify="space-between"
          gap={3}
          px={isHighlighted ? 2 : 0}
          py={isHighlighted ? 1 : 0}
          mx={isHighlighted ? -2 : 0}
          borderRadius="md"
          bg={isHighlighted ? "brand.50" : undefined}
          fontWeight={isHighlighted ? 600 : undefined}
        >
          <Text>
            {label}
            {isHighlighted ? " (hoy)" : ""}
          </Text>
          <Text color={range ? undefined : "text.muted"}>
            {range ? `${formatTime(range.start)} – ${formatTime(range.end)}` : "No atiende"}
          </Text>
        </Flex>
      );
    })}
  </Stack>
);

export default AvailabilitySummary;
