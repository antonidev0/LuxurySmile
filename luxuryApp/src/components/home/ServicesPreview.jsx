import { Box, Button, Container, SimpleGrid } from "@chakra-ui/react";
import { FiArrowRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import { TREATMENTS } from "../../constants/treatments";
import Reveal from "../ui/Reveal";
import SectionHeading from "../ui/SectionHeading";
import TreatmentCard from "./TreatmentCard";

const ServicesPreview = () => (
  <Box py={{ base: 16, md: 24 }}>
    <Container maxW="7xl" px={{ base: 4, md: 8 }}>
      <SectionHeading
        eyebrow="Tratamientos"
        title="Todo lo que tu sonrisa necesita"
        description="Desde la revisión de rutina hasta el diseño completo de tu sonrisa, en un mismo lugar."
      />
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={{ base: 4, md: 6 }}>
        {TREATMENTS.map((treatment, i) => (
          <Reveal key={treatment.id} delay={(i % 3) * 0.08}>
            <TreatmentCard treatment={treatment} />
          </Reveal>
        ))}
      </SimpleGrid>
      <Box textAlign="center" mt={10}>
        <Button as={Link} to="/tratamientos" variant="ghost" rightIcon={<FiArrowRight />}>
          Conoce cada tratamiento
        </Button>
      </Box>
    </Container>
  </Box>
);

export default ServicesPreview;
