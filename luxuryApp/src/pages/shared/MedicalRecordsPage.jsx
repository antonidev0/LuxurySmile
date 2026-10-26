import {
  Box,
  Button,
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
import { FiCheckCircle, FiFileText, FiSearch } from "react-icons/fi";
import MedicalRecordActions from "../../components/dashboard/MedicalRecordActions";
import EmptyState from "../../components/ui/EmptyState";
import ErrorState from "../../components/ui/ErrorState";
import LoadingState from "../../components/ui/LoadingState";
import PageHeader from "../../components/ui/PageHeader";
import Panel from "../../components/ui/Panel";
import StatCard from "../../components/ui/StatCard";
import StatusBadge from "../../components/ui/StatusBadge";
import { useAppointments } from "../../hooks/useAppointments";
import { matchesSearch, sortByDateTime } from "../../utils/appointments";
import { formatDay, formatTime } from "../../utils/dates";

const FILTERS = [
  ["missing", "Sin historia"],
  ["with", "Con historia"],
  ["all", "Todas"],
];

// Historias clínicas: lista todas las citas y permite llenar la ficha, subir o ver su PDF
const MedicalRecordsPage = () => {
  const { appointments, loading, error, reload, replaceAppointment } = useAppointments();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("missing");

  const relevant = useMemo(() => appointments.filter((a) => a.status !== "cancelada"), [appointments]);
  const withRecord = relevant.filter((a) => a.historialPDF).length;
  const missingCompleted = relevant.filter((a) => a.status === "completada" && !a.historialPDF).length;

  const list = useMemo(
    () =>
      sortByDateTime(
        relevant.filter(
          (a) => (filter === "all" || (filter === "with" ? a.historialPDF : !a.historialPDF)) && matchesSearch(a, search)
        )
      ).reverse(),
    [relevant, filter, search]
  );

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <>
      <PageHeader title="Historias clínicas" description="Llena la ficha clínica de la clínica en cada consulta (se genera su PDF) o sube el PDF del paciente." />

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={6}>
        <StatCard label="Con historia" value={withRecord} icon={FiCheckCircle} color="green" />
        <StatCard label="Sin historia" value={relevant.length - withRecord} icon={FiFileText} color="orange" />
        <StatCard label="Completadas sin historia" value={missingCompleted} icon={FiFileText} color="red" hint="Conviene cargarlas" />
      </SimpleGrid>

      <Panel>
        <Flex gap={3} mb={5} direction={{ base: "column", md: "row" }} justify="space-between">
          <InputGroup maxW={{ md: "380px" }}>
            <InputLeftElement pointerEvents="none" color="gray.400">
              <FiSearch />
            </InputLeftElement>
            <Input placeholder="Buscar paciente o cédula" value={search} onChange={(e) => setSearch(e.target.value)} />
          </InputGroup>
          <HStack spacing={1} bg="gray.100" p={1} borderRadius="full" alignSelf={{ base: "flex-start", md: "center" }}>
            {FILTERS.map(([key, label]) => (
              <Button key={key} size="xs" px={3} variant={filter === key ? "solid" : "ghost"} onClick={() => setFilter(key)}>
                {label}
              </Button>
            ))}
          </HStack>
        </Flex>

        {list.length ? (
          <Stack spacing={3}>
            {list.map((appt) => (
              <Flex
                key={appt.id}
                p={4}
                borderRadius="xl"
                borderWidth="1px"
                borderColor="border.subtle"
                gap={4}
                direction={{ base: "column", md: "row" }}
                align={{ base: "stretch", md: "center" }}
              >
                <Box flex="1" minW={0}>
                  <HStack spacing={2} mb={1} flexWrap="wrap">
                    <Text fontWeight="600">
                      {appt.firstName} {appt.lastName}
                    </Text>
                    <StatusBadge status={appt.status} />
                  </HStack>
                  <Text fontSize="sm" color="text.muted">
                    {appt.ci} · {formatDay(appt.date)} · {formatTime(appt.time)}
                  </Text>
                </Box>
                <MedicalRecordActions appointment={appt} onUpdated={replaceAppointment} />
              </Flex>
            ))}
          </Stack>
        ) : (
          <EmptyState icon={FiFileText} title="Nada por aquí" description="No hay citas que coincidan con el filtro." />
        )}
      </Panel>
    </>
  );
};

export default MedicalRecordsPage;
