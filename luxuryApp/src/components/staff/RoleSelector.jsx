import { Box, Flex, Icon, SimpleGrid, Text } from "@chakra-ui/react";
import { FiCheckCircle, FiShield, FiUserCheck } from "react-icons/fi";

const ROLES = [
  {
    value: "doctor",
    title: "Doctor",
    text: "Atiende citas, ve sus pacientes y gestiona sus historias clínicas.",
    icon: FiUserCheck,
  },
  {
    value: "admin",
    title: "Administrador",
    text: "Acceso total: citas, asignaciones, personal y todos los pacientes.",
    icon: FiShield,
  },
];

// Selector del rol como dos tarjetas (radio accesible)
const RoleSelector = ({ value, onChange }) => (
  <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3} role="radiogroup" aria-label="Rol">
    {ROLES.map((role) => {
      const selected = value === role.value;
      return (
        <Box
          key={role.value}
          as="button"
          type="button"
          role="radio"
          aria-checked={selected}
          onClick={() => onChange(role.value)}
          textAlign="left"
          p={4}
          borderRadius="xl"
          borderWidth="2px"
          borderColor={selected ? "brand.500" : "border.subtle"}
          bg={selected ? "brand.50" : "white"}
          transition="border-color .15s, background .15s"
          _hover={{ borderColor: selected ? "brand.500" : "brand.200" }}
          _focusVisible={{ boxShadow: "outline" }}
        >
          <Flex justify="space-between" align="center" mb={2}>
            <Flex boxSize={9} borderRadius="lg" bg={selected ? "brand.600" : "gray.100"} color={selected ? "white" : "gray.600"} align="center" justify="center">
              <Icon as={role.icon} />
            </Flex>
            {selected && <Icon as={FiCheckCircle} color="brand.600" boxSize={5} />}
          </Flex>
          <Text fontWeight="700">{role.title}</Text>
          <Text fontSize="sm" color="text.muted">
            {role.text}
          </Text>
        </Box>
      );
    })}
  </SimpleGrid>
);

export default RoleSelector;
