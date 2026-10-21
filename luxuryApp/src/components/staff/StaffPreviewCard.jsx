import { Avatar, Badge, Box, Divider, HStack, Stack, Text } from "@chakra-ui/react";
import { FiMail, FiPhone } from "react-icons/fi";

// Vista previa de cómo se verá la ficha en "Personal"
const StaffPreviewCard = ({ values }) => {
  const fullName = [values.name, values.lastName].filter(Boolean).join(" ");
  const isAdmin = values.role === "admin";

  return (
    <Box borderRadius="2xl" bg="brand.900" color="white" p={6} position="relative" overflow="hidden">
      <Box position="absolute" top="-60px" right="-60px" boxSize="180px" borderRadius="full" bg="gold.400" opacity={0.15} filter="blur(20px)" />
      <Text fontSize="xs" letterSpacing="0.2em" textTransform="uppercase" color="gold.300" mb={4}>
        Vista previa
      </Text>
      <HStack spacing={4} align="center">
        <Avatar size="lg" name={fullName || undefined} bg={isAdmin ? "gold.500" : "brand.500"} color="white" />
        <Box minW={0}>
          <Text fontSize="lg" fontWeight="700" noOfLines={1}>
            {fullName ? `${isAdmin ? "" : "Dr. "}${fullName}` : "Nombre y apellido"}
          </Text>
          <Text color="whiteAlpha.800" fontSize="sm" noOfLines={1}>
            {values.specialty || (isAdmin ? "Cargo" : "Especialidad")}
          </Text>
        </Box>
      </HStack>
      <HStack mt={4} spacing={2} flexWrap="wrap">
        <Badge colorScheme={isAdmin ? "yellow" : "teal"} borderRadius="full" px={2.5} textTransform="none">
          {isAdmin ? "Administrador" : "Doctor"}
        </Badge>
        <Badge colorScheme={values.verified ? "green" : "orange"} borderRadius="full" px={2.5} textTransform="none">
          {values.verified ? "Cuenta activa" : "Verificará por correo"}
        </Badge>
      </HStack>
      <Divider my={5} borderColor="whiteAlpha.300" />
      <Stack spacing={2} fontSize="sm" color="whiteAlpha.900">
        <HStack>
          <FiMail />
          <Text noOfLines={1}>{values.email || "correo@ejemplo.com"}</Text>
        </HStack>
        <HStack>
          <FiPhone />
          <Text>{values.numberPhone || "+58 …"}</Text>
        </HStack>
      </Stack>
    </Box>
  );
};

export default StaffPreviewCard;
