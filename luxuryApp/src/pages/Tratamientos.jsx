import React, { useEffect } from "react";
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Icon,
  Flex,
  Image,
} from "@chakra-ui/react";
import {
  MdMedicalServices,
  MdLocalHospital,
  MdHealthAndSafety,
  MdEmojiEmotions,
  MdCleaningServices,
} from "react-icons/md";
import AOS from "aos";
import "aos/dist/aos.css";
import Navbar from "../components/Nav";
import Footer from "../components/Footer";
import smilingWoman from "../assets/Fotografia.jpeg"; 
// Al inicio del archivo 
import limpiezaImg from "../assets/Fotografia.jpeg"; // Asegúrate de que estos existen
import limpiezaVideo from "../assets/consulta.mp4";
import tratamient from "../assets/tratamient.mp4";  
import sonrisa from "../assets/sonrisa3.jpg"; 
import sonrisa2 from "../assets/sonrisa2.webp";
import video3 from "../assets/desing.mp4"; // Asegúrate de que estos existen

const services = [
  {
    title: "Odontología General",
    description: "Diagnóstico, prevención y tratamiento de problemas dentales comunes.",
    icon: MdMedicalServices,
    color: "blue.500",
  },
  {
    title: "Ortodoncia",
    description: "Corrige la alineación de los dientes con brackets o alineadores invisibles.",
    icon: MdHealthAndSafety,
    color: "teal.500",
  },
  {
    title: "Estética Dental",
    description: "Mejora tu sonrisa con carillas, blanqueamiento y diseño digital de sonrisa.",
    icon: MdEmojiEmotions,
    color: "pink.400",
  },
  {
    title: "Limpiezas Profesionales",
    description: "Eliminación de placa y sarro para mantener tu salud bucal.",
    icon: MdCleaningServices,
    color: "green.400",
  },
  {
    title: "Emergencias Dentales",
    description: "Atención inmediata a dolores, fracturas o infecciones dentales.",
    icon: MdLocalHospital,
    color: "red.500",
  },
];

const Tratamientos = () => {
  useEffect(() => {
    AOS.init({ duration: 800 });
  }, []);

  return (
    <> 
    <Navbar />
      {/* Servicio 1: Imagen derecha */}
      <Box
        h={{ base: "auto", md: "100vh" }}
        px={{ base: 4, md: 20 }}
        pt={{ base: 20, md: 28, "2xl": 80 }}
        bgImage={`url(${limpiezaImg})`} // Fondo de imagen
        bgSize="cover"
        bgPosition="center"
        bgRepeat="no-repeat"
        position="relative"
        data-aos="fade-left"
      >
      {/* Overlay blanco con opacidad para mejor contraste */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="rgba(255,255,255,0.85)"
          zIndex={0}
        />
          <Flex
            direction={{ base: "column", md: "row-reverse" }}
            justifyContent="center"
            align="center"
            gap={{ base: 8, md: 10 }}
            position="relative"
            zIndex={1}
          >

           {/*Video a la derecha */}
            <Box w={{ base: "40%", md: "20%" }}>
              <Box
                borderRadius="2xl"
                overflow="hidden"
                boxShadow="2xl"
                as="video"
                src={limpiezaVideo}
                autoPlay
                muted
                loop
                playsInline
                objectFit="cover" 
              />
            </Box>
              {/* Texto a la izquierda */}
            <Box w={{ base: "100%", md: "50%" }} textAlign="center">
              <Heading size={{base: "lg", "2xl": "4xl" }} mb={4}>Limpieza Dental Profesional</Heading>
                <Text fontSize={{base: "md", md:"lg", "2xl": "6xl"}} color="gray.700">
                  Las limpiezas dentales son esenciales para prevenir enfermedades como la gingivitis y
                  periodontitis. Eliminamos el sarro y la placa bacteriana, dejando tu sonrisa fresca,
                  brillante y saludable. Un tratamiento rápido, indoloro y fundamental para una sonrisa saludable.
                </Text>
            </Box>
          </Flex>
      </Box>
      {/* Servicio 2: Imagen izquierda */}
      <Box 
      h={"90vh"} 
        bgImage={`url(${sonrisa})`} // Fondo de imagen
        bgSize="cover"
        bgPosition="center"
        bgRepeat="no-repeat"
        position="relative"
        data-aos="fade-right"
        justifyContent="center"
        alignItems="center"
        display={"flex"}
      >
      {/* Overlay blanco con opacidad para mejor contraste */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="rgba(255,255,255,0.40)"
          zIndex={0}
        />
          <Flex
            direction={{ base: "column", md: "row" }}
            justifyContent="center"
            align="center"
            gap={{ base: 8, md: 10 }}
            position="relative"
            zIndex={1}
          >

           {/*Video a la izquierda */}
            <Box w={{ base: "80%", md: "40%" }}>
              <Box
                borderRadius="2xl"
                overflow="hidden"
                boxShadow="2xl"
                as="video"
                src={tratamient}
                autoPlay
                muted
                loop
                playsInline
                objectFit="cover" 
              />
            </Box>
              {/* Texto a la derecha */}
            <Box data-aos="fade-left" w={{ base: "100%", md: "50%" }} textAlign="center">
              <Heading size={{base: "lg", "2xl": "4xl" }} mb={4}>Ortodoncia</Heading>
                <Text fontSize={{base: "md", md:"lg", "2xl": "6xl"}} fontWeight={"bold"} color={"blackAlpha.900"}>
                  Corregimos la posición de los dientes y la mandíbula con tratamientos ortodónticos
                  personalizados. Desde brackets tradicionales hasta alineadores invisibles, tenemos
                  la solución perfecta para ti.
                </Text>
            </Box>
          </Flex>
      </Box>

      {/* Servicio 3: Imagen izquierda */}
      <Box 
        h={"90vh"} 
        bgImage={`url(${sonrisa2})`} // Fondo de imagen
        bgSize="cover"
        bgPosition="center"
        bgRepeat="no-repeat"
        position="relative"
        data-aos="fade-up"
        justifyContent="center"
        alignItems="center"
        display={"flex"}
      >
      {/* Overlay blanco con opacidad para mejor contraste */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="rgba(255,255,255,0.40)"
          zIndex={0}
        />
          <Flex
            direction={{ base: "column", md: "row-reverse" }}
            justifyContent="center"
            align="center"
            gap={{ base: 8, md: 10 }}
            position="relative"
            zIndex={1}
          >

           {/*Video a la izquierda */}
            <Box w={{ base: "80%", md: "40%" }}>
              <Box
                borderRadius="2xl"
                overflow="hidden"
                boxShadow="2xl"
                as="video"
                src={video3}
                autoPlay
                muted
                loop
                playsInline
                objectFit="cover" 
              />
            </Box>
              {/* Texto a la derecha */}
            <Box data-aos="fade-down" w={{ base: "100%", md: "50%" }} textAlign="center">
              <Heading size={{base: "lg", "2xl": "4xl" }} mb={4}>Diseño de Sonrisa</Heading>
                <Text fontSize={{base: "md", md:"lg", "2xl": "6xl"}} color={"blackAlpha.900"}>
                 El diseño de sonrisas combina arte y ciencia para crear una sonrisa
                 armónica, estética y personalizada. A través de análisis digitales,
                 carillas, blanqueamientos y otros tratamientos, transformamos
                 tu expresión facial para reflejar seguridad, juventud y
                 belleza. Cada sonrisa es única, y nosotros la diseñamos
                 para que sea inolvidable.
                </Text>
            </Box>
          </Flex>
      </Box>


    <Footer />
    </>
  );
};

export default Tratamientos;
