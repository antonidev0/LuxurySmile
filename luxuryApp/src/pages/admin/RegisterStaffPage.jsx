import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Select,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import PageHeader from "../../components/ui/PageHeader";
import Panel from "../../components/ui/Panel";
import { useNotify } from "../../hooks/useNotify";
import { registerStaff } from "../../services/auth.service";
import { staffSchema } from "../../validations/staffSchema";

const Field = ({ label, error, children, colSpan }) => (
  <FormControl isInvalid={Boolean(error)} gridColumn={colSpan}>
    <FormLabel fontSize="sm" fontWeight="600">
      {label}
    </FormLabel>
    {children}
    <FormErrorMessage>{error?.message}</FormErrorMessage>
  </FormControl>
);

const SectionTitle = ({ children }) => (
  <Text fontWeight="700" color="brand.800" mb={4}>
    {children}
  </Text>
);

const RegisterStaffPage = () => {
  const notify = useNotify();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(staffSchema), mode: "onTouched" });

  const onSubmit = async (data) => {
    // confirmPassword solo sirve en el formulario; no se envía al backend
    // eslint-disable-next-line no-unused-vars
    const { confirmPassword, ...staffData } = data;
    try {
      await registerStaff(staffData);
      notify.success("Personal registrado", "Le llegará un correo para verificar su cuenta.");
      reset();
    } catch (err) {
      notify.error("No se pudo registrar", err);
    }
  };

  return (
    <>
      <PageHeader title="Registrar personal" description="Da de alta a un nuevo doctor. Recibirá un correo para verificar su cuenta." />
      <Panel maxW="4xl">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Stack spacing={8}>
            <Box>
              <SectionTitle>Datos personales</SectionTitle>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <Field label="Nombre" error={errors.name}>
                  <Input {...register("name")} autoComplete="off" />
                </Field>
                <Field label="Apellido" error={errors.lastName}>
                  <Input {...register("lastName")} autoComplete="off" />
                </Field>
                <Field label="Cédula" error={errors.numberId}>
                  <Input inputMode="numeric" placeholder="12345678" {...register("numberId")} />
                </Field>
                <Field label="Fecha de nacimiento" error={errors.birthday}>
                  <Input type="date" {...register("birthday")} />
                </Field>
                <Field label="Sexo" error={errors.sex}>
                  <Select placeholder="Selecciona una opción" {...register("sex")}>
                    <option value="hombre">Hombre</option>
                    <option value="mujer">Mujer</option>
                  </Select>
                </Field>
                <Field label="Teléfono" error={errors.numberPhone}>
                  <Input type="tel" placeholder="+584241234567" {...register("numberPhone")} />
                </Field>
                <Field label="Dirección" error={errors.address} colSpan={{ md: "span 2" }}>
                  <Input {...register("address")} />
                </Field>
              </SimpleGrid>
            </Box>

            <Box>
              <SectionTitle>Datos profesionales y acceso</SectionTitle>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <Field label="Especialidad" error={errors.specialty}>
                  <Input placeholder="Ortodoncia" {...register("specialty")} />
                </Field>
                <Field label="Correo electrónico" error={errors.email}>
                  <Input type="email" autoComplete="off" {...register("email")} />
                </Field>
                <Field label="Contraseña" error={errors.password}>
                  <Input type="password" autoComplete="new-password" {...register("password")} />
                </Field>
                <Field label="Confirmar contraseña" error={errors.confirmPassword}>
                  <Input type="password" autoComplete="new-password" {...register("confirmPassword")} />
                </Field>
              </SimpleGrid>
            </Box>

            <Button type="submit" size="lg" alignSelf={{ base: "stretch", md: "flex-start" }} isLoading={isSubmitting}>
              Registrar
            </Button>
          </Stack>
        </form>
      </Panel>
    </>
  );
};

export default RegisterStaffPage;
