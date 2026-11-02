import { Avatar, Badge, Flex, Heading, SimpleGrid, Stack, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import AvailabilitySummary from "../../components/availability/AvailabilitySummary";
import ChangePasswordForm from "../../components/profile/ChangePasswordForm";
import ContactInfoForm from "../../components/profile/ContactInfoForm";
import DetailField from "../../components/ui/DetailField";
import PageHeader from "../../components/ui/PageHeader";
import Panel from "../../components/ui/Panel";
import { useAuth } from "../../context/AuthContext";
import { formatDay } from "../../utils/dates";

const SEX_LABELS = { hombre: "Hombre", mujer: "Mujer" };

// Datos propios: los profesionales se consultan y el contacto y la contraseña se editan.
// Nombre, cédula, correo y especialidad solo los cambia la administración.
const ProfilePage = () => {
  const { user } = useAuth();
  const isDoctor = user.role === "doctor";

  return (
    <>
      <PageHeader title="Mi perfil" description="Tus datos profesionales. Puedes actualizar tu teléfono, tu dirección y tu contraseña." />
      <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6} alignItems="start">
        <Stack spacing={6}>
          <Panel textAlign="center">
            <Stack align="center" spacing={3} py={4}>
              <Avatar size="2xl" name={`${user.name} ${user.lastName}`} bg="brand.600" color="white" />
              <Heading fontSize="2xl">
                {isDoctor ? "Dr. " : ""}
                {user.name} {user.lastName}
              </Heading>
              <Text color="text.muted">{user.specialty}</Text>
              <Flex gap={2} wrap="wrap" justify="center">
                <Badge colorScheme="brand" borderRadius="full" px={3} textTransform="none">
                  {user.role === "admin" ? "Administrador" : "Doctor"}
                </Badge>
                <Badge colorScheme={user.verified ? "green" : "orange"} borderRadius="full" px={3} textTransform="none">
                  {user.verified ? "Cuenta verificada" : "Sin verificar"}
                </Badge>
              </Flex>
            </Stack>
          </Panel>
          {isDoctor && (
            <Panel
              title="Mi horario"
              action={
                <Text as={Link} to="/doctor/dashboard/disponibilidad" fontSize="sm" color="brand.700" fontWeight="600">
                  Gestionar
                </Text>
              }
            >
              <AvailabilitySummary availability={user.availability} />
            </Panel>
          )}
        </Stack>

        <Stack spacing={6} gridColumn={{ lg: "span 2" }}>
          <Panel title="Datos profesionales" subtitle="Para cambiarlos, contacta con la administración.">
            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={5}>
              <DetailField label="Nombre">{`${user.name} ${user.lastName}`}</DetailField>
              <DetailField label={isDoctor ? "Especialidad" : "Cargo"}>{user.specialty}</DetailField>
              <DetailField label="Correo">{user.email}</DetailField>
              <DetailField label="Cédula">{user.numberId}</DetailField>
              <DetailField label="Fecha de nacimiento">{user.birthday && formatDay(user.birthday)}</DetailField>
              <DetailField label="Sexo">{SEX_LABELS[user.sex]}</DetailField>
              <DetailField label="En el equipo desde">{user.createdAt && formatDay(user.createdAt)}</DetailField>
            </SimpleGrid>
          </Panel>
          <Panel title="Datos de contacto">
            <ContactInfoForm />
          </Panel>
          <Panel title="Contraseña" subtitle="Te pediremos la actual para confirmar que eres tú.">
            <ChangePasswordForm />
          </Panel>
        </Stack>
      </SimpleGrid>
    </>
  );
};

export default ProfilePage;
