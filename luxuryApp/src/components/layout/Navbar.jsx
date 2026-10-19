import {
  Box,
  Button,
  Container,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
  Flex,
  HStack,
  IconButton,
  VStack,
  useDisclosure,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { FiMenu } from "react-icons/fi";
import { Link, NavLink, useLocation } from "react-router-dom";
import { PUBLIC_LINKS } from "../../constants/clinic";
import { dashboardHome } from "../../constants/navigation";
import { useAuth } from "../../context/AuthContext";
import Logo from "../ui/Logo";

const linkStyles = {
  px: 3,
  py: 2,
  fontSize: "sm",
  fontWeight: 500,
  color: "gray.700",
  borderRadius: "full",
  transition: "color .2s, background .2s",
  _hover: { color: "brand.700", bg: "blackAlpha.50" },
  sx: { "&.active": { color: "brand.800", fontWeight: 700 } },
};

const Navbar = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isAuthenticated, user } = useAuth();
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Solo la portada (fondo claro) deja la barra transparente arriba del todo
  const solid = scrolled || pathname !== "/";

  // Cierra el menú móvil al cambiar de página
  useEffect(onClose, [pathname, onClose]);

  const staffLink = isAuthenticated
    ? { label: "Mi panel", to: dashboardHome(user.role) }
    : { label: "Acceso personal", to: "/login" };

  return (
    <Box
      as="header"
      position="fixed"
      top={0}
      insetX={0}
      zIndex="sticky"
      transition="background .3s, box-shadow .3s, backdrop-filter .3s"
      bg={solid ? "rgba(251, 249, 245, 0.9)" : "transparent"}
      backdropFilter={solid ? "saturate(180%) blur(12px)" : "none"}
      boxShadow={solid ? "0 1px 0 rgba(8,28,33,0.06)" : "none"}
    >
      <Container maxW="7xl" px={{ base: 4, md: 8 }}>
        <Flex h={{ base: 16, md: 20 }} align="center" justify="space-between" gap={4}>
          <Logo />

          <HStack as="nav" spacing={1} display={{ base: "none", md: "flex" }} aria-label="Principal">
            {PUBLIC_LINKS.map((link) => (
              <Box key={link.to} as={NavLink} to={link.to} end {...linkStyles}>
                {link.label}
              </Box>
            ))}
            <Box as={NavLink} to={staffLink.to} {...linkStyles}>
              {staffLink.label}
            </Box>
          </HStack>

          <HStack spacing={2}>
            <Button as={Link} to="/agendar" size={{ base: "sm", md: "md" }} colorScheme="brand" display={{ base: "none", sm: "inline-flex" }}>
              Agendar cita
            </Button>
            <IconButton
              aria-label="Abrir menú"
              icon={<FiMenu />}
              variant="ghost"
              display={{ base: "inline-flex", md: "none" }}
              onClick={onOpen}
            />
          </HStack>
        </Flex>
      </Container>

      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="xs">
        <DrawerOverlay />
        <DrawerContent bg="ivory">
          <DrawerCloseButton mt={2} />
          <DrawerBody pt={16}>
            <VStack align="stretch" spacing={1}>
              {[...PUBLIC_LINKS, staffLink].map((link) => (
                <Box key={link.to} as={NavLink} to={link.to} end {...linkStyles} fontSize="lg" py={3}>
                  {link.label}
                </Box>
              ))}
              <Button as={Link} to="/agendar" mt={4} size="lg">
                Agendar cita
              </Button>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default Navbar;
