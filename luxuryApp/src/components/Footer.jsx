import { Box, Flex, Image, Text, VStack, HStack, Link, SimpleGrid } from "@chakra-ui/react";
import { FaInstagram, FaWhatsapp } from "react-icons/fa";
import AOS from 'aos';
import 'aos/dist/aos.css'; 
import React, { useEffect } from "react";
import logoFooter from "../assets/logoFooter.jpg";
 
const Footer = () => {
    useEffect(() => { AOS.init(); }, []);
  return (
    <Box  data-aos="fade-up" data-aos-duration="800" bg="gray.600" color="white" py={10} px={6} top={0} right={0} left={0}>
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
        {/* Columna 1: Logo y frase */}
        <Flex direction="column" align={"center"} display={"flex"} justifyContent={"center"}>
          <Image rounded={100} src={logoFooter} alt="LuxurySmile" boxSize="60px" mb={3} />
          <Text fontSize="lg" fontWeight="semibold" textAlign={"center"}>
            Transformamos sonrisas, <br />
            transformamos vidas.
          </Text>
        </Flex>

        {/* Columna 2: Enlaces */}
        <VStack align={"center"} spacing={2}>
          <Text fontWeight="bold" fontSize="md" mb={1}>Enlaces útiles</Text>
          <Link href="/">Inicio</Link>
          <Link href="/services">Tratamientos</Link>
          <Link href="/nosotros">Nosotros</Link>
          <Link href="/solicitar-cita">Reservar Cita</Link>
        </VStack>

        {/* Columna 3: Contacto y redes */}
        <VStack align={"center"} spacing={2}>
          <Text fontWeight="bold" fontSize="md" mb={1}>Contáctanos</Text>
          <Text textAlign={"center"}>Isla de Maargarita. CC, Provemed Piso 1 Local P16</Text>
          <Text>Tel: +58 424-9022442</Text>
          <Text>Email: contacto@luxurysmile.com</Text>
          <Text>Lun - Vie: 8:00am - 5:00pm</Text>

          <HStack spacing={4} mt={2}>
            <Link href="https://instagram.com/od_luxurysmile" isExternal>
              <FaInstagram size={22} />
            </Link>
            <Link href="https://wa.me/584141234567" isExternal>
              <FaWhatsapp size={22} />
            </Link>
          </HStack>
        </VStack>
      </SimpleGrid>

      <Text mt={10} textAlign="center" fontSize="sm" color="gray.300">
        © {new Date().getFullYear()} LuxurySmile. Todos los derechos reservados.
      </Text>
    </Box>
  );
};

export default Footer;
