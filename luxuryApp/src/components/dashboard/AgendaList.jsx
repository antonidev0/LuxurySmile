import { Box, Flex, HStack, Stack, Text } from "@chakra-ui/react";
import { formatDay, formatTime, todayKey, toDayKey } from "../../utils/dates";
import EmptyState from "../ui/EmptyState";
import StatusBadge from "../ui/StatusBadge";

// Lista compacta de citas (agenda del día, próximas citas…)
const AgendaList = ({ appointments, onSelect, showDate = false, emptyTitle = "Sin citas", emptyDescription }) => {
  if (!appointments.length) return <EmptyState title={emptyTitle} description={emptyDescription} py={6} />;
  const today = todayKey();

  return (
    <Stack spacing={2}>
      {appointments.map((appt) => (
        <Flex
          key={appt.id}
          as={onSelect ? "button" : "div"}
          type={onSelect ? "button" : undefined}
          onClick={onSelect ? () => onSelect(appt) : undefined}
          textAlign="left"
          w="full"
          align="center"
          gap={3}
          p={3}
          borderRadius="xl"
          borderWidth="1px"
          borderColor="border.subtle"
          transition="background .15s, border-color .15s"
          _hover={onSelect ? { bg: "gray.50", borderColor: "brand.100" } : undefined}
        >
          <Box minW="68px" flexShrink={0} textAlign="center" py={1} borderRadius="lg" bg="brand.50" color="brand.700">
            {showDate && (
              <Text fontSize="xs" fontWeight="600" textTransform="capitalize">
                {toDayKey(appt.date) === today ? "Hoy" : formatDay(appt.date, { day: "numeric", month: "short" })}
              </Text>
            )}
            <Text fontSize="sm" fontWeight="700">
              {formatTime(appt.time)}
            </Text>
          </Box>
          <Box flex="1" minW={0}>
            <Text fontWeight="600" noOfLines={1}>
              {appt.firstName} {appt.lastName}
            </Text>
            <HStack spacing={2} fontSize="xs" color="text.muted">
              <Text>{appt.ci}</Text>
              {appt.assignedDoctors?.length > 0 && (
                <Text noOfLines={1}>· Dr. {appt.assignedDoctors.map((d) => d.lastName).join(", ")}</Text>
              )}
            </HStack>
          </Box>
          <StatusBadge status={appt.status} />
        </Flex>
      ))}
    </Stack>
  );
};

export default AgendaList;
