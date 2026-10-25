import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Container,
  Flex,
  Heading,
  Icon,
  List,
  ListIcon,
  ListItem,
  SimpleGrid,
  Text,
} from "@chakra-ui/react";
import { FiCheck } from "react-icons/fi";
import consultaPoster from "../../assets/images/consulta-poster.jpg";
import disenoPoster from "../../assets/images/diseno-sonrisa-poster.jpg";
import heroImage from "../../assets/images/fotografia.jpeg";
import ortodonciaPoster from "../../assets/images/ortodoncia-poster.jpg";
import consultaVideo from "../../assets/videos/consulta.mp4";
import disenoVideo from "../../assets/videos/diseno-sonrisa.mp4";
import ortodonciaVideo from "../../assets/videos/ortodoncia.mp4";
import CallToAction from "../../components/home/CallToAction";
import PageHero from "../../components/ui/PageHero";
import Reveal from "../../components/ui/Reveal";
import SectionHeading from "../../components/ui/SectionHeading";
import { TREATMENTS } from "../../constants/treatments";

const FEATURED = [
  {
    id: "limpieza",
    title: "Limpieza dental profesional",
    text: "Las limpiezas son esenciales para prevenir gingivitis y periodontitis. Eliminamos el sarro y la placa bacteriana con ultrasonido, dejando tu sonrisa fresca, brillante y saludable. Un tratamiento rápido e indoloro.",
    video: consultaVideo,
    poster: consultaPoster,
    portrait: true,
  },
  {
    id: "ortodoncia",
    title: "Ortodoncia",
    text: "Corregimos la posición de los dientes y la mandíbula con tratamientos personalizados. Desde brackets tradicionales hasta alineadores invisibles, con controles periódicos y un plan claro desde el primer día.",
    video: ortodonciaVideo,
    poster: ortodonciaPoster,
  },
  {
    id: "diseno",
    title: "Diseño de sonrisa",
    text: "Combinamos arte y ciencia: análisis digital, carillas y blanqueamiento para una sonrisa armónica que refleje seguridad y naturalidad. Puedes ver el resultado antes de empezar.",
    video: disenoVideo,
    poster: disenoPoster,
  },
];

const FAQ = [
  { q: "¿Cuánto dura la primera consulta?", a: "Alrededor de 40 minutos. Incluye evaluación, diagnóstico y la propuesta de tratamiento." },
  { q: "¿Cómo pido una cita?", a: "Escríbenos por WhatsApp o llámanos de lunes a sábado. Nuestro equipo revisa los horarios libres y agenda tu cita." },
  { q: "¿Puedo ir hoy mismo?", a: "Si hay horarios libres, sí. Contáctanos y te diremos qué horas quedan disponibles para hoy." },
  { q: "¿Las limpiezas duelen?", a: "No. Usamos ultrasonido y técnicas suaves; la mayoría de pacientes solo siente una ligera vibración." },
];

const FeaturedTreatment = ({ item, reverse }) => {
  const treatment = TREATMENTS.find((t) => t.id === item.id);
  return (
    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 8, md: 14 }} alignItems="center">
      <Reveal order={{ base: 1, md: reverse ? 2 : 1 }}>
        <Box
          as="video"
          src={item.video}
          poster={item.poster}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          w="full"
          maxH={{ base: "420px", md: "520px" }}
          objectFit="cover"
          borderRadius="3xl"
          boxShadow="lift"
          mx="auto"
          sx={item.portrait ? { aspectRatio: "3 / 4", maxW: "380px" } : { aspectRatio: "16 / 10" }}
        />
      </Reveal>
      <Reveal order={{ base: 2, md: reverse ? 1 : 2 }} delay={0.1}>
        <Flex boxSize={12} borderRadius="xl" bg="gold.50" color="gold.600" align="center" justify="center" mb={5}>
          <Icon as={treatment.icon} boxSize={6} />
        </Flex>
        <Heading as="h2" fontSize={{ base: "3xl", md: "4xl" }} mb={4}>
          {item.title}
        </Heading>
        <Text color="text.muted" fontSize={{ base: "md", md: "lg" }} mb={6}>
          {item.text}
        </Text>
        <List spacing={2.5}>
          {treatment.includes.map((inc) => (
            <ListItem key={inc} display="flex" alignItems="center" fontSize="sm">
              <ListIcon as={FiCheck} color="brand.500" />
              {inc}
            </ListItem>
          ))}
        </List>
      </Reveal>
    </SimpleGrid>
  );
};

const TreatmentsPage = () => (
  <>
    <PageHero
      eyebrow="Tratamientos"
      title="Cuidamos cada detalle de tu sonrisa"
      description="Prevención, función y estética con un plan pensado solo para ti."
      image={heroImage}
    />

    <Box py={{ base: 16, md: 24 }}>
      <Container maxW="6xl" px={{ base: 4, md: 8 }}>
        <Box display="grid" gap={{ base: 16, md: 28 }}>
          {FEATURED.map((item, i) => (
            <FeaturedTreatment key={item.id} item={item} reverse={i % 2 === 1} />
          ))}
        </Box>
      </Container>
    </Box>

    <Box py={{ base: 16, md: 24 }} bg="white">
      <Container maxW="7xl" px={{ base: 4, md: 8 }}>
        <SectionHeading eyebrow="Servicios" title="Todos nuestros tratamientos" />
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={{ base: 4, md: 6 }}>
          {TREATMENTS.map((t, i) => (
            <Reveal key={t.id} delay={(i % 3) * 0.08}>
              <Box h="full" p={7} borderRadius="2xl" bg="ivory" borderWidth="1px" borderColor="border.subtle">
                <Flex align="center" gap={3} mb={3}>
                  <Icon as={t.icon} boxSize={6} color="gold.500" />
                  <Heading as="h3" fontSize="xl">
                    {t.title}
                  </Heading>
                </Flex>
                <Text color="text.muted" fontSize="sm" mb={4}>
                  {t.short}
                </Text>
                <List spacing={1.5}>
                  {t.includes.map((inc) => (
                    <ListItem key={inc} fontSize="sm" display="flex" alignItems="center">
                      <ListIcon as={FiCheck} color="brand.500" />
                      {inc}
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Reveal>
          ))}
        </SimpleGrid>
      </Container>
    </Box>

    <Box py={{ base: 16, md: 24 }}>
      <Container maxW="3xl" px={{ base: 4, md: 8 }}>
        <SectionHeading eyebrow="Preguntas frecuentes" title="Resolvemos tus dudas" />
        <Accordion allowToggle>
          {FAQ.map((item) => (
            <AccordionItem key={item.q} borderColor="border.subtle">
              <AccordionButton py={5} _hover={{ bg: "transparent", color: "brand.700" }}>
                <Text flex="1" textAlign="left" fontWeight="600">
                  {item.q}
                </Text>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={5} color="text.muted">
                {item.a}
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      </Container>
    </Box>

    <CallToAction />
  </>
);

export default TreatmentsPage;
