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
      {appointments.map((appt) => {
        const cancelled = appt.status === "cancelada";
        return (
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
            _focusVisible={{ outline: "2px solid", outlineColor: "brand.500", outlineOffset: "2px" }}
          >
            <Box
              minW="68px"
              flexShrink={0}
              textAlign="center"
              py={1}
              borderRadius="lg"
              bg={cancelled ? "gray.100" : "brand.50"}
              color={cancelled ? "text.muted" : "brand.700"}
              // Las canceladas se conservan como histórico: hora tachada además del estado
              textDecoration={cancelled ? "line-through" : undefined}
            >
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
              <Text fontWeight="600" noOfLines={1} color={cancelled ? "text.muted" : undefined}>
                {appt.firstName} {appt.lastName}
              </Text>
              <HStack spacing={2} fontSize="xs" color="text.muted" minW={0}>
                <Text flexShrink={0}>{appt.ci}</Text>
                <Text noOfLines={1}>
                  ·{" "}
                  {appt.assignedDoctors?.length > 0
                    ? `Dr. ${appt.assignedDoctors.map((d) => d.lastName).join(", ")}`
                    : "Sin doctor asignado"}
                </Text>
              </HStack>
            </Box>
            <StatusBadge status={appt.status} />
          </Flex>
        );
      })}
    </Stack>
  );
};

export default AgendaList;
