import { Box, Button, Container, Heading, Stack, Text } from "@chakra-ui/react";
import { FaWhatsapp } from "react-icons/fa";
import { FiCalendar } from "react-icons/fi";
import { Link } from "react-router-dom";
import { CLINIC } from "../../constants/clinic";
import Reveal from "../ui/Reveal";

const CallToAction = ({ title = "¿Listo para tu nueva sonrisa?", text = "Reserva tu evaluación hoy. Te confirmamos la cita y te asignamos al especialista ideal." }) => (
  <Box py={{ base: 12, md: 20 }}>
    <Container maxW="6xl" px={{ base: 4, md: 8 }}>
      <Reveal>
        <Box
          position="relative"
          overflow="hidden"
          borderRadius="3xl"
          bgGradient="linear(135deg, brand.800, brand.900)"
          color="white"
          px={{ base: 6, md: 16 }}
          py={{ base: 12, md: 16 }}
          textAlign="center"
        >
          <Box position="absolute" top="-40%" right="-10%" boxSize="420px" borderRadius="full" bg="gold.400" opacity={0.12} filter="blur(40px)" />
          <Heading color="white" fontSize={{ base: "3xl", md: "5xl" }} mb={4} position="relative">
            {title}
          </Heading>
          <Text color="whiteAlpha.800" fontSize={{ base: "md", md: "lg" }} maxW="2xl" mx="auto" mb={8} position="relative">
            {text}
          </Text>
          <Stack direction={{ base: "column", sm: "row" }} spacing={3} justify="center" position="relative">
            <Button as={Link} to="/agendar" size="lg" colorScheme="gold" color="brand.900" leftIcon={<FiCalendar />}>
              Agendar cita
            </Button>
            <Button as="a" href={CLINIC.whatsapp} target="_blank" rel="noreferrer" size="lg" variant="outline" color="white" borderColor="whiteAlpha.500" _hover={{ bg: "whiteAlpha.100" }} leftIcon={<FaWhatsapp />}>
              Escríbenos
            </Button>
          </Stack>
        </Box>
      </Reveal>
    </Container>
  </Box>
);

export default CallToAction;
