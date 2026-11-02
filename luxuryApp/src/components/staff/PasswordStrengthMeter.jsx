import { Box, Progress, Text } from "@chakra-ui/react";
import { passwordStrength, STRENGTH_LABELS } from "./passwordStrength";

// Barra de seguridad de una contraseña mientras se escribe
const PasswordStrengthMeter = ({ password, ...props }) => {
  const strength = passwordStrength(password);
  return (
    <Box {...props}>
      <Progress value={(strength / 4) * 100} size="xs" borderRadius="full" colorScheme={STRENGTH_LABELS[strength].color} />
      <Text fontSize="xs" color="text.muted" mt={1}>
        Seguridad: {password ? STRENGTH_LABELS[strength].label : "—"}
      </Text>
    </Box>
  );
};

export default PasswordStrengthMeter;
