import {
  Alert,
  AlertDescription,
  AlertIcon,
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from "@chakra-ui/react";
import { useState } from "react";
import { useNotify } from "../../hooks/useNotify";
import { getErrorMessage } from "../../services/api";
import { updateAvailability } from "../../services/staff.service";
import { availabilityProblem, CLINIC_SCHEDULE_TEXT, clinicAvailability } from "../../utils/availability";
import AvailabilityEditor from "../availability/AvailabilityEditor";

const AvailabilityForm = ({ person, onClose, onSaved }) => {
  const notify = useNotify();
  const [availability, setAvailability] = useState(() => person.availability ?? clinicAvailability());
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const problem = availabilityProblem(availability);
    setError(problem);
    if (problem) return;
    setSaving(true);
    try {
      const updated = await updateAvailability(person.id, availability);
      onSaved(updated);
      notify.success("Disponibilidad guardada", "Solo se le podrán asignar citas en este horario.");
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, "No se pudo guardar la disponibilidad"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <ModalBody>
        <Text fontSize="sm" color="text.muted" mb={4}>
          Días y horas en los que atiende citas. {CLINIC_SCHEDULE_TEXT}
        </Text>
        <AvailabilityEditor value={availability} onChange={setAvailability} />
        {error && (
          <Alert status="error" borderRadius="xl" mt={4}>
            <AlertIcon />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </ModalBody>
      <ModalFooter gap={3}>
        <Button variant="ghost" onClick={onClose} isDisabled={saving}>
          Cancelar
        </Button>
        <Button onClick={save} isLoading={saving} loadingText="Guardando">
          Guardar horario
        </Button>
      </ModalFooter>
    </>
  );
};

const AvailabilityModal = ({ person, onClose, onSaved }) => (
  <Modal isOpen={Boolean(person)} onClose={onClose} isCentered scrollBehavior="inside" size="lg">
    <ModalOverlay />
    <ModalContent mx={4} borderRadius="2xl">
      <ModalHeader>
        Disponibilidad
        {person && (
          <Text fontSize="sm" fontWeight="400" color="text.muted">
            Dr. {person.name} {person.lastName}
          </Text>
        )}
      </ModalHeader>
      <ModalCloseButton />
      {person && <AvailabilityForm key={person.id} person={person} onClose={onClose} onSaved={onSaved} />}
    </ModalContent>
  </Modal>
);

export default AvailabilityModal;
