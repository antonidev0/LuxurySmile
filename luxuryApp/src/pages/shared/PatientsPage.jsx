import {
  Avatar,
  Badge,
  Box,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { FiSearch, FiUsers } from "react-icons/fi";
import MedicalRecordActions from "../../components/dashboard/MedicalRecordActions";
import EmptyState from "../../components/ui/EmptyState";
import ErrorState from "../../components/ui/ErrorState";
import LoadingState from "../../components/ui/LoadingState";
import PageHeader from "../../components/ui/PageHeader";
import Panel from "../../components/ui/Panel";
import StatusBadge from "../../components/ui/StatusBadge";
import { useAppointments } from "../../hooks/useAppointments";
import { groupPatients, matchesSearch } from "../../utils/appointments";
import { formatDay, formatTime } from "../../utils/dates";

const PatientCard = ({ patient, onOpen }) => (
  <Box
    as="button"
    type="button"
    onClick={onOpen}
    textAlign="left"
    p={4}
    borderRadius="xl"
    borderWidth="1px"
    borderColor="border.subtle"
    bg="white"
    transition="border-color .15s, box-shadow .15s"
    _hover={{ borderColor: "brand.200", boxShadow: "soft" }}
  >
    <HStack spacing={3} mb={3}>
      <Avatar size="sm" name={`${patient.firstName} ${patient.lastName}`} bg="brand.100" color="brand.800" />
      <Box minW={0}>
        <Text fontWeight="600" noOfLines={1}>
          {patient.firstName} {patient.lastName}
        </Text>
        <Text fontSize="xs" color="text.muted" noOfLines={1}>
          {patient.ci} · {patient.email}
        </Text>
      </Box>
    </HStack>
    <SimpleGrid columns={3} fontSize="xs" color="text.muted" spacing={2}>
      <Box>
        <Text>Visitas</Text>
        <Text fontWeight="700" color="gray.800" fontSize="sm">
          {patient.visits}
        </Text>
      </Box>
      <Box>
        <Text>Última</Text>
        <Text fontWeight="600" color="gray.800">
          {patient.lastVisit ? formatDay(patient.lastVisit.date, { day: "numeric", month: "short" }) : "—"}
        </Text>
      </Box>
      <Box>
        <Text>Próxima</Text>
        <Text fontWeight="600" color={patient.nextVisit ? "brand.700" : "gray.800"}>
          {patient.nextVisit ? formatDay(patient.nextVisit.date, { day: "numeric", month: "short" }) : "—"}
        </Text>
      </Box>
    </SimpleGrid>
    {patient.hasRecord && (
      <Badge mt={3} colorScheme="green" variant="subtle" borderRadius="full" textTransform="none">
        Con historia clínica
      </Badge>
    )}
  </Box>
);

const PatientsPage = () => {
  const { appointments, loading, error, reload, replaceAppointment, role } = useAppointments();
  const [search, setSearch] = useState("");
  const [selectedCi, setSelectedCi] = useState(null);

  const patients = useMemo(() => groupPatients(appointments), [appointments]);
  const filtered = useMemo(
    () =>
      patients
        .filter((p) => matchesSearch(p, search))
        .sort((a, b) => `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`)),
    [patients, search]
  );
  const selected = patients.find((p) => p.ci === selectedCi);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <>
      <PageHeader
        title={role === "admin" ? "Pacientes" : "Mis pacientes"}
        description={`${patients.length} pacientes, agrupados por cédula a partir de sus citas.`}
      />
      <Panel>
        <InputGroup mb={5} maxW={{ md: "420px" }}>
          <InputLeftElement pointerEvents="none" color="gray.400">
            <FiSearch />
          </InputLeftElement>
          <Input placeholder="Buscar por nombre, cédula o correo" value={search} onChange={(e) => setSearch(e.target.value)} />
        </InputGroup>
        {filtered.length ? (
          <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={4}>
            {filtered.map((p) => (
              <PatientCard key={p.ci} patient={p} onOpen={() => setSelectedCi(p.ci)} />
            ))}
          </SimpleGrid>
        ) : (
          <EmptyState icon={FiUsers} title="No hay pacientes" description={search ? "Ningún paciente coincide con la búsqueda." : undefined} />
        )}
      </Panel>

      <Drawer isOpen={Boolean(selected)} onClose={() => setSelectedCi(null)} size="md">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton mt={2} />
          {selected && (
            <>
              <DrawerHeader borderBottomWidth="1px">
                <Text fontSize="xl">
                  {selected.firstName} {selected.lastName}
                </Text>
                <Text fontSize="sm" fontWeight="400" color="text.muted">
                  {selected.ci} · {selected.email}
                </Text>
              </DrawerHeader>
              <DrawerBody py={6}>
                <Text fontWeight="700" fontSize="sm" mb={3}>
                  Historial de citas ({selected.appointments.length})
                </Text>
                <Stack spacing={3}>
                  {[...selected.appointments].reverse().map((appt) => (
                    <Box key={appt.id} p={4} borderRadius="xl" borderWidth="1px" borderColor="border.subtle">
                      <Flex justify="space-between" align="center" mb={2} gap={2}>
                        <Text fontWeight="600" fontSize="sm">
                          {formatDay(appt.date)} · {formatTime(appt.time)}
                        </Text>
                        <StatusBadge status={appt.status} />
                      </Flex>
                      <Text fontSize="xs" color="text.muted" mb={3}>
                        {appt.assignedDoctors?.length ? appt.assignedDoctors.map((d) => `Dr. ${d.name} ${d.lastName}`).join(", ") : "Sin doctor asignado"}
                      </Text>
                      <MedicalRecordActions appointment={appt} onUpdated={replaceAppointment} size="xs" />
                    </Box>
                  ))}
                </Stack>
              </DrawerBody>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default PatientsPage;
