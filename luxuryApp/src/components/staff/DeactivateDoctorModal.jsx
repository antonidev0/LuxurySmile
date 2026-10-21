import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Flex,
  List,
  ListIcon,
  ListItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useState } from "react";
import { FiCheckCircle } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useNotify } from "../../hooks/useNotify";
import { getErrorMessage } from "../../services/api";
import { deactivateStaff } from "../../services/staff.service";
import { isActive, sortByDateTime } from "../../utils/appointments";
import { formatDay, formatTime, todayKey, toDayKey } from "../../utils/dates";
import DoctorAssigner from "../dashboard/DoctorAssigner";
import StatusBadge from "../ui/StatusBadge";

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

/**
 * Baja segura de un doctor. Antes de desactivarlo comprueba sus citas:
 * las pendientes, confirmadas o en curso bloquean la baja hasta reasignarlas;
 * las completadas y canceladas se conservan en el historial.
 */
const DeactivateDoctorModal = ({ doctor, appointments, doctors, onClose, onAppointmentUpdated, onDeactivated, onConflict }) => {
  const notify = useNotify();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const mine = doctor ? appointments.filter((a) => a.assignedDoctors?.some((d) => d.id === doctor.id)) : [];
  const open = sortByDateTime(mine.filter(isActive));
  const today = todayKey();
  const inProgress = open.filter((a) => toDayKey(a.date) === today).length;
  const future = open.filter((a) => toDayKey(a.date) > today).length;
  const overdue = open.length - inProgress - future;
  const completed = mine.filter((a) => a.status === "completada").length;
  const cancelled = mine.filter((a) => a.status === "cancelada").length;
  const breakdown = [
    future && plural(future, "futura", "futuras"),
    inProgress && `${inProgress} en curso hoy`,
    overdue && plural(overdue, "pasada sin cerrar", "pasadas sin cerrar"),
  ]
    .filter(Boolean)
    .join(", ");

  const close = () => {
    setError("");
    onClose();
  };

  const confirm = async () => {
    setSaving(true);
    setError("");
    try {
      const updated = await deactivateStaff(doctor.id);
      onDeactivated(updated);
      notify.success("Doctor dado de baja", "Ya no puede iniciar sesión. Su historial se conserva.");
      close();
    } catch (err) {
      setError(getErrorMessage(err, "No se pudo dar de baja al doctor"));
      // Si el servidor encontró citas que aquí no se veían, se recargan
      if (err.response?.status === 409) onConflict?.();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={Boolean(doctor)} onClose={close} isCentered scrollBehavior="inside" size="xl">
      <ModalOverlay />
      <ModalContent mx={4} borderRadius="2xl">
        <ModalHeader>
          Dar de baja
          {doctor && (
            <Text fontSize="sm" fontWeight="400" color="text.muted">
              Dr. {doctor.name} {doctor.lastName}
            </Text>
          )}
        </ModalHeader>
        <ModalCloseButton />
        {doctor && (
          <ModalBody>
            <Stack spacing={4}>
              {open.length > 0 ? (
                <Alert status="warning" borderRadius="xl" alignItems="flex-start">
                  <AlertIcon />
                  <AlertDescription fontSize="sm">
                    Tiene <b>{plural(open.length, "cita abierta", "citas abiertas")}</b> ({breakdown}). No se puede dar de baja hasta asignarlas a otro doctor (y quitarlo a él) o cerrarlas desde Citas.
                  </AlertDescription>
                </Alert>
              ) : (
                <Text fontSize="sm">No tiene citas pendientes ni en curso. Al darlo de baja perderá el acceso al panel y no se le podrán asignar citas nuevas.</Text>
              )}

              {open.length > 0 && (
                <Stack spacing={3}>
                  {open.map((a) => (
                    <Box key={a.id} p={3} borderRadius="xl" borderWidth="1px" borderColor="border.subtle">
                      <Flex justify="space-between" align="center" gap={3} mb={2}>
                        <Text fontSize="sm" fontWeight="600" noOfLines={1}>
                          {formatDay(a.date)} · {formatTime(a.time)} — {a.firstName} {a.lastName}
                        </Text>
                        <StatusBadge status={a.status} />
                      </Flex>
                      <DoctorAssigner appointment={a} doctors={doctors} onUpdated={onAppointmentUpdated} />
                    </Box>
                  ))}
                  <Button as={Link} to={`/admin/dashboard/citas?doctor=${doctor.id}`} size="sm" variant="link" alignSelf="flex-start">
                    Abrir sus citas en Citas
                  </Button>
                </Stack>
              )}

              <Box>
                <Text fontSize="sm" fontWeight="700" mb={2}>
                  Se conserva
                </Text>
                <List spacing={1} fontSize="sm">
                  <ListItem>
                    <ListIcon as={FiCheckCircle} color="green.500" />
                    {plural(completed, "cita completada", "citas completadas")} y sus historias clínicas
                  </ListItem>
                  <ListItem>
                    <ListIcon as={FiCheckCircle} color="green.500" />
                    {plural(cancelled, "cita cancelada", "citas canceladas")} con su registro de cancelación
                  </ListItem>
                  <ListItem>
                    <ListIcon as={FiCheckCircle} color="green.500" />
                    Los pacientes que atendió y los datos del doctor
                  </ListItem>
                </List>
              </Box>

              {error && (
                <Alert status="error" borderRadius="xl">
                  <AlertIcon />
                  <AlertDescription fontSize="sm">{error}</AlertDescription>
                </Alert>
              )}
            </Stack>
          </ModalBody>
        )}
        <ModalFooter gap={3}>
          <Button variant="ghost" onClick={close} isDisabled={saving}>
            Cancelar
          </Button>
          <Button colorScheme="red" onClick={confirm} isLoading={saving} isDisabled={open.length > 0}>
            Dar de baja
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DeactivateDoctorModal;
