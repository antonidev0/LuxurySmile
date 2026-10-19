import { Avatar, Badge, Box, Flex, Heading, SimpleGrid, Stack, Text } from "@chakra-ui/react";
import PageHeader from "../../components/ui/PageHeader";
import Panel from "../../components/ui/Panel";
import { useAuth } from "../../context/AuthContext";
import { formatDay } from "../../utils/dates";

const Field = ({ label, value }) => (
  <Box>
    <Text fontSize="xs" color="text.muted" textTransform="uppercase" letterSpacing="0.06em">
      {label}
    </Text>
    <Text fontWeight="500" wordBreak="break-word">
      {value || "—"}
    </Text>
  </Box>
);

const ProfilePage = () => {
  const { user } = useAuth();
  return (
    <>
      <PageHeader title="Mi perfil" description="Tus datos en el sistema. Para cambiarlos, contacta con la administración." />
      <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6} alignItems="start">
        <Panel textAlign="center">
          <Stack align="center" spacing={3} py={4}>
            <Avatar size="2xl" name={`${user.name} ${user.lastName}`} bg="brand.600" color="white" />
            <Heading fontSize="2xl">
              {user.role === "doctor" ? "Dr. " : ""}
              {user.name} {user.lastName}
            </Heading>
            <Text color="text.muted">{user.specialty}</Text>
            <Flex gap={2}>
              <Badge colorScheme="brand" borderRadius="full" px={3} textTransform="none">
                {user.role === "admin" ? "Administrador" : "Doctor"}
              </Badge>
              <Badge colorScheme={user.verified ? "green" : "orange"} borderRadius="full" px={3} textTransform="none">
                {user.verified ? "Cuenta verificada" : "Sin verificar"}
              </Badge>
            </Flex>
          </Stack>
        </Panel>
        <Panel title="Datos personales" gridColumn={{ lg: "span 2" }}>
          <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={5}>
            <Field label="Correo" value={user.email} />
            <Field label="Teléfono" value={user.numberPhone} />
            <Field label="Cédula" value={user.numberId} />
            <Field label="Fecha de nacimiento" value={user.birthday && formatDay(user.birthday)} />
            <Field label="Sexo" value={user.sex === "hombre" ? "Hombre" : user.sex === "mujer" ? "Mujer" : ""} />
            <Field label="Dirección" value={user.address} />
            <Field label="En el equipo desde" value={user.createdAt && formatDay(user.createdAt)} />
          </SimpleGrid>
        </Panel>
      </SimpleGrid>
    </>
  );
};

export default ProfilePage;
