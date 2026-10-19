import { Box, Container, Flex, Heading, SimpleGrid, Text } from "@chakra-ui/react";
import Reveal from "../ui/Reveal";
import SectionHeading from "../ui/SectionHeading";

const STEPS = [
  { title: "Solicita tu cita", text: "Elige día y hora disponibles en línea, en menos de un minuto." },
  { title: "Te confirmamos", text: "La clínica revisa tu solicitud y te asigna al especialista indicado." },
  { title: "Evaluación", text: "Diagnóstico completo y un plan de tratamiento claro, con presupuesto." },
  { title: "Tu nueva sonrisa", text: "Tratamiento y seguimiento con tu historia clínica siempre al día." },
];

const ProcessSteps = () => (
  <Box py={{ base: 16, md: 24 }}>
    <Container maxW="7xl" px={{ base: 4, md: 8 }}>
      <SectionHeading eyebrow="Cómo funciona" title="Cuatro pasos hacia tu mejor sonrisa" />
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={{ base: 6, md: 8 }}>
        {STEPS.map((step, i) => (
          <Reveal key={step.title} delay={i * 0.1}>
            <Box position="relative" pt={2}>
              <Flex align="center" gap={3} mb={4}>
                <Flex boxSize={10} borderRadius="full" bg="brand.900" color="gold.300" align="center" justify="center" fontFamily="heading" fontSize="lg">
                  {i + 1}
                </Flex>
                <Box flex="1" h="1px" bg="gold.200" display={{ base: "none", lg: i === STEPS.length - 1 ? "none" : "block" }} />
              </Flex>
              <Heading as="h3" fontSize="xl" mb={2}>
                {step.title}
              </Heading>
              <Text color="text.muted" fontSize="sm">
                {step.text}
              </Text>
            </Box>
          </Reveal>
        ))}
      </SimpleGrid>
    </Container>
  </Box>
);

export default ProcessSteps;
