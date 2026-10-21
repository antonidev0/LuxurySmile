import {
  Alert,
  AlertDescription,
  AlertIcon,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
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
import { SPECIALTIES } from "../../constants/specialties";
import { useNotify } from "../../hooks/useNotify";
import { getErrorMessage } from "../../services/api";
import { changeStaffRole } from "../../services/staff.service";
import { ROLE_LABELS } from "../../utils/staff";
import RoleSelector from "./RoleSelector";

const RoleForm = ({ person, isSelf, lastAdmin, onClose, onSaved }) => {
  const notify = useNotify();
  const [role, setRole] = useState(person.role);
  const [specialty, setSpecialty] = useState("");
  const [specialtyError, setSpecialtyError] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const locked = isSelf || (lastAdmin && person.role === "admin");

  const save = async () => {
    setError("");
    if (role === "doctor" && !specialty.trim()) {
      setSpecialtyError("La especialidad es obligatoria para un doctor");
      return;
    }
    setSaving(true);
    try {
      const updated = await changeStaffRole(person.id, role, specialty.trim());
      onSaved(updated);
      notify.success("Rol actualizado", `${updated.name} ${updated.lastName} ahora es ${ROLE_LABELS[updated.role].toLowerCase()}.`);
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, "No se pudo cambiar el rol"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <ModalBody>
        <Stack spacing={4}>
          <Text fontSize="sm" color="text.muted">
            El rol define los permisos de la cuenta. Los cambios se aplican al momento, también en sesiones abiertas.
          </Text>
          {locked && (
            <Alert status="info" borderRadius="xl">
              <AlertIcon />
              <AlertDescription fontSize="sm">
                {isSelf ? "No puedes cambiar tu propio rol." : "Es el único administrador activo; debe seguir siéndolo."}
              </AlertDescription>
            </Alert>
          )}
          <RoleSelector value={role} onChange={locked ? () => {} : setRole} />
          {role === "doctor" && role !== person.role && (
            <FormControl isInvalid={Boolean(specialtyError)} isRequired>
              <FormLabel fontSize="sm" fontWeight="600" mb={1.5}>
                Especialidad
              </FormLabel>
              <Input
                list="role-specialties"
                placeholder={SPECIALTIES.doctor[0]}
                value={specialty}
                onChange={(e) => {
                  setSpecialty(e.target.value);
                  setSpecialtyError("");
                }}
              />
              <datalist id="role-specialties">
                {SPECIALTIES.doctor.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
              <FormErrorMessage>{specialtyError}</FormErrorMessage>
            </FormControl>
          )}
          {error && (
            <Alert status="error" borderRadius="xl">
              <AlertIcon />
              <AlertDescription fontSize="sm">{error}</AlertDescription>
            </Alert>
          )}
        </Stack>
      </ModalBody>
      <ModalFooter gap={3}>
        <Button variant="ghost" onClick={onClose} isDisabled={saving}>
          Cancelar
        </Button>
        <Button onClick={save} isLoading={saving} isDisabled={locked || role === person.role}>
          Guardar rol
        </Button>
      </ModalFooter>
    </>
  );
};

// Cambiar el rol (y con él los permisos) de un administrador
const RoleModal = ({ person, currentUserId, activeAdmins, onClose, onSaved }) => (
  <Modal isOpen={Boolean(person)} onClose={onClose} isCentered scrollBehavior="inside" size="lg">
    <ModalOverlay />
    <ModalContent mx={4} borderRadius="2xl">
      <ModalHeader>
        Cambiar rol y permisos
        {person && (
          <Text fontSize="sm" fontWeight="400" color="text.muted">
            {person.name} {person.lastName}
          </Text>
        )}
      </ModalHeader>
      <ModalCloseButton />
      {person && (
        <RoleForm
          key={person.id}
          person={person}
          isSelf={person.id === currentUserId}
          lastAdmin={!person.deactivatedAt && activeAdmins <= 1}
          onClose={onClose}
          onSaved={onSaved}
        />
      )}
    </ModalContent>
  </Modal>
);

export default RoleModal;
