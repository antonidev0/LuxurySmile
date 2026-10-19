import { Box, Flex, Icon, Heading, Text } from "@chakra-ui/react";

const TreatmentCard = ({ treatment }) => (
  <Box
    h="full"
    p={{ base: 6, md: 7 }}
    bg="white"
    borderRadius="2xl"
    borderWidth="1px"
    borderColor="border.subtle"
    boxShadow="soft"
    transition="transform .3s, box-shadow .3s, border-color .3s"
    _hover={{ transform: "translateY(-4px)", boxShadow: "lift", borderColor: "gold.200" }}
  >
    <Flex boxSize={12} borderRadius="xl" bg="gold.50" color="gold.600" align="center" justify="center" mb={5}>
      <Icon as={treatment.icon} boxSize={6} />
    </Flex>
    <Heading as="h3" fontSize="xl" mb={2}>
      {treatment.title}
    </Heading>
    <Text color="text.muted" fontSize="sm">
      {treatment.short}
    </Text>
  </Box>
);

export default TreatmentCard;
