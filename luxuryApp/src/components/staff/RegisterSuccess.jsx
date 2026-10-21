import { Alert, AlertDescription, AlertIcon, Box, Button, Heading, Icon, Stack, Text } from "@chakra-ui/react";
import { FiCheckCircle, FiUserPlus, FiUsers } from "react-icons/fi";
import { Link } from "react-router-dom";

// Confirmación tras dar de alta a alguien
const RegisterSuccess = ({ result, onAnother }) => (
  <Box textAlign="center" py={{ base: 6, md: 10 }} px={4}>
    <Icon as={FiCheckCircle} boxSize={14} color="green.500" mb={4} />
    <Heading fontSize="2xl" mb={2}>
      {result.role === "admin" ? "Administrador registrado" : "Doctor registrado"}
    </Heading>
    <Text color="text.muted" mb={6}>
      <b>{result.name}</b> ya está guardado en el sistema con el correo <b>{result.email}</b>.
    </Text>

    <Stack maxW="md" mx="auto" mb={8} textAlign="left">
      {result.verified ? (
        <Alert status="success" borderRadius="lg">
          <AlertIcon />
          <AlertDescription fontSize="sm">La cuenta está activa: ya puede iniciar sesión.</AlertDescription>
        </Alert>
      ) : result.emailSent ? (
        <Alert status="info" borderRadius="lg">
          <AlertIcon />
          <AlertDescription fontSize="sm">Le enviamos un correo para verificar su cuenta antes de entrar.</AlertDescription>
        </Alert>
      ) : (
        <Alert status="warning" borderRadius="lg">
          <AlertIcon />
          <AlertDescription fontSize="sm">
            No se pudo enviar el correo de verificación (revisa EMAIL_USER y EMAIL_PASS del backend). Puedes activar la
            cuenta desde la página Personal.
          </AlertDescription>
        </Alert>
      )}
    </Stack>

    <Stack direction={{ base: "column", sm: "row" }} spacing={3} justify="center">
      <Button leftIcon={<FiUserPlus />} onClick={onAnother}>
        Registrar a otra persona
      </Button>
      <Button as={Link} to="/admin/dashboard/personal" variant="outline" leftIcon={<FiUsers />}>
        Ver personal
      </Button>
    </Stack>
  </Box>
);

export default RegisterSuccess;
