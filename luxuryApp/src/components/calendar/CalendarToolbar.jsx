import { Button, Flex, HStack, IconButton, Text } from "@chakra-ui/react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

// Título del periodo visible con los botones Hoy, anterior y siguiente
const CalendarToolbar = ({ title, unit, onPrev, onNext, onToday }) => (
  <Flex justify="space-between" align="center" mb={4} gap={2}>
    <Text as="h2" fontWeight="700" fontSize="lg" aria-live="polite" sx={{ "&::first-letter": { textTransform: "uppercase" } }}>
      {title}
    </Text>
    <HStack spacing={1}>
      <Button size="sm" variant="outline" onClick={onToday}>
        Hoy
      </Button>
      <IconButton size="sm" variant="ghost" aria-label={`${unit} anterior`} icon={<FiChevronLeft />} onClick={onPrev} />
      <IconButton size="sm" variant="ghost" aria-label={`${unit} siguiente`} icon={<FiChevronRight />} onClick={onNext} />
    </HStack>
  </Flex>
);

export default CalendarToolbar;
