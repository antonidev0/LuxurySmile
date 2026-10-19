import { Box, Container, Flex, Heading, Icon, Image, SimpleGrid, Stack, Text } from "@chakra-ui/react";
import { FiCpu, FiHeart, FiShield, FiSmile } from "react-icons/fi";
import photo from "../../assets/images/fotografia.jpeg";
import Reveal from "../ui/Reveal";
import SectionHeading from "../ui/SectionHeading";

const REASONS = [
  { icon: FiCpu, title: "Diagnóstico digital", text: "Escáner intraoral 3D y radiografía digital: más precisión y menos radiación." },
  { icon: FiHeart, title: "Trato cercano", text: "Te explicamos cada paso y diseñamos el plan contigo, sin sorpresas." },
  { icon: FiShield, title: "Bioseguridad", text: "Protocolos de esterilización estrictos en cada consulta." },
  { icon: FiSmile, title: "Resultados naturales", text: "Estética que respeta la forma de tu rostro y tu personalidad." },
];

const WhyUs = () => (
  <Box py={{ base: 16, md: 24 }} bg="white">
    <Container maxW="7xl" px={{ base: 4, md: 8 }}>
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 10, lg: 16 }} alignItems="center">
        <Reveal>
          <Box position="relative">
            <Image src={photo} alt="Paciente sonriendo en LuxurySmile" borderRadius="3xl" objectFit="cover" w="full" h={{ base: "320px", md: "480px" }} />
            <Box
              position="absolute"
              bottom={{ base: -6, md: -8 }}
              right={{ base: 4, md: -6 }}
              bg="brand.900"
              color="white"
              p={{ base: 4, md: 6 }}
              borderRadius="2xl"
              boxShadow="lift"
              maxW="230px"
            >
              <Text fontFamily="heading" fontSize="3xl" color="gold.300">
                3D
              </Text>
              <Text fontSize="sm" color="whiteAlpha.800">
                Escaneo intraoral sin moldes incómodos
              </Text>
            </Box>
          </Box>
        </Reveal>

        <Box>
          <SectionHeading
            align="left"
            eyebrow="Por qué elegirnos"
            title="Precisión clínica con calidez humana"
            description="Combinamos experiencia profesional con tecnología de vanguardia para que cada tratamiento sea cómodo, rápido y seguro."
            mb={8}
          />
          <Stack spacing={6}>
            {REASONS.map((reason, i) => (
              <Reveal key={reason.title} delay={i * 0.08}>
                <Flex gap={4}>
                  <Flex boxSize={11} borderRadius="xl" bg="brand.50" color="brand.600" align="center" justify="center" flexShrink={0}>
                    <Icon as={reason.icon} boxSize={5} />
                  </Flex>
                  <Box>
                    <Heading as="h3" fontSize="lg" fontFamily="body" fontWeight="700">
                      {reason.title}
                    </Heading>
                    <Text color="text.muted" fontSize="sm" mt={1}>
                      {reason.text}
                    </Text>
                  </Box>
                </Flex>
              </Reveal>
            ))}
          </Stack>
        </Box>
      </SimpleGrid>
    </Container>
  </Box>
);

export default WhyUs;
