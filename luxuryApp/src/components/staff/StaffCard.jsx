import {
  Avatar,
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Stack,
  Text,
} from "@chakra-ui/react";
import {
  FiAward,
  FiCalendar,
  FiCheck,
  FiClock,
  FiEdit2,
  FiKey,
  FiMail,
  FiMoreHorizontal,
  FiPhone,
  FiRotateCcw,
  FiShield,
  FiUser,
  FiUserX,
} from "react-icons/fi";
import { ACCOUNT_STATUS, accountStatus, ROLE_LABELS, staffName } from "../../utils/staff";

// Acciones del menú ⋯ según el rol de la tarjeta
const doctorActions = (person) => [
  { key: "profile", label: "Ver perfil", icon: FiUser },
  { key: "edit", label: "Editar información", icon: FiEdit2 },
  { key: "availability", label: "Gestionar disponibilidad", icon: FiClock },
  { key: "appointments", label: "Ver sus citas", icon: FiCalendar },
  "divider",
  person.deactivatedAt
    ? { key: "reactivate", label: "Reactivar cuenta", icon: FiRotateCcw }
    : { key: "deactivate", label: "Dar de baja", icon: FiUserX, color: "red.500" },
];

const adminActions = [
  { key: "profile", label: "Ver perfil", icon: FiUser },
  { key: "edit", label: "Editar información", icon: FiEdit2 },
  { key: "access", label: "Gestionar acceso", icon: FiKey },
  { key: "role", label: "Cambiar roles y permisos", icon: FiShield },
];

const StaffCard = ({ person, activeCount, onAction, onVerify }) => {
  const isDoctor = person.role === "doctor";
  const status = accountStatus(person);
  const actions = isDoctor ? doctorActions(person) : adminActions;

  return (
    <Box p={5} borderRadius="2xl" borderWidth="1px" borderColor="border.subtle" bg={status === "inactive" ? "gray.50" : "white"}>
      <Flex gap={3} align="flex-start">
        <Avatar
          name={`${person.name} ${person.lastName}`}
          bg={status === "inactive" ? "gray.400" : isDoctor ? "brand.600" : "gold.500"}
          color="white"
        />
        <Box flex="1" minW={0}>
          <Text fontWeight="700" noOfLines={1}>
            {staffName(person)}
          </Text>
          {/* Especialidad: solo en doctores, separada del rol */}
          {isDoctor && (
            <HStack spacing={1.5} fontSize="sm" color="text.muted" mt={0.5}>
              <FiAward aria-hidden />
              <Text noOfLines={1}>
                <Text as="span" srOnly>
                  Especialidad:{" "}
                </Text>
                {person.specialty}
              </Text>
            </HStack>
          )}
          <HStack mt={2} spacing={2} flexWrap="wrap">
            <Badge colorScheme={isDoctor ? "brand" : "yellow"} borderRadius="full" textTransform="none" title="Rol">
              {ROLE_LABELS[person.role]}
            </Badge>
            <Badge colorScheme={ACCOUNT_STATUS[status].color} variant="outline" borderRadius="full" textTransform="none" title="Estado de la cuenta">
              {ACCOUNT_STATUS[status].label}
            </Badge>
          </HStack>
        </Box>
        <Menu placement="bottom-end" isLazy>
          <MenuButton as={IconButton} aria-label={`Acciones para ${person.name} ${person.lastName}`} icon={<FiMoreHorizontal />} size="sm" variant="ghost" />
          <MenuList fontSize="sm">
            {actions.map((action, i) =>
              action === "divider" ? (
                <MenuDivider key={i} />
              ) : (
                <MenuItem key={action.key} icon={<action.icon />} color={action.color} onClick={() => onAction(action.key, person)}>
                  {action.label}
                </MenuItem>
              )
            )}
          </MenuList>
        </Menu>
      </Flex>
      <Stack spacing={1.5} mt={4} fontSize="sm" color="gray.700">
        <HStack>
          <FiMail />
          <Text noOfLines={1}>{person.email}</Text>
        </HStack>
        <HStack>
          <FiPhone />
          <Text>{person.numberPhone}</Text>
        </HStack>
      </Stack>
      {status === "pending" && (
        <Button mt={4} size="sm" w="full" variant="outline" colorScheme="green" leftIcon={<FiCheck />} onClick={() => onVerify(person)}>
          Activar cuenta
        </Button>
      )}
      {isDoctor && (
        <Text mt={4} pt={3} borderTopWidth="1px" borderColor="border.subtle" fontSize="sm">
          <b>{activeCount}</b> citas activas asignadas
        </Text>
      )}
    </Box>
  );
};

export default StaffCard;
