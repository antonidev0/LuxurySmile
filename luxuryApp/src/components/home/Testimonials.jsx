import { Avatar, Box, Container, HStack, Icon, SimpleGrid, Text } from "@chakra-ui/react";
import { FaQuoteLeft, FaStar } from "react-icons/fa";
import Reveal from "../ui/Reveal";
import SectionHeading from "../ui/SectionHeading";

// Textos de ejemplo: sustituir por reseñas reales de pacientes
const TESTIMONIALS = [
  { name: "María G.", treatment: "Diseño de sonrisa", text: "Me explicaron todo con mucha paciencia y el resultado es tan natural que nadie cree que son carillas." },
  { name: "Luis R.", treatment: "Ortodoncia invisible", text: "Agendé en línea, me atendieron puntual y el seguimiento ha sido impecable. Muy recomendados." },
  { name: "Andrea P.", treatment: "Limpieza y blanqueamiento", text: "Tenía miedo al dentista y aquí fue totalmente distinto: cero dolor y un trato muy humano." },
];

const Testimonials = () => (
  <Box py={{ base: 16, md: 24 }} bg="white">
    <Container maxW="7xl" px={{ base: 4, md: 8 }}>
      <SectionHeading eyebrow="Testimonios" title="Lo que dicen nuestros pacientes" />
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: 4, md: 6 }}>
        {TESTIMONIALS.map((t, i) => (
          <Reveal key={t.name} delay={i * 0.1}>
            <Box h="full" p={7} borderRadius="2xl" bg="ivory" borderWidth="1px" borderColor="border.subtle">
              <Icon as={FaQuoteLeft} color="gold.300" boxSize={6} mb={4} />
              <Text color="gray.700" mb={6}>
                {t.text}
              </Text>
              <HStack spacing={3}>
                <Avatar size="sm" name={t.name} bg="brand.600" color="white" />
                <Box flex="1">
                  <Text fontWeight="600" fontSize="sm">
                    {t.name}
                  </Text>
                  <Text fontSize="xs" color="text.muted">
                    {t.treatment}
                  </Text>
                </Box>
                <HStack spacing={0.5} color="gold.400">
                  {Array.from({ length: 5 }, (_, s) => (
                    <Icon key={s} as={FaStar} boxSize={3} />
                  ))}
                </HStack>
              </HStack>
            </Box>
          </Reveal>
        ))}
      </SimpleGrid>
    </Container>
  </Box>
);

export default Testimonials;
