import { Box, Flex, Icon, Text } from "@chakra-ui/react";

const StatCard = ({ label, value, icon, hint, color = "brand" }) => (
  <Box bg="bg.surface" borderRadius="2xl" borderWidth="1px" borderColor="border.subtle" boxShadow="soft" p={5}>
    <Flex justify="space-between" align="flex-start" gap={3}>
      <Box minW={0}>
        <Text fontSize="sm" color="text.muted" fontWeight="500">
          {label}
        </Text>
        <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="700" color="brand.900" lineHeight="1.2" mt={1}>
          {value}
        </Text>
        {hint && (
          <Text fontSize="xs" color="text.muted" mt={1} noOfLines={1}>
            {hint}
          </Text>
        )}
      </Box>
      {icon && (
        <Flex boxSize={11} borderRadius="xl" bg={`${color}.50`} color={`${color}.600`} align="center" justify="center" flexShrink={0}>
          <Icon as={icon} boxSize={5} />
        </Flex>
      )}
    </Flex>
  </Box>
);

export default StatCard;
