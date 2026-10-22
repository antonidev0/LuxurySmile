import {
  Box,
  Button,
  Flex,
  HStack,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  Tooltip,
  Icon,
  Badge,
} from "@chakra-ui/react";
import { FiFileText } from "react-icons/fi";
import { isActive } from "../../utils/appointments";
import { formatDay, formatTime, todayKey, toDayKey } from "../../utils/dates";
import EmptyState from "../ui/EmptyState";
import StatusBadge from "../ui/StatusBadge";

// Las citas cerradas sin doctor no necesitan aviso; las abiertas sí
const Doctors = ({ appt }) =>
  appt.assignedDoctors?.length ? (
    <Text fontSize="sm" noOfLines={2} color={isActive(appt) ? undefined : "text.muted"}>
      {appt.assignedDoctors.map((d) => `Dr. ${d.lastName}`).join(", ")}
    </Text>
  ) : (
    <Text fontSize="sm" color={isActive(appt) ? "orange.600" : "text.muted"} fontWeight={isActive(appt) ? 600 : 400}>
      Sin asignar
    </Text>
  );

const TodayTag = ({ appt }) =>
  toDayKey(appt.date) === todayKey() ? (
    <Badge colorScheme="brand" variant="solid" borderRadius="full" fontSize="2xs" px={2} ml={2} textTransform="none">
      Hoy
    </Badge>
  ) : null;

const RecordIcon = ({ appt }) => (
  <Tooltip label={appt.historialPDF ? "Tiene historia clínica" : "Sin historia clínica"}>
    <Box as="span" color={appt.historialPDF ? "green.500" : "gray.300"} display="inline-flex">
      <Icon as={FiFileText} />
    </Box>
  </Tooltip>
);

/**
 * Tabla de citas en escritorio y tarjetas en móvil.
 * El estado solo se muestra: los cambios se hacen desde la ficha (onSelect), con acciones explícitas.
 */
const AppointmentsTable = ({ appointments, onSelect, emptyTitle = "No hay citas con estos filtros", emptyDescription = "Prueba a cambiar o limpiar los filtros." }) => {
  if (!appointments.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <>
      <TableContainer display={{ base: "none", md: "block" }} whiteSpace="normal">
        <Table size="sm" variant="simple">
          <Thead>
            <Tr>
              <Th>Paciente</Th>
              <Th>Fecha</Th>
              <Th>Doctor</Th>
              <Th>Estado</Th>
              <Th textAlign="center">Historia</Th>
              <Th />
            </Tr>
          </Thead>
          <Tbody>
            {appointments.map((appt) => (
              <Tr
                key={appt.id}
                _hover={{ bg: "gray.50" }}
                cursor="pointer"
                onClick={() => onSelect(appt)}
                opacity={isActive(appt) || appt.status === "completada" ? 1 : 0.75}
              >
                <Td py={3}>
                  <Text fontWeight="600">
                    {appt.firstName} {appt.lastName}
                  </Text>
                  <Text fontSize="xs" color="text.muted">
                    {appt.ci} · {appt.email}
                  </Text>
                </Td>
                <Td whiteSpace="nowrap">
                  <Text fontSize="sm">
                    {formatDay(appt.date)}
                    <TodayTag appt={appt} />
                  </Text>
                  <Text fontSize="xs" color="text.muted">
                    {formatTime(appt.time)}
                  </Text>
                </Td>
                <Td maxW="200px">
                  <Doctors appt={appt} />
                </Td>
                <Td>
                  <StatusBadge status={appt.status} />
                </Td>
                <Td textAlign="center">
                  <RecordIcon appt={appt} />
                </Td>
                <Td textAlign="right">
                  <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); onSelect(appt); }}>
                    Ver ficha
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>

      <Stack spacing={3} display={{ base: "flex", md: "none" }}>
        {appointments.map((appt) => (
          <Box key={appt.id} p={4} borderRadius="xl" borderWidth="1px" borderColor="border.subtle" bg="white">
            <Flex justify="space-between" gap={3} mb={2}>
              <Box minW={0}>
                <Text fontWeight="600" noOfLines={1}>
                  {appt.firstName} {appt.lastName}
                </Text>
                <Text fontSize="xs" color="text.muted">
                  {appt.ci}
                </Text>
              </Box>
              <StatusBadge status={appt.status} />
            </Flex>
            <HStack fontSize="sm" color="gray.700" spacing={3} mb={2} flexWrap="wrap">
              <Text>
                {formatDay(appt.date)}
                <TodayTag appt={appt} />
              </Text>
              <Text>·</Text>
              <Text>{formatTime(appt.time)}</Text>
              <RecordIcon appt={appt} />
            </HStack>
            <Doctors appt={appt} />
            <Button size="sm" mt={3} w="full" variant="outline" onClick={() => onSelect(appt)}>
              Ver ficha
            </Button>
          </Box>
        ))}
      </Stack>
    </>
  );
};

export default AppointmentsTable;
