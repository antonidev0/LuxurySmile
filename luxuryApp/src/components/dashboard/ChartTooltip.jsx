import { Box, HStack, Text } from "@chakra-ui/react";

// Tooltip propio para que todas las gráficas se vean iguales
const ChartTooltip = ({ active, payload, label, labelFormatter }) => {
  if (!active || !payload?.length) return null;
  return (
    <Box bg="white" borderRadius="lg" boxShadow="lift" borderWidth="1px" borderColor="border.subtle" px={3} py={2} fontSize="sm">
      {label !== undefined && (
        <Text fontWeight="600" mb={1} sx={{ "&::first-letter": { textTransform: "uppercase" } }}>
          {labelFormatter ? labelFormatter(label) : label}
        </Text>
      )}
      {payload.map((item) => (
        <HStack key={item.dataKey ?? item.name} spacing={2}>
          <Box boxSize={2.5} borderRadius="sm" bg={item.color ?? item.payload?.fill} />
          <Text color="gray.600">{item.name}</Text>
          <Text fontWeight="600" ml="auto" pl={3}>
            {item.value}
          </Text>
        </HStack>
      ))}
    </Box>
  );
};

export default ChartTooltip;
