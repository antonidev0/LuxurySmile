import { Button, SimpleGrid, Skeleton, Text } from "@chakra-ui/react";
import { formatTime } from "../../utils/dates";

const TimeSlotPicker = ({ slots, value, onChange, loading }) => {
  if (loading) {
    return (
      <SimpleGrid columns={{ base: 3, sm: 4, md: 5 }} spacing={2}>
        {Array.from({ length: 10 }, (_, i) => (
          <Skeleton key={i} h={10} borderRadius="lg" />
        ))}
      </SimpleGrid>
    );
  }

  if (!slots.some((s) => s.available)) {
    return (
      <Text fontSize="sm" color="text.muted">
        No quedan horarios libres este día. Prueba con otra fecha.
      </Text>
    );
  }

  return (
    <SimpleGrid columns={{ base: 3, sm: 4, md: 5 }} spacing={2} role="radiogroup" aria-label="Horarios disponibles">
      {slots.map((slot) => {
        const selected = slot.time === value;
        return (
          <Button
            key={slot.time}
            role="radio"
            aria-checked={selected}
            size="sm"
            h={10}
            borderRadius="lg"
            fontWeight={selected ? 700 : 500}
            variant={selected ? "solid" : "outline"}
            colorScheme={selected ? "brand" : "gray"}
            bg={selected ? undefined : "white"}
            isDisabled={!slot.available}
            textDecoration={slot.available ? "none" : "line-through"}
            onClick={() => onChange(slot.time)}
          >
            {formatTime(slot.time)}
          </Button>
        );
      })}
    </SimpleGrid>
  );
};

export default TimeSlotPicker;
