import {
  Avatar,
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  Stack,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { FiCheck, FiMail, FiPhone, FiSearch, FiTrash2, FiUserPlus } from "react-icons/fi";
import { Link } from "react-router-dom";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import EmptyState from "../../components/ui/EmptyState";
import ErrorState from "../../components/ui/ErrorState";
import LoadingState from "../../components/ui/LoadingState";
import PageHeader from "../../components/ui/PageHeader";
import Panel from "../../components/ui/Panel";
import { useAppointments } from "../../hooks/useAppointments";
import { useNotify } from "../../hooks/useNotify";
import { useStaff } from "../../hooks/useStaff";
import { deleteDoctor, verifyStaff } from "../../services/staff.service";
import { isActive } from "../../utils/appointments";

const StaffCard = ({ person, activeCount, onDelete, onVerify }) => (
  <Box p={5} borderRadius="2xl" borderWidth="1px" borderColor="border.subtle" bg="white">
    <Flex gap={3} align="flex-start">
      <Avatar name={`${person.name} ${person.lastName}`} bg={person.role === "admin" ? "gold.500" : "brand.600"} color="white" />
      <Box flex="1" minW={0}>
        <Text fontWeight="700" noOfLines={1}>
          {person.role === "doctor" ? "Dr. " : ""}
          {person.name} {person.lastName}
        </Text>
        <Text fontSize="sm" color="text.muted" noOfLines={1}>
          {person.specialty}
        </Text>
        <HStack mt={2} spacing={2} flexWrap="wrap">
          <Badge colorScheme={person.role === "admin" ? "yellow" : "brand"} borderRadius="full" textTransform="none">
            {person.role === "admin" ? "Administrador" : "Doctor"}
          </Badge>
          {!person.verified && (
            <Badge colorScheme="orange" borderRadius="full" textTransform="none">
              Sin verificar
            </Badge>
          )}
        </HStack>
      </Box>
      {person.role === "doctor" && (
        <Tooltip label="Eliminar doctor">
          <IconButton aria-label={`Eliminar a ${person.name} ${person.lastName}`} icon={<FiTrash2 />} size="sm" variant="ghost" colorScheme="red" onClick={() => onDelete(person)} />
        </Tooltip>
      )}
    </Flex>
    <Stack spacing={1.5} mt={4} fontSize="sm" color="gray.700">
      <HStack>
        <FiMail />
        <Text noOfLines={1}>{person.email}</Text>
      </HStack>
      <HStack>
        <FiPhone />
        <Text>{person.numberPhone}</Text>
      </HStack>
    </Stack>
    {!person.verified && (
      <Button mt={4} size="sm" w="full" variant="outline" colorScheme="green" leftIcon={<FiCheck />} onClick={() => onVerify(person)}>
        Activar cuenta
      </Button>
    )}
    {person.role === "doctor" && (
      <Text mt={4} pt={3} borderTopWidth="1px" borderColor="border.subtle" fontSize="sm">
        <b>{activeCount}</b> citas activas asignadas
      </Text>
    )}
  </Box>
);

const StaffPage = () => {
  const notify = useNotify();
  const { staff, loading, error, reload, setStaff } = useStaff();
  const { appointments } = useAppointments();
  const [search, setSearch] = useState("");
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return staff.filter((s) => !q || [s.name, s.lastName, s.email, s.specialty].some((f) => f?.toLowerCase().includes(q)));
  }, [staff, search]);

  const activeCount = (id) => appointments.filter((a) => isActive(a) && a.assignedDoctors?.some((d) => d.id === id)).length;

  const handleVerify = async (person) => {
    try {
      const updated = await verifyStaff(person.id);
      setStaff((list) => list.map((s) => (s.id === updated.id ? updated : s)));
      notify.success("Cuenta activada", `${person.name} ${person.lastName} ya puede iniciar sesión.`);
    } catch (err) {
      notify.error("No se pudo activar la cuenta", err);
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteDoctor(toDelete.id);
      setStaff((list) => list.filter((s) => s.id !== toDelete.id));
      notify.success("Doctor eliminado");
      setToDelete(null);
    } catch (err) {
      notify.error("No se pudo eliminar al doctor", err);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <>
      <PageHeader
        title="Personal"
        description={`${staff.filter((s) => s.role === "doctor").length} doctores y ${staff.filter((s) => s.role === "admin").length} administradores.`}
        actions={
          <Button as={Link} to="/admin/dashboard/registro" leftIcon={<FiUserPlus />}>
            Registrar personal
          </Button>
        }
      />
      <Panel>
        <InputGroup mb={5} maxW={{ md: "380px" }}>
          <InputLeftElement pointerEvents="none" color="gray.400">
            <FiSearch />
          </InputLeftElement>
          <Input placeholder="Buscar por nombre o especialidad" value={search} onChange={(e) => setSearch(e.target.value)} />
        </InputGroup>
        {filtered.length ? (
          <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={4}>
            {filtered.map((person) => (
              <StaffCard key={person.id} person={person} activeCount={activeCount(person.id)} onDelete={setToDelete} onVerify={handleVerify} />
            ))}
          </SimpleGrid>
        ) : (
          <EmptyState title="No hay personal que coincida" />
        )}
      </Panel>

      <ConfirmDialog
        isOpen={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        isLoading={deleting}
        title="Eliminar doctor"
        confirmLabel="Eliminar"
      >
        ¿Seguro que quieres eliminar a{" "}
        <b>
          Dr. {toDelete?.name} {toDelete?.lastName}
        </b>
        ? Se quitará de sus citas; las completadas conservan sus datos.
      </ConfirmDialog>
    </>
  );
};

export default StaffPage;
