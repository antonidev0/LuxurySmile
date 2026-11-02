import { Box, Text } from "@chakra-ui/react";

// Dato en modo lectura: etiqueta pequeña en mayúsculas y su valor (o una raya si no hay)
const DetailField = ({ label, children }) => (
  <Box>
    <Text fontSize="xs" color="text.muted" textTransform="uppercase" letterSpacing="0.06em">
      {label}
    </Text>
    <Text fontWeight="500" wordBreak="break-word">
      {children || "—"}
    </Text>
  </Box>
);

export default DetailField;
