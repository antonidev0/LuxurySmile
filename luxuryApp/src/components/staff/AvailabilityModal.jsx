import {
  Alert,
  AlertDescription,
  AlertIcon,
  Button,
  Flex,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Switch,
  Text,
} from "@chakra-ui/react";
import { useState } from "react";
import { useNotify } from "../../hooks/useNotify";
import { getErrorMessage } from "../../services/api";
import { updateAvailability } from "../../services/staff.service";
import { CLINIC_HOURS, clinicAvailability, WEEKDAYS } from "../../utils/availability";

// Comprueba el horario antes de enviarlo (el backend repite las mismas reglas)
const validate = (availability) => {
  const days = Object.values(availability).filter(Boolean);
  if (!days.length) return "Marca al menos un día de atención.";
  if (days.some((r) => !r.start || !r.end)) return "Indica la hora de inicio y de fin de cada día.";
  if (days.some((r) => r.start < CLINIC_HOURS.start || r.end > CLINIC_HOURS.end)) return "El horario debe estar entre las 8:00 a.m. y las 5:00 p.m.";
  if (days.some((r) => r.start >= r.end)) return "La hora de inicio debe ser anterior a la de fin.";
  return "";
};

const AvailabilityForm = ({ person, onClose, onSaved }) => {
  const notify = useNotify();
  const [availability, setAvailability] = useState(() => person.availability ?? clinicAvailability());
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const setDay = (day, range) => setAvailability((current) => ({ ...current, [day]: range }));

  const save = async () => {
    const problem = validate(availability);
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
          Días y horas en los que atiende citas. La clínica abre de lunes a sábado, de 8:00 a.m. a 5:00 p.m.
        </Text>
        <Stack spacing={3}>
          {WEEKDAYS.map(({ day, label }) => {
            const range = availability[day];
            return (
              <Flex key={day} align="center" gap={3} wrap="wrap">
                <Flex as="label" align="center" gap={3} w="130px" cursor="pointer">
                  <Switch colorScheme="brand" isChecked={Boolean(range)} onChange={(e) => setDay(day, e.target.checked ? { ...CLINIC_HOURS } : null)} />
                  <Text fontSize="sm" fontWeight="600">
                    {label}
                  </Text>
                </Flex>
                {range ? (
                  <Flex align="center" gap={2} flex="1" minW="200px">
                    <Input type="time" size="sm" min={CLINIC_HOURS.start} max={CLINIC_HOURS.end} value={range.start} aria-label={`${label}: desde`} onChange={(e) => setDay(day, { ...range, start: e.target.value })} />
                    <Text fontSize="sm">a</Text>
                    <Input type="time" size="sm" min={CLINIC_HOURS.start} max={CLINIC_HOURS.end} value={range.end} aria-label={`${label}: hasta`} onChange={(e) => setDay(day, { ...range, end: e.target.value })} />
                  </Flex>
                ) : (
                  <Text fontSize="sm" color="text.muted">
                    No atiende
                  </Text>
                )}
              </Flex>
            );
          })}
        </Stack>
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
