import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Grid,
  HStack,
  Input,
  Progress,
  Radio,
  RadioGroup,
  SimpleGrid,
  Stack,
  Switch,
  Text,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { FiRefreshCw } from "react-icons/fi";
import PasswordInput from "../../components/staff/PasswordInput";
import RegisterSuccess from "../../components/staff/RegisterSuccess";
import RoleSelector from "../../components/staff/RoleSelector";
import StaffPreviewCard from "../../components/staff/StaffPreviewCard";
import { generatePassword, passwordStrength, STRENGTH_LABELS } from "../../components/staff/passwordStrength";
import PageHeader from "../../components/ui/PageHeader";
import Panel from "../../components/ui/Panel";
import { useNotify } from "../../hooks/useNotify";
import { getErrorMessage } from "../../services/api";
import { registerStaff } from "../../services/auth.service";
import { staffSchema } from "../../validations/staffSchema";

const SPECIALTIES = {
  doctor: [
    "Odontología general",
    "Ortodoncia",
    "Endodoncia",
    "Periodoncia",
    "Estética dental",
    "Implantología",
    "Odontopediatría",
    "Cirugía maxilofacial",
  ],
  admin: ["Administración", "Recepción", "Gerencia"],
};

const DEFAULT_VALUES = {
  role: "doctor",
  name: "",
  lastName: "",
  numberId: "",
  birthday: "",
  sex: "",
  numberPhone: "",
  address: "",
  specialty: "",
  email: "",
  password: "",
  confirmPassword: "",
  verified: false,
};

// Fecha máxima de nacimiento: hace 18 años
const maxBirthday = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 18);
  return d.toISOString().slice(0, 10);
};

const Field = ({ label, error, helper, children, colSpan, isRequired = true }) => (
  <FormControl isInvalid={Boolean(error)} gridColumn={colSpan} isRequired={isRequired}>
    <FormLabel fontSize="sm" fontWeight="600" mb={1.5}>
      {label}
    </FormLabel>
    {children}
    {error ? <FormErrorMessage>{error.message}</FormErrorMessage> : helper && <FormHelperText>{helper}</FormHelperText>}
  </FormControl>
);

const Section = ({ step, title, description, children }) => (
  <Panel>
    <HStack align="flex-start" spacing={3} mb={5}>
      <Flex boxSize={8} borderRadius="full" bg="brand.900" color="gold.300" align="center" justify="center" fontWeight="700" fontSize="sm" flexShrink={0}>
        {step}
      </Flex>
      <Box>
        <Text fontWeight="700" lineHeight={1.3}>
          {title}
        </Text>
        {description && (
          <Text fontSize="sm" color="text.muted">
            {description}
          </Text>
        )}
      </Box>
    </HStack>
    {children}
  </Panel>
);

const RegisterStaffPage = () => {
  const notify = useNotify();
  const [result, setResult] = useState(null);
  const [serverError, setServerError] = useState("");

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(staffSchema), mode: "onTouched", defaultValues: DEFAULT_VALUES });

  const values = watch();
  const strength = passwordStrength(values.password);

  const changeRole = (role) => {
    setValue("role", role, { shouldValidate: true });
    // Propone un cargo por defecto si el campo está vacío o tenía el del otro rol
    if (!values.specialty || SPECIALTIES[values.role].includes(values.specialty)) {
      setValue("specialty", role === "admin" ? "Administración" : "");
    }
  };

  const fillPassword = () => {
    const password = generatePassword();
    setValue("password", password, { shouldValidate: true });
    setValue("confirmPassword", password, { shouldValidate: true });
    notify.info("Contraseña generada", "Cópiala y compártela con la persona de forma segura.");
  };

  const onSubmit = async (data) => {
    setServerError("");
    // confirmPassword solo sirve en el formulario; no se envía al backend
    // eslint-disable-next-line no-unused-vars
    const { confirmPassword, ...staffData } = data;
    try {
      const { data: response } = await registerStaff(staffData);
      setResult({ ...response.data, name: `${data.name} ${data.lastName}` });
      reset(DEFAULT_VALUES);
    } catch (err) {
      setServerError(getErrorMessage(err, "No se pudo registrar al personal"));
    }
  };

  if (result) {
    return (
      <>
        <PageHeader title="Registrar personal" />
        <Panel maxW="3xl">
          <RegisterSuccess result={result} onAnother={() => setResult(null)} />
        </Panel>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Registrar personal" description="Da de alta a un doctor o a un administrador de la clínica." />

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Grid templateColumns={{ base: "1fr", xl: "minmax(0, 1fr) 340px" }} gap={6} alignItems="start">
          <Stack spacing={6}>
            <Section step={1} title="Rol" description="Define a qué partes del panel tendrá acceso.">
              <RoleSelector value={values.role} onChange={changeRole} />
            </Section>

            <Section step={2} title="Datos personales">
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <Field label="Nombre" error={errors.name}>
                  <Input placeholder="Michelle" autoComplete="off" {...register("name")} />
                </Field>
                <Field label="Apellido" error={errors.lastName}>
                  <Input placeholder="Rodríguez" autoComplete="off" {...register("lastName")} />
                </Field>
                <Field label="Cédula" error={errors.numberId} helper="Solo números, sin V ni puntos.">
                  <Input inputMode="numeric" placeholder="12345678" {...register("numberId")} />
                </Field>
                <Field label="Fecha de nacimiento" error={errors.birthday}>
                  <Input type="date" max={maxBirthday()} {...register("birthday")} />
                </Field>
                <Field label="Sexo" error={errors.sex}>
                  <Controller
                    name="sex"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup {...field} pt={2}>
                        <HStack spacing={6}>
                          <Radio value="mujer">Mujer</Radio>
                          <Radio value="hombre">Hombre</Radio>
                        </HStack>
                      </RadioGroup>
                    )}
                  />
                </Field>
                <Field label="Teléfono" error={errors.numberPhone}>
                  <Input type="tel" placeholder="+584241234567" {...register("numberPhone")} />
                </Field>
                <Field label="Dirección" error={errors.address} colSpan={{ md: "span 2" }}>
                  <Input placeholder="Porlamar, Isla de Margarita" {...register("address")} />
                </Field>
              </SimpleGrid>
            </Section>

            <Section step={3} title={values.role === "admin" ? "Cargo" : "Datos profesionales"}>
              <Field label={values.role === "admin" ? "Cargo" : "Especialidad"} error={errors.specialty} helper="Elige una de la lista o escribe otra.">
                <Input list={`specialties-${values.role}`} placeholder={SPECIALTIES[values.role][0]} {...register("specialty")} />
                <datalist id={`specialties-${values.role}`}>
                  {SPECIALTIES[values.role].map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </Field>
            </Section>

            <Section step={4} title="Acceso al panel" description="Con este correo y contraseña iniciará sesión.">
              <Stack spacing={4}>
                <Field label="Correo electrónico" error={errors.email}>
                  <Input type="email" autoComplete="off" placeholder="nombre@gmail.com" {...register("email")} />
                </Field>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <Field label="Contraseña" error={errors.password}>
                    <PasswordInput {...register("password")} />
                  </Field>
                  <Field label="Confirmar contraseña" error={errors.confirmPassword}>
                    <PasswordInput {...register("confirmPassword")} />
                  </Field>
                </SimpleGrid>
                <Flex gap={4} align="center" wrap="wrap">
                  <Box flex="1" minW="200px">
                    <Progress value={(strength / 4) * 100} size="xs" borderRadius="full" colorScheme={STRENGTH_LABELS[strength].color} />
                    <Text fontSize="xs" color="text.muted" mt={1}>
                      Seguridad: {values.password ? STRENGTH_LABELS[strength].label : "—"}
                    </Text>
                  </Box>
                  <Button size="sm" variant="outline" leftIcon={<FiRefreshCw />} onClick={fillPassword}>
                    Generar contraseña
                  </Button>
                </Flex>

                <Flex
                  as="label"
                  htmlFor="verified"
                  gap={4}
                  p={4}
                  borderRadius="xl"
                  bg="gray.50"
                  borderWidth="1px"
                  borderColor="border.subtle"
                  align="center"
                  cursor="pointer"
                >
                  <Box flex="1">
                    <Text fontWeight="600" fontSize="sm">
                      Activar la cuenta ahora
                    </Text>
                    <Text fontSize="sm" color="text.muted">
                      {values.verified
                        ? "Podrá iniciar sesión de inmediato, sin correo de verificación."
                        : "Recibirá un correo para verificar su cuenta antes de entrar."}
                    </Text>
                  </Box>
                  <Switch id="verified" colorScheme="brand" size="lg" {...register("verified")} />
                </Flex>
              </Stack>
            </Section>

            {serverError && (
              <Alert status="error" borderRadius="xl">
                <AlertIcon />
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            )}

            <Flex gap={3} justify="flex-end" direction={{ base: "column-reverse", sm: "row" }}>
              <Button variant="ghost" onClick={() => reset(DEFAULT_VALUES)} isDisabled={isSubmitting}>
                Limpiar
              </Button>
              <Button type="submit" size="lg" px={10} isLoading={isSubmitting} loadingText="Registrando">
                Registrar {values.role === "admin" ? "administrador" : "doctor"}
              </Button>
            </Flex>
          </Stack>

          <Box position={{ xl: "sticky" }} top={{ xl: 24 }} display={{ base: "none", xl: "block" }}>
            <StaffPreviewCard values={values} />
            <Text fontSize="xs" color="text.muted" mt={3} px={1}>
              Los campos con * son obligatorios. La cédula, el teléfono y el correo no pueden repetirse.
            </Text>
          </Box>
        </Grid>
      </form>
    </>
  );
};

export default RegisterStaffPage;
