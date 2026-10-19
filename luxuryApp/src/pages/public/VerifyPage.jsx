import { Box, Button, Center, Heading, Icon, Spinner, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { FiAlertTriangle, FiCheckCircle } from "react-icons/fi";
import { Link, useParams } from "react-router-dom";
import { getErrorMessage } from "../../services/api";
import { verifyAccount } from "../../services/auth.service";

const VerifyPage = () => {
  const { id, token } = useParams();
  const [state, setState] = useState({ status: "loading", message: "Verificando tu cuenta…" });

  useEffect(() => {
    verifyAccount(id, token)
      .then((res) => setState({ status: "success", message: res.data.message || "Cuenta verificada" }))
      .catch((err) =>
        setState({ status: "error", message: getErrorMessage(err, "El enlace de verificación es inválido o ha expirado.") })
      );
  }, [id, token]);

  return (
    <Center minH="100vh" px={4} bg="ivory">
      <Box bg="white" p={{ base: 8, md: 10 }} borderRadius="3xl" boxShadow="lift" textAlign="center" maxW="md" w="full">
        {state.status === "loading" ? (
          <Spinner size="xl" color="brand.500" thickness="3px" />
        ) : (
          <Icon as={state.status === "success" ? FiCheckCircle : FiAlertTriangle} boxSize={14} color={state.status === "success" ? "green.500" : "red.500"} />
        )}
        <Heading fontSize="2xl" mt={6} mb={2}>
          {state.status === "success" ? "¡Listo!" : state.status === "error" ? "No se pudo verificar" : "Un momento"}
        </Heading>
        <Text color="text.muted">{state.message}</Text>
        {state.status !== "loading" && (
          <Button as={Link} to={state.status === "success" ? "/login" : "/"} mt={8}>
            {state.status === "success" ? "Iniciar sesión" : "Volver al inicio"}
          </Button>
        )}
      </Box>
    </Center>
  );
};

export default VerifyPage;
