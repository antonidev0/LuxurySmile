import {
  Avatar,
  Box,
  Drawer,
  DrawerContent,
  DrawerOverlay,
  Flex,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { useEffect } from "react";
import { FiChevronDown, FiLogOut, FiMenu, FiUser } from "react-icons/fi";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { formatLongDay, todayKey } from "../../utils/dates";
import SidebarNav from "./SidebarNav";

const SIDEBAR_WIDTH = "260px";

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const base = user.role === "admin" ? "/admin/dashboard" : "/doctor/dashboard";

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <Flex minH="100vh" bg="gray.50">
      <Box as="aside" w={SIDEBAR_WIDTH} position="fixed" insetY={0} left={0} display={{ base: "none", lg: "block" }} zIndex="docked">
        <SidebarNav role={user.role} onLogout={handleLogout} />
      </Box>

      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent maxW={SIDEBAR_WIDTH}>
          <SidebarNav role={user.role} onNavigate={onClose} onLogout={handleLogout} />
        </DrawerContent>
      </Drawer>

      <Box flex="1" ml={{ base: 0, lg: SIDEBAR_WIDTH }} minW={0}>
        <Flex
          as="header"
          position="sticky"
          top={0}
          zIndex="sticky"
          h={16}
          px={{ base: 4, md: 8 }}
          align="center"
          justify="space-between"
          bg="rgba(247, 250, 252, 0.85)"
          backdropFilter="blur(10px)"
          borderBottomWidth="1px"
          borderColor="border.subtle"
        >
          <HStack spacing={3}>
            <IconButton aria-label="Abrir menú" icon={<FiMenu />} variant="ghost" display={{ base: "inline-flex", lg: "none" }} onClick={onOpen} />
            <Text fontSize="sm" color="text.muted" display={{ base: "none", sm: "block" }}>
              {formatLongDay(todayKey())}
            </Text>
          </HStack>

          <Menu placement="bottom-end">
            <MenuButton>
              <HStack spacing={3}>
                <Box textAlign="right" display={{ base: "none", md: "block" }}>
                  <Text fontSize="sm" fontWeight="600" lineHeight="1.2">
                    {user.role === "doctor" ? "Dr. " : ""}
                    {user.name} {user.lastName}
                  </Text>
                  <Text fontSize="xs" color="text.muted">
                    {user.specialty || (user.role === "admin" ? "Administrador" : "Odontólogo")}
                  </Text>
                </Box>
                <Avatar size="sm" name={`${user.name} ${user.lastName}`} bg="brand.600" color="white" />
                <FiChevronDown />
              </HStack>
            </MenuButton>
            <MenuList>
              <MenuItem as={Link} to={`${base}/perfil`} icon={<FiUser />}>
                Mi perfil
              </MenuItem>
              <MenuDivider />
              <MenuItem icon={<FiLogOut />} color="red.500" onClick={handleLogout}>
                Cerrar sesión
              </MenuItem>
            </MenuList>
          </Menu>
        </Flex>

        <Box as="main" px={{ base: 4, md: 8 }} py={{ base: 6, md: 8 }} maxW="1400px" mx="auto">
          <Outlet />
        </Box>
      </Box>
    </Flex>
  );
};

export default DashboardLayout;
