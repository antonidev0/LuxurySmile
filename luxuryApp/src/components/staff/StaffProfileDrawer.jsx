import {
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  HStack,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react";
import { FiCalendar } from "react-icons/fi";
import { Link } from "react-router-dom";
import { CLINIC_HOURS, WEEKDAYS } from "../../utils/availability";
import { upcomingAppointments } from "../../utils/appointments";
import { formatDay, formatTime } from "../../utils/dates";
import { ACCOUNT_STATUS, accountStatus, ROLE_LABELS, staffName } from "../../utils/staff";
import StatusBadge from "../ui/StatusBadge";

const Detail = ({ label, children }) => (
  <Box>
    <Text fontSize="xs" color="text.muted" textTransform="uppercase" letterSpacing="0.06em">
      {label}
    </Text>
    <Text fontWeight="500" wordBreak="break-word">
      {children || "—"}
    </Text>
  </Box>
);

const SectionTitle = ({ children }) => (
  <Text fontWeight="700" fontSize="sm" mb={3}>
    {children}
  </Text>
);

// Ficha de un miembro del personal: datos y, en doctores, especialidad, citas y disponibilidad
const StaffProfileDrawer = ({ person, appointments, onClose }) => {
  const isDoctor = person?.role === "doctor";
  const status = person && accountStatus(person);
  const mine = isDoctor ? appointments.filter((a) => a.assignedDoctors?.some((d) => d.id === person.id)) : [];
  const count = (s) => mine.filter((a) => a.status === s).length;
  const upcoming = upcomingAppointments(mine, 5);

  return (
    <Drawer isOpen={Boolean(person)} onClose={onClose} placement="right" size="md">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton mt={2} />
        {person && (
          <>
            <DrawerHeader borderBottomWidth="1px">
              <HStack spacing={3}>
                <Avatar name={`${person.name} ${person.lastName}`} bg={isDoctor ? "brand.600" : "gold.500"} color="white" />
                <Box minW={0}>
                  <Text fontSize="xl" noOfLines={1}>
                    {staffName(person)}
                  </Text>
                  <HStack spacing={2} mt={1} flexWrap="wrap">
                    <Badge colorScheme={isDoctor ? "brand" : "yellow"} borderRadius="full" textTransform="none">
                      {ROLE_LABELS[person.role]}
                    </Badge>
                    <Badge colorScheme={ACCOUNT_STATUS[status].color} variant="outline" borderRadius="full" textTransform="none">
                      {ACCOUNT_STATUS[status].label}
                    </Badge>
                  </HStack>
                </Box>
              </HStack>
            </DrawerHeader>
            <DrawerBody py={6}>
              <Stack spacing={6}>
                <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                  {isDoctor && <Detail label="Especialidad">{person.specialty}</Detail>}
                  <Detail label="Correo">{person.email}</Detail>
                  <Detail label="Teléfono">{person.numberPhone}</Detail>
                  <Detail label="Cédula">{person.numberId}</Detail>
                  <Detail label="En el equipo desde">{formatDay(person.createdAt)}</Detail>
                  {person.deactivatedAt && <Detail label="Dado de baja el">{formatDay(person.deactivatedAt)}</Detail>}
                </SimpleGrid>

                {isDoctor && (
                  <>
                    <Divider />
                    <Box>
                      <SectionTitle>Citas</SectionTitle>
                      <SimpleGrid columns={3} spacing={3} mb={4}>
                        {[
                          ["Activas", count("pendiente") + count("confirmada")],
                          ["Completadas", count("completada")],
                          ["Canceladas", count("cancelada")],
                        ].map(([label, value]) => (
                          <Box key={label} p={3} borderRadius="xl" bg="gray.50" textAlign="center">
                            <Text fontSize="xl" fontWeight="700">
                              {value}
                            </Text>
                            <Text fontSize="xs" color="text.muted">
                              {label}
                            </Text>
                          </Box>
                        ))}
                      </SimpleGrid>
                      {upcoming.length ? (
                        <Stack spacing={2}>
                          {upcoming.map((a) => (
                            <Flex key={a.id} justify="space-between" align="center" gap={3} fontSize="sm">
                              <Text noOfLines={1}>
                                {formatDay(a.date)} · {formatTime(a.time)} — {a.firstName} {a.lastName}
                              </Text>
                              <StatusBadge status={a.status} />
                            </Flex>
                          ))}
                        </Stack>
                      ) : (
                        <Text fontSize="sm" color="text.muted">
                          No tiene próximas citas.
                        </Text>
                      )}
                      <Button as={Link} to={`/admin/dashboard/citas?doctor=${person.id}`} size="sm" variant="outline" leftIcon={<FiCalendar />} mt={4}>
                        Ver su agenda completa
                      </Button>
                    </Box>

                    <Divider />
                    <Box>
                      <SectionTitle>Disponibilidad</SectionTitle>
                      {!person.availability && (
                        <Text fontSize="sm" color="text.muted" mb={2}>
                          Horario de la clínica (sin horario propio).
                        </Text>
                      )}
                      <Stack spacing={1} fontSize="sm">
                        {WEEKDAYS.map(({ day, label }) => {
                          const range = person.availability ? person.availability[day] : CLINIC_HOURS;
                          return (
                            <Flex key={day} justify="space-between">
                              <Text>{label}</Text>
                              <Text color={range ? undefined : "text.muted"}>
                                {range ? `${formatTime(range.start)} – ${formatTime(range.end)}` : "No atiende"}
                              </Text>
                            </Flex>
                          );
                        })}
                      </Stack>
                    </Box>
                  </>
                )}
              </Stack>
            </DrawerBody>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
};

export default StaffProfileDrawer;
