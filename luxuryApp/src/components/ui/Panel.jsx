import { Box, Flex, Heading, Text } from "@chakra-ui/react";

// Tarjeta base de los dashboards
const Panel = ({ title, subtitle, action, children, bodyProps, ...props }) => (
  <Box bg="bg.surface" borderRadius="2xl" borderWidth="1px" borderColor="border.subtle" boxShadow="soft" p={{ base: 4, md: 6 }} {...props}>
    {(title || action) && (
      <Flex justify="space-between" align="flex-start" gap={3} mb={4} wrap="wrap">
        <Box>
          {title && (
            <Heading as="h3" fontSize="lg" fontFamily="body" fontWeight="700">
              {title}
            </Heading>
          )}
          {subtitle && (
            <Text fontSize="sm" color="text.muted" mt={0.5}>
              {subtitle}
            </Text>
          )}
        </Box>
        {action}
      </Flex>
    )}
    <Box {...bodyProps}>{children}</Box>
  </Box>
);

export default Panel;
