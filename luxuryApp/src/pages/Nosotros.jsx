import React from "react";
import {
  Box,
  Heading,
  Text,
  VStack,
  Container,
  SimpleGrid,
  Icon,
  Card,
  CardHeader,
  CardBody
} from "@chakra-ui/react";
import { FaBalanceScale, FaHeart, FaTooth, FaHandshake } from "react-icons/fa";
import Navbar from "../components/Nav";
import Footer from "../components/Footer";
import fondoClinica from "../assets/fondo-clinica.webp";
import imgAbout from "../assets/img-about.jpg";
import AOS from "aos";
import "aos/dist/aos.css";
import fondoTech from "../assets/fondoTech.jpg";
import videoClinica from "../assets/desing.mp4"; // Asegúrate de que estos existen

const AboutUs = () => {
  return (
    <>
      <Navbar />
      {/* Misión / visión resumidas. */}
      <Box
        pt={{ base: 20, md: 28, "2xl": 80 }}
        bgImage={`url(${fondoClinica})`}
        bgSize="cover"
        bgPosition="center"
        bgRepeat="no-repeat"
        minH={"100vh"}
        display="flex"
        alignItems="center"
        justifyContent="center"
        color="white"
        position="relative"
        _before={{
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          w: "100%",
          h: "100%",
          bg: "blackAlpha.700",
          zIndex: 0,
        }}
      >
        <Container maxW="4xl" zIndex={1} textAlign="center">
          <VStack spacing={6}>
            <Heading fontSize={{ base: "3xl", md: "5xl", "2xl": "9xl" }} fontWeight="bold">
              LuxurySmile
            </Heading>
            <Text fontSize={{ base: "md", md: "xl", "2xl": "5xl" }}>
              Diseñamos sonrisas que transforman vidas.
            </Text>
            <Text fontSize={{ base: "sm", md: "md", "2xl": "5xl" }} maxW="3xl">
              Nuestra misión es brindar una atención odontológica ética, cálida y de
              vanguardia, ayudando a nuestros pacientes a recuperar no solo su salud bucal,
              sino también su confianza y bienestar.
            </Text>
            <Text fontSize={{ base: "sm", md: "md", "2xl": "5xl" }} maxW="3xl">
              Nuestra visión es convertirnos en la clínica de referencia en odontología estética y personalizada en el Pais.
            </Text>
          </VStack>
        </Container>
      </Box>

      {/* Valores de la clínica */}
      <Box
        h={{ base: "auto", xl: "80vh" }}
        bgImage={`url(${imgAbout})`}
        bgSize="cover"
        bgPosition="center"
        bgRepeat="no-repeat"
        py={{ base: 10, md: 20 }}
        px={{ base: 4, md: 20 }}
        position="relative"
        _before={{
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          bg: "whiteAlpha.800", // Capa blanca semitransparente para legibilidad
          zIndex: 0,
        }}
      >
        <Heading
          textAlign="center"
          mb={10}
          position="relative" zIndex={1}
          fontSize={{ base: "3xl", md: "5xl", "2xl": "9xl" }}
          pb={{ base: "auto", "2xl": "7rem" }}
        >
          Nuestros Valores
        </Heading>

        <SimpleGrid columns={{ base: 1, xl: 4, "2xl": 2 }} spacing={8}>
          {/* Valor 1 */}
          <Card
            textAlign="center"
            p={6}
            shadow="lg"
            borderRadius="xl"
            bg="rgba(128, 128, 128, 0.4)"
            _hover={{ transform: "scale(1.05)", transition: "0.3s ease" }}
            data-aos="fade-left"
          >
            <CardHeader>
              <Icon as={FaBalanceScale} boxSize={10} color="blue.600" />
              <Heading fontSize={{ "2xl": "7xl" }} size="md" mt={4} color={"gray.900"}>
                Ética Profesional
              </Heading>
            </CardHeader>
            <CardBody>
              <Text fontSize={{ "2xl": "5xl" }} color={"gray.800"}>
                Actuamos con integridad, responsabilidad y respeto en cada tratamiento.
              </Text>
            </CardBody>
          </Card>

          {/* Valor 2 */}
          <Card
            textAlign="center"
            p={6}
            shadow="lg"
            borderRadius="xl"
            bg="rgba(128, 128, 128, 0.4)"
            _hover={{ transform: "scale(1.05)", transition: "0.3s ease" }}
            data-aos="fade-right"
          >
            <CardHeader>
              <Icon as={FaHeart} boxSize={10} color="pink.500" />
              <Heading fontSize={{ "2xl": "7xl" }} size="md" mt={4}>
                Empatía
              </Heading>
            </CardHeader>
            <CardBody>
              <Text fontSize={{ "2xl": "5xl" }} color="gray.900">
                Nos ponemos en tu lugar para brindarte una atención cercana y humana.
              </Text>
            </CardBody>
          </Card>

          {/* Valor 3 */}
          <Card
            textAlign="center"
            p={6}
            shadow="lg"
            borderRadius="xl"
            bg="rgba(128, 128, 128, 0.4)"
            _hover={{ transform: "scale(1.05)", transition: "0.3s ease" }}
            data-aos="fade-left"
          >
            <CardHeader>
              <Icon as={FaTooth} boxSize={10} color="purple.500" />
              <Heading fontSize={{ "2xl": "7xl" }} size="md" mt={4} color={"gray.900"}>
                Innovación
              </Heading>
            </CardHeader>
            <CardBody>
              <Text fontSize={{ "2xl": "5xl" }} color="gray.800">
                Usamos tecnología de vanguardia para lograr resultados excepcionales.
              </Text>
            </CardBody>
          </Card>

          {/* Valor 4 */}
          <Card
            textAlign="center"
            p={6}
            shadow="lg"
            borderRadius="xl"
            bg="rgba(128, 128, 128, 0.4)"
            _hover={{ transform: "scale(1.05)", transition: "0.3s ease" }}
            data-aos="fade-right"
          >
            <CardHeader>
              <Icon as={FaHandshake} boxSize={10} color="green.500" />
              <Heading fontSize={{ "2xl": "7xl" }} size="md" mt={4} color={"gray.900"}>
                Excelencia
              </Heading>
            </CardHeader>
            <CardBody>
              <Text fontSize={{ "2xl": "5xl" }} color="gray.800">
                Nos esmeramos en cada detalle para ofrecerte la mejor experiencia odontológica.
              </Text>
            </CardBody>
          </Card>
        </SimpleGrid>
      </Box>

      <Box
        bgImage={`url(${fondoTech})`}
        bgSize="cover"
        bgPosition="center"
        bgRepeat="no-repeat"
        py={{ base: 16, md: 24 }}
        px={{ base: 4, md: 12 }}
        position="relative"
        _before={{
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          w: "100%",
          h: "100%",
          bg: "blackAlpha.700",
          zIndex: 0,
        }}
      >
        <Container maxW="7xl" zIndex={1} position="relative" color="white">
          <Heading
            fontSize={{ base: "2xl", md: "4xl", "2xl": "5xl" }}
            textAlign="center"
            mb={8}
          >
            Tecnología e Instalaciones de Última Generación
          </Heading>

          <Text
            fontSize={{ base: "md", md: "lg", "2xl": "xl" }}
            textAlign="center"
            maxW="5xl"
            mx="auto"
            mb={10}
            color="gray.200"
          >
            En LuxurySmile, combinamos experiencia profesional con tecnología avanzada para brindar diagnósticos precisos y tratamientos personalizados. Nuestro equipamiento moderno permite procedimientos más cómodos, rápidos y seguros.
          </Text>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} data-aos="fade-left">
            <Box p={6} bg="whiteAlpha.100" rounded="xl" shadow="md" >
              <Heading fontSize="xl" mb={2}>Escáner Intraoral 3D</Heading>
              <Text color="gray.200">
                Escaneo digital sin impresiones físicas. Mayor precisión, comodidad y rapidez.
              </Text>
            </Box>

            <Box p={6} bg="whiteAlpha.100" rounded="xl" shadow="md">
              <Heading fontSize="xl" mb={2}>Diseño Digital de Sonrisa (DSD)</Heading>
              <Text color="gray.200">
                Visualiza tu sonrisa ideal antes de comenzar el tratamiento.
              </Text>
            </Box>

            <Box p={6} bg="whiteAlpha.100" rounded="xl" shadow="md">
              <Heading fontSize="xl" mb={2}>Radiografía Panorámica Digital</Heading>
              <Text color="gray.200">
                Diagnóstico detallado con menor exposición a la radiación.
              </Text>
            </Box>

            <Box p={6} bg="whiteAlpha.100" rounded="xl" shadow="md">
              <Heading fontSize="xl" mb={2}>Sillones Inteligentes</Heading>
              <Text color="gray.200">
                Comodidad total con tecnología ergonómica y automatizada.
              </Text>
            </Box>
          </SimpleGrid>

          <Box mt={16} textAlign="center">
            <Heading fontSize={{ base: "xl", md: "2xl" }} mb={4}>
              Conoce nuestras instalaciones
            </Heading>
            <Text color="gray.300" mb={6}>
              Un espacio moderno, cálido y equipado con la última tecnología.
            </Text>
            <Box
              as="video"
              src={videoClinica} 
              autoPlay
              loop
              muted 
              overflow="hidden"
              rounded="xl"
              mx="auto"
              shadow="2xl"
              width={{ base: "100%", md: "50%" }}
            />
          </Box>
        </Container>
      </Box>

      <Footer />
    </>
  );
};

export default AboutUs;
