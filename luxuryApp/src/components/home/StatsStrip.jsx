import { Box, Container, SimpleGrid, Text } from "@chakra-ui/react";
import Reveal from "../ui/Reveal";

const STATS = [
  { value: "Lun – Sáb", label: "8:00 a. m. a 5:00 p. m." },
  { value: "6", label: "Especialidades" },
  { value: "40 min", label: "Por consulta, sin prisas" },
  { value: "100%", label: "Historias digitales" },
];

const StatsStrip = () => (
  <Box bg="brand.900" color="white" py={{ base: 10, md: 12 }}>
    <Container maxW="7xl" px={{ base: 4, md: 8 }}>
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={{ base: 8, md: 6 }}>
        {STATS.map((stat, i) => (
          <Reveal key={stat.label} delay={i * 0.08} textAlign="center">
            <Text fontFamily="heading" fontSize={{ base: "3xl", md: "4xl" }} color="gold.300">
              {stat.value}
            </Text>
            <Text fontSize="sm" color="whiteAlpha.800">
              {stat.label}
            </Text>
          </Reveal>
        ))}
      </SimpleGrid>
    </Container>
  </Box>
);

export default StatsStrip;
