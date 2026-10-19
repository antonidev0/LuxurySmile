import { Box, Button, Flex, HStack, Icon, Stack, Text } from "@chakra-ui/react";
import { FiExternalLink, FiLogOut } from "react-icons/fi";
import { Link, NavLink } from "react-router-dom";
import { DASHBOARD_NAV } from "../../constants/navigation";
import Logo from "../ui/Logo";

const ROLE_LABEL = { admin: "Administración", doctor: "Consultorio" };

// Contenido del menú lateral (se usa fijo en escritorio y dentro del Drawer en móvil)
const SidebarNav = ({ role, onNavigate, onLogout }) => (
  <Flex direction="column" h="full" bg="brand.900" color="whiteAlpha.800" px={4} py={6}>
    <Box px={3} mb={8}>
      <Logo invert h={9} to={DASHBOARD_NAV[role]?.[0]?.to ?? "/"} />
      <Text mt={3} fontSize="xs" letterSpacing="0.2em" textTransform="uppercase" color="gold.300">
        {ROLE_LABEL[role]}
      </Text>
    </Box>

    <Stack as="nav" spacing={1} flex="1" aria-label="Panel">
      {(DASHBOARD_NAV[role] ?? []).map((item) => (
        <HStack
          key={item.to}
          as={NavLink}
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          spacing={3}
          px={3}
          py={2.5}
          borderRadius="lg"
          fontSize="sm"
          fontWeight={500}
          transition="background .15s, color .15s"
          _hover={{ bg: "whiteAlpha.100", color: "white" }}
          sx={{ "&.active": { bg: "whiteAlpha.200", color: "white", fontWeight: 600 } }}
        >
          <Icon as={item.icon} boxSize={4} />
          <Text>{item.label}</Text>
        </HStack>
      ))}
    </Stack>

    <Stack spacing={1} pt={6} borderTopWidth="1px" borderColor="whiteAlpha.200">
      <Button as={Link} to="/" variant="ghost" color="whiteAlpha.800" justifyContent="flex-start" leftIcon={<FiExternalLink />} size="sm" borderRadius="lg" _hover={{ bg: "whiteAlpha.100", color: "white" }}>
        Ver sitio público
      </Button>
      <Button onClick={onLogout} variant="ghost" color="red.200" justifyContent="flex-start" leftIcon={<FiLogOut />} size="sm" borderRadius="lg" _hover={{ bg: "whiteAlpha.100", color: "red.100" }}>
        Cerrar sesión
      </Button>
    </Stack>
  </Flex>
);

export default SidebarNav;
