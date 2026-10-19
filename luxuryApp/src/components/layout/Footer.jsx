import { Box, Container, Divider, Flex, HStack, Icon, Link, SimpleGrid, Stack, Text } from "@chakra-ui/react";
import { FaInstagram, FaWhatsapp } from "react-icons/fa";
import { FiClock, FiMail, FiMapPin, FiPhone } from "react-icons/fi";
import { Link as RouterLink } from "react-router-dom";
import { CLINIC, PUBLIC_LINKS } from "../../constants/clinic";
import Logo from "../ui/Logo";

const FooterTitle = ({ children }) => (
  <Text fontSize="xs" fontWeight="700" letterSpacing="0.18em" textTransform="uppercase" color="gold.300" mb={4}>
    {children}
  </Text>
);

const ContactLine = ({ icon, children }) => (
  <HStack align="flex-start" spacing={3} color="whiteAlpha.800" fontSize="sm">
    <Icon as={icon} mt={0.5} flexShrink={0} />
    <Box>{children}</Box>
  </HStack>
);

const Footer = () => (
  <Box as="footer" bg="brand.900" color="white" pt={{ base: 14, md: 20 }} pb={8}>
    <Container maxW="7xl" px={{ base: 4, md: 8 }}>
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={{ base: 10, lg: 12 }}>
        <Stack spacing={4}>
          <Logo invert h={10} />
          <Text color="whiteAlpha.700" fontSize="sm" maxW="xs">
            {CLINIC.tagline} Odontología estética y general con tecnología digital y atención personalizada.
          </Text>
          <HStack spacing={3}>
            <Link href={CLINIC.instagram} isExternal aria-label="Instagram" p={2} borderRadius="full" bg="whiteAlpha.100" _hover={{ bg: "whiteAlpha.200" }}>
              <Icon as={FaInstagram} boxSize={5} />
            </Link>
            <Link href={CLINIC.whatsapp} isExternal aria-label="WhatsApp" p={2} borderRadius="full" bg="whiteAlpha.100" _hover={{ bg: "whiteAlpha.200" }}>
              <Icon as={FaWhatsapp} boxSize={5} />
            </Link>
          </HStack>
        </Stack>

        <Box>
          <FooterTitle>Navegación</FooterTitle>
          <Stack spacing={2.5} fontSize="sm">
            {PUBLIC_LINKS.map((link) => (
              <Link key={link.to} as={RouterLink} to={link.to} color="whiteAlpha.800" _hover={{ color: "white" }}>
                {link.label}
              </Link>
            ))}
            <Link as={RouterLink} to="/agendar" color="whiteAlpha.800" _hover={{ color: "white" }}>
              Agendar cita
            </Link>
            <Link as={RouterLink} to="/login" color="whiteAlpha.800" _hover={{ color: "white" }}>
              Acceso personal
            </Link>
          </Stack>
        </Box>

        <Box>
          <FooterTitle>Contacto</FooterTitle>
          <Stack spacing={3}>
            <ContactLine icon={FiMapPin}>{CLINIC.address}</ContactLine>
            <ContactLine icon={FiPhone}>
              <Link href={`tel:${CLINIC.phone.replace(/[^+\d]/g, "")}`}>{CLINIC.phone}</Link>
            </ContactLine>
            <ContactLine icon={FiMail}>
              <Link href={`mailto:${CLINIC.email}`}>{CLINIC.email}</Link>
            </ContactLine>
          </Stack>
        </Box>

        <Box>
          <FooterTitle>Horario</FooterTitle>
          <Stack spacing={3}>
            {CLINIC.hours.map((h) => (
              <ContactLine key={h.days} icon={FiClock}>
                <Text fontWeight="600" color="white">
                  {h.days}
                </Text>
                {h.time}
              </ContactLine>
            ))}
          </Stack>
        </Box>
      </SimpleGrid>

      <Divider my={10} borderColor="whiteAlpha.200" />
      <Flex justify="space-between" gap={2} direction={{ base: "column", md: "row" }} fontSize="xs" color="whiteAlpha.600">
        <Text>© {new Date().getFullYear()} LuxurySmile. Todos los derechos reservados.</Text>
        <Text>Hecho con dedicación en Isla de Margarita.</Text>
      </Flex>
    </Container>
  </Box>
);

export default Footer;
