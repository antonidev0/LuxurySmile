import { Box, Container, Flex, Heading, Icon, Image, SimpleGrid, Stack, Text } from "@chakra-ui/react";
import { FaBalanceScale, FaHandshake, FaHeart, FaTooth } from "react-icons/fa";
import { FiCpu, FiMonitor, FiAperture, FiSettings } from "react-icons/fi";
import disenoPoster from "../../assets/images/diseno-sonrisa-poster.jpg";
import fondoClinica from "../../assets/images/fondo-clinica.webp";
import fondoTech from "../../assets/images/fondoTech.jpg";
import imgAbout from "../../assets/images/img-about.jpg";
import disenoVideo from "../../assets/videos/diseno-sonrisa.mp4";
import CallToAction from "../../components/home/CallToAction";
import PageHero from "../../components/ui/PageHero";
import Reveal from "../../components/ui/Reveal";
import SectionHeading from "../../components/ui/SectionHeading";

const VALUES = [
  { icon: FaBalanceScale, title: "Ética profesional", text: "Actuamos con integridad, responsabilidad y respeto en cada tratamiento.", color: "brand" },
  { icon: FaHeart, title: "Empatía", text: "Nos ponemos en tu lugar para brindarte una atención cercana y humana.", color: "pink" },
  { icon: FaTooth, title: "Innovación", text: "Usamos tecnología de vanguardia para lograr resultados excepcionales.", color: "purple" },
  { icon: FaHandshake, title: "Excelencia", text: "Cuidamos cada detalle para ofrecerte la mejor experiencia odontológica.", color: "green" },
];

const TECH = [
  { icon: FiAperture, title: "Escáner intraoral 3D", text: "Escaneo digital sin moldes: más precisión, comodidad y rapidez." },
  { icon: FiMonitor, title: "Diseño digital de sonrisa", text: "Visualiza tu sonrisa ideal antes de comenzar el tratamiento." },
  { icon: FiCpu, title: "Radiografía panorámica digital", text: "Diagnóstico detallado con menor exposición a la radiación." },
  { icon: FiSettings, title: "Sillones inteligentes", text: "Comodidad total con tecnología ergonómica y automatizada." },
];

const AboutPage = () => (
  <>
    <PageHero eyebrow="Nosotros" title="Diseñamos sonrisas que transforman vidas" image={fondoClinica} />

    <Box py={{ base: 16, md: 24 }}>
      <Container maxW="7xl" px={{ base: 4, md: 8 }}>
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 10, lg: 16 }} alignItems="center">
          <Reveal>
            <Image src={imgAbout} alt="Consultorio de LuxurySmile" borderRadius="3xl" w="full" h={{ base: "300px", md: "460px" }} objectFit="cover" />
          </Reveal>
          <Stack spacing={8}>
            <SectionHeading align="left" eyebrow="Quiénes somos" title="Odontología ética, cálida y de vanguardia" mb={0} />
            <Reveal>
              <Box borderLeftWidth="3px" borderColor="gold.300" pl={5}>
                <Heading as="h3" fontSize="xl" mb={2}>
                  Misión
                </Heading>
                <Text color="text.muted">
                  Brindar una atención odontológica ética, cálida y de vanguardia, ayudando a nuestros pacientes a
                  recuperar no solo su salud bucal, sino también su confianza y bienestar.
                </Text>
              </Box>
            </Reveal>
            <Reveal delay={0.1}>
              <Box borderLeftWidth="3px" borderColor="brand.400" pl={5}>
                <Heading as="h3" fontSize="xl" mb={2}>
                  Visión
                </Heading>
                <Text color="text.muted">
                  Convertirnos en la clínica de referencia en odontología estética y personalizada del país.
                </Text>
              </Box>
            </Reveal>
          </Stack>
        </SimpleGrid>
      </Container>
    </Box>

    <Box py={{ base: 16, md: 24 }} bg="white">
      <Container maxW="7xl" px={{ base: 4, md: 8 }}>
        <SectionHeading eyebrow="Nuestros valores" title="Lo que nos define" />
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={{ base: 4, md: 6 }}>
          {VALUES.map((v, i) => (
            <Reveal key={v.title} delay={i * 0.08}>
              <Box h="full" p={7} borderRadius="2xl" bg="ivory" borderWidth="1px" borderColor="border.subtle" textAlign="center" transition="transform .3s" _hover={{ transform: "translateY(-4px)" }}>
                <Flex boxSize={14} mx="auto" borderRadius="full" bg={`${v.color}.50`} color={`${v.color}.500`} align="center" justify="center" mb={5}>
                  <Icon as={v.icon} boxSize={6} />
                </Flex>
                <Heading as="h3" fontSize="xl" mb={2}>
                  {v.title}
                </Heading>
                <Text color="text.muted" fontSize="sm">
                  {v.text}
                </Text>
              </Box>
            </Reveal>
          ))}
        </SimpleGrid>
      </Container>
    </Box>

    <Box position="relative" py={{ base: 16, md: 24 }} bgImage={`url(${fondoTech})`} bgSize="cover" bgPosition="center" color="white">
      <Box position="absolute" inset={0} bg="rgba(8,28,33,0.88)" />
      <Container maxW="7xl" px={{ base: 4, md: 8 }} position="relative">
        <SectionHeading
          light
          eyebrow="Tecnología"
          title="Instalaciones de última generación"
          description="Equipamiento moderno para procedimientos más cómodos, rápidos y seguros."
        />
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 10, lg: 12 }} alignItems="center">
          <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
            {TECH.map((t, i) => (
              <Reveal key={t.title} delay={i * 0.08}>
                <Box h="full" p={6} borderRadius="2xl" bg="whiteAlpha.100" borderWidth="1px" borderColor="whiteAlpha.200">
                  <Icon as={t.icon} boxSize={6} color="gold.300" mb={4} />
                  <Heading as="h3" color="white" fontSize="lg" fontFamily="body" fontWeight="700" mb={2}>
                    {t.title}
                  </Heading>
                  <Text color="whiteAlpha.800" fontSize="sm">
                    {t.text}
                  </Text>
                </Box>
              </Reveal>
            ))}
          </SimpleGrid>
          <Reveal delay={0.1}>
            <Box
              as="video"
              src={disenoVideo}
              poster={disenoPoster}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-label="Recorrido por las instalaciones"
              w="full"
              borderRadius="3xl"
              boxShadow="lift"
              objectFit="cover"
              sx={{ aspectRatio: "16 / 10" }}
            />
          </Reveal>
        </SimpleGrid>
      </Container>
    </Box>

    <CallToAction title="Ven a conocernos" />
  </>
);

export default AboutPage;
