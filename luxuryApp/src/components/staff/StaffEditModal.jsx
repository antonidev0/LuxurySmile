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
  SimpleGrid,
  Stack,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { SPECIALTIES } from "../../constants/specialties";
import { useNotify } from "../../hooks/useNotify";
import { getErrorMessage } from "../../services/api";
import { updateStaff } from "../../services/staff.service";
import { normalizeEmail } from "../../utils/staff";
import { staffEditSchema } from "../../validations/staffSchema";

const Field = ({ label, error, children }) => (
  <FormControl isInvalid={Boolean(error)} isRequired>
    <FormLabel fontSize="sm" fontWeight="600" mb={1.5}>
      {label}
    </FormLabel>
    {children}
    <FormErrorMessage>{error?.message}</FormErrorMessage>
  </FormControl>
);

// Formulario de edición; se monta de nuevo para cada persona
const EditForm = ({ person, staff, onClose, onSaved }) => {
  const notify = useNotify();
  const isDoctor = person.role === "doctor";
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(staffEditSchema(person.role)),
    mode: "onTouched",
    defaultValues: {
      name: person.name,
      lastName: person.lastName,
      email: person.email,
      numberPhone: person.numberPhone,
      specialty: isDoctor ? person.specialty : "",
    },
  });

  const onSubmit = async (data) => {
    setServerError("");
    // Aviso inmediato si el correo ya lo usa otra persona del equipo
    if (staff.some((s) => s.id !== person.id && normalizeEmail(s.email) === data.email)) {
      setError("email", { message: "Este correo ya lo usa otro miembro del personal" });
      return;
    }
    try {
      const updated = await updateStaff(person.id, data);
      onSaved(updated);
      notify.success("Datos actualizados", `${updated.name} ${updated.lastName}`);
      onClose();
    } catch (err) {
      const field = err.response?.data?.field;
      if (field) setError(field, { message: getErrorMessage(err) });
      else setServerError(getErrorMessage(err, "No se pudieron guardar los cambios"));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <ModalBody>
        <Stack spacing={4}>
          <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
            <Field label="Nombre" error={errors.name}>
              <Input autoComplete="off" {...register("name")} />
            </Field>
            <Field label="Apellido" error={errors.lastName}>
              <Input autoComplete="off" {...register("lastName")} />
            </Field>
          </SimpleGrid>
          <Field label="Correo electrónico" error={errors.email}>
            <Input type="email" autoComplete="off" {...register("email")} />
          </Field>
          <Field label="Teléfono" error={errors.numberPhone}>
            <Input type="tel" placeholder="+584241234567" {...register("numberPhone")} />
          </Field>
          {isDoctor && (
            <Field label="Especialidad" error={errors.specialty}>
              <Input list="edit-specialties" {...register("specialty")} />
              <datalist id="edit-specialties">
                {SPECIALTIES.doctor.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </Field>
          )}
          {serverError && (
            <Alert status="error" borderRadius="xl">
              <AlertIcon />
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}
        </Stack>
      </ModalBody>
      <ModalFooter gap={3}>
        <Button variant="ghost" onClick={onClose} isDisabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isSubmitting} loadingText="Guardando">
          Guardar cambios
        </Button>
      </ModalFooter>
    </form>
  );
};

const StaffEditModal = ({ person, staff, onClose, onSaved }) => (
  <Modal isOpen={Boolean(person)} onClose={onClose} isCentered scrollBehavior="inside" size="lg">
    <ModalOverlay />
    <ModalContent mx={4} borderRadius="2xl">
      <ModalHeader>Editar información</ModalHeader>
      <ModalCloseButton />
      {person && <EditForm key={person.id} person={person} staff={staff} onClose={onClose} onSaved={onSaved} />}
    </ModalContent>
  </Modal>
);

export default StaffEditModal;
