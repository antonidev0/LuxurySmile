import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  IconButton,
  Image,
  Input,
  InputGroup,
  InputRightElement,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FiArrowLeft, FiEye, FiEyeOff } from "react-icons/fi";
import { Link, Navigate, useNavigate } from "react-router-dom";
import loginImage from "../../assets/images/img-about.jpg";
import Logo from "../../components/ui/Logo";
import { dashboardHome } from "../../constants/navigation";
import { useAuth } from "../../context/AuthContext";
import { getErrorMessage } from "../../services/api";
import { resendVerification } from "../../services/auth.service";

const LoginPage = () => {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendMsg, setResendMsg] = useState(null);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm();

  if (isAuthenticated) return <Navigate to={dashboardHome(user.role)} replace />;

  const onSubmit = async (data) => {
    setErrorMsg("");
    setResendMsg(null);
    setNeedsVerification(false);
    try {
      const loggedUser = await login(data);
      navigate(dashboardHome(loggedUser.role), { replace: true });
    } catch (error) {
      setErrorMsg(error.response ? getErrorMessage(error) : "No hay conexión con el servidor.");
      if (error.response?.status === 403) setNeedsVerification(true);
    }
  };

  const handleResend = async () => {
    try {
      await resendVerification(getValues("email"));
      setResendMsg({ status: "success", text: "Te reenviamos el correo de verificación." });
    } catch (error) {
      setResendMsg({ status: "error", text: getErrorMessage(error, "No se pudo reenviar el correo.") });
    }
  };

  return (
    <Flex minH="100vh" bg="ivory">
      <Box flex="1" position="relative" display={{ base: "none", lg: "block" }}>
        <Image src={loginImage} alt="" position="absolute" inset={0} w="full" h="full" objectFit="cover" />
        <Box position="absolute" inset={0} bgGradient="linear(to-t, rgba(8,28,33,0.9), rgba(8,28,33,0.35))" />
        <Box position="absolute" bottom={12} left={12} right={12} color="white">
          <Heading color="white" fontSize="4xl" mb={3}>
            Panel de la clínica
          </Heading>
          <Text color="whiteAlpha.800" maxW="md">
            Gestiona citas, pacientes e historias clínicas desde un solo lugar.
          </Text>
        </Box>
      </Box>

      <Flex flex="1" align="center" justify="center" px={{ base: 5, md: 10 }} py={10}>
        <Box w="full" maxW="400px">
          <Button as={Link} to="/" variant="ghost" size="sm" leftIcon={<FiArrowLeft />} mb={8} ml={-3}>
            Volver al sitio
          </Button>
          <Logo h={10} />
          <Heading as="h1" fontSize="3xl" mt={8} mb={2}>
            Iniciar sesión
          </Heading>
          <Text color="text.muted" mb={8}>
            Acceso para el personal de LuxurySmile.
          </Text>

          {errorMsg && (
            <Alert status="error" mb={6} borderRadius="lg">
              <AlertIcon />
              <AlertDescription fontSize="sm">{errorMsg}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Stack spacing={5}>
              <FormControl isInvalid={Boolean(errors.email)}>
                <FormLabel fontSize="sm" fontWeight="600">
                  Correo electrónico
                </FormLabel>
                <Input type="email" autoComplete="email" placeholder="ejemplo@correo.com" bg="white" {...register("email", { required: "El correo es obligatorio" })} />
                <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={Boolean(errors.password)}>
                <FormLabel fontSize="sm" fontWeight="600">
                  Contraseña
                </FormLabel>
                <InputGroup>
                  <Input
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    bg="white"
                    {...register("password", { required: "La contraseña es obligatoria" })}
                  />
                  <InputRightElement>
                    <IconButton
                      size="sm"
                      variant="ghost"
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      icon={showPassword ? <FiEyeOff /> : <FiEye />}
                      onClick={() => setShowPassword((v) => !v)}
                    />
                  </InputRightElement>
                </InputGroup>
                <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
              </FormControl>

              <Button type="submit" size="lg" isLoading={isSubmitting}>
                Entrar
              </Button>
            </Stack>
          </form>

          {needsVerification && (
            <Button onClick={handleResend} variant="link" size="sm" mt={4}>
              ¿No recibiste el correo? Reenviar verificación
            </Button>
          )}
          {resendMsg && (
            <Alert status={resendMsg.status} mt={4} borderRadius="lg" fontSize="sm">
              <AlertIcon />
              {resendMsg.text}
            </Alert>
          )}

          <Text mt={8} fontSize="sm" color="text.muted">
            ¿No tienes cuenta? Pide al administrador de la clínica que te registre.
          </Text>
        </Box>
      </Flex>
    </Flex>
  );
};

export default LoginPage;
