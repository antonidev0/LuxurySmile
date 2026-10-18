import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Heading,
  Text,
  VStack,
  Alert,
  AlertIcon,
  FormErrorMessage,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios"; 
import { useAuth } from "../../context/AuthContext";

import Navbar from "../../components/Nav";

const LoginPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
  } = useForm();
  
  const [errorMsg, setErrorMsg] = useState("");
  const [resendSuccess, setResendSuccess] = useState("");
  const [showResend, setShowResend] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const onSubmit = async (data) => {
  setErrorMsg("");
  setResendSuccess("");
  setShowResend(false);

  try {
    // Enviar login al backend (usa variable de entorno)
    const user = await login(data); // maneja token y user
      const role = user?.role;

    // Redirigir según rol
    if (role === 'admin') {
      navigate('/admin/dashboard');
    } else if (role === 'doctor') {
      navigate('/doctor/dashboard');
    } else if (role === 'patient') {
      navigate('/patient');
    } else {
      navigate('/'); // fallback
    }

  } catch (error) {
    if (error.response) {
      console.log("OOOOOOOOOOOOO");
      
    console.log(error);
    
      setErrorMsg(error.response.data.message);
      if (error.response.status === 403) setShowResend(true);
    } else {
      console.log(error);
      
      setErrorMsg("Error de red o del servidor.");
    }
  }
};

  const handleResendVerification = async () => {
    try {
      await axios.post("http://localhost:3003/api/users/resend-verification", {
        email: "", // puedes guardar el email si quieres reutilizarlo
      });
      setResendSuccess("Se ha reenviado el correo de verificación.");
    } catch (error) {
      setResendSuccess("Error al reenviar el correo.");
    }
  };

  return (
    <>
      <Navbar />
      <Box pt={16} px={4}>
        <Box maxW="sm" mx="auto" mt={10} p={6} boxShadow="lg" borderRadius="md">
          <Heading mb={6} textAlign="center">
            Iniciar Sesión
          </Heading>

          {errorMsg && (
            <Alert status="error" mb={4} rounded={4}>
              <AlertIcon />
              {errorMsg}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <VStack spacing={4}>
              <FormControl isInvalid={errors.email}>
                <FormLabel>Correo electrónico</FormLabel>
                <Input
                  type="text"
                  placeholder="ejemplo@correo.com"
                  {...register("email", { required: "El correo es obligatorio" })}
                />
                <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={errors.password}>
                <FormLabel>Contraseña</FormLabel>
                <Input
                  type="password"
                  placeholder="********"
                  {...register("password", { required: "La contraseña es obligatoria" })}
                />
                <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
              </FormControl>

              <Button 
              type="submit"
              colorScheme="blue"
              width="full"
              isDisabled={ !isValid || !isDirty}
              >
                Iniciar Sesión
              </Button>
            </VStack>
          </form>

          <Text mt={4} textAlign="center" fontSize="sm">
            ¿No tienes cuenta? <strong>Regístrate</strong>
          </Text>

          {resendSuccess && (
            <Alert status="success" mt={4}>
              <AlertIcon />
              {resendSuccess}
            </Alert>
          )}

          {showResend && (
            <Button
              onClick={handleResendVerification}
              variant="link"
              colorScheme="blue"
              size="sm"
              mt={2}
            >
              ¿No recibiste el correo? Reenviar verificación
            </Button>
          )}
        </Box>
      </Box>
    </>
  );
};

export default LoginPage;
