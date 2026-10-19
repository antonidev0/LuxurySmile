import { Box, Flex, Heading, Text } from "@chakra-ui/react";

// Encabezado de cada página del dashboard
const PageHeader = ({ title, description, actions }) => (
  <Flex justify="space-between" align={{ base: "flex-start", md: "flex-end" }} gap={4} mb={6} direction={{ base: "column", md: "row" }}>
    <Box>
      <Heading as="h1" fontSize={{ base: "2xl", md: "3xl" }}>
        {title}
      </Heading>
      {description && (
        <Text color="text.muted" mt={1}>
          {description}
        </Text>
      )}
    </Box>
    {actions && <Flex gap={2} wrap="wrap">{actions}</Flex>}
  </Flex>
);

export default PageHeader;
