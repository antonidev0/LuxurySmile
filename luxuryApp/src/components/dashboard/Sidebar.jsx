import {
  Box,
  IconButton,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  VStack,
  HStack,
  Text,
  Icon,
  useDisclosure,
  useBreakpointValue,
} from "@chakra-ui/react";
import {
  FiMenu,
  FiHome,
  FiCalendar,
  FiUsers,
  FiUserCheck,
  FiUser,
  FiLogOut,
  FiEdit3,
  FiUserPlus,
} from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { label: "Inicio", icon: FiHome, path: "/admin/dashboard" },
  { label: "Calendario", icon: FiCalendar, path: "/admin/dashboard/calendario" },
  { label: "Pacientes", icon: FiUsers, path: "/admin/dashboard/pacientes" },
  { label: "Doctores", icon: FiUserCheck, path: "/admin/dashboard/doctors" },
  { label: "Registrar personal", icon: FiUserPlus, path: "/admin/dashboard/registro" },
  { label: "Asignar ", icon: FiEdit3, path: "/admin/dashboard/gestion" },
  { label: "Usuario", icon: FiUser, path: "/admin/dashboard/usuario"},
  { label: "Historias", icon: FiUser, path: "/admin/dashboard/historias" },
];

const Sidebar = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isMobile = useBreakpointValue({ base: true, md: false });
  const navigate = useNavigate();
   const { logout } = useAuth();

  const sidebarWidth = useBreakpointValue({
    base: "full",
    md: "250px",
    xl: "260px",
    "2xl": "300px", // Pantallas muy grandes
  });

  const iconSize = useBreakpointValue({
    base: 5,
    xl: 5,
    "2xl": 6, // íconos más grandes en pantallas grandes
  });

  const fontSize = useBreakpointValue({
    base: "md",
    xl: "md",
    "2xl": "2xl", // texto más grande en pantallas grandes
  });

  const paddingX = useBreakpointValue({
    base: 4,
    xl: 5,
    "2xl": 6, // más espacio horizontal
  });

  const NavLinks = () => (
    <VStack align="start" spacing={4} px={paddingX} py={6}>
      {navItems.map(({ label, icon, path }) => (
        <HStack
          as={Link}
          to={path}
          key={label}
          w="full"
          spacing={4}
          px={3}
          py={2}
          borderRadius="md"
          _hover={{ bg: "blue.50", color: "blue.600" }}
        >
          <Icon as={icon} boxSize={iconSize} />
          <Text fontSize={fontSize} fontWeight="medium">
            {label}
          </Text>
        </HStack>
      ))}
      <HStack
        as="button"
        onClick={() => {
          logout();       // <--- llama logout
          navigate("/login"); // <--- navega a login
        }}
        w="full"
        spacing={4}
        px={3}
        py={2}
        borderRadius="md"
        color="red.500"
        _hover={{ bg: "red.50" }}
      >
        <Icon as={FiLogOut} boxSize={iconSize} />
        <Text fontSize={fontSize} fontWeight="medium">
          Cerrar seion
        </Text>
      </HStack>
    </VStack>
  );

  return (
    <>
      {/* Botón hamburguesa solo en móvil */}
      {isMobile && (
        <IconButton
          icon={<FiMenu />}
          aria-label="Abrir menú"
          variant="ghost"
          onClick={onOpen}
          position="fixed"
          top={4}
          left={4}
          zIndex="overlay"
        />
      )}

      {/* Sidebar fijo en desktop */}
      {!isMobile && (
        <Box
          as="aside"
          w={sidebarWidth}
          minH="100vh"
          bg="white"
          boxShadow="xl"
          borderBottom="10px"
          borderColor="gray.100"
          position="sticky"
          top="0"
          transition="width 0.2s ease"
        >
          {NavLinks()}
        </Box>
      )}

      {/* Drawer en móvil */}
      <Drawer placement="lef" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">Menú</DrawerHeader>
          <DrawerBody>{NavLinks()}</DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default Sidebar;
