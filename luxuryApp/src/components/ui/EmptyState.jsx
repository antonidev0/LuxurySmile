import { Flex, Icon, Text } from "@chakra-ui/react";
import { FiInbox } from "react-icons/fi";

const EmptyState = ({ icon = FiInbox, title = "Sin resultados", description, children, ...props }) => (
  <Flex direction="column" align="center" justify="center" textAlign="center" py={10} px={4} color="text.muted" {...props}>
    <Flex boxSize={12} borderRadius="full" bg="bg.muted" align="center" justify="center" mb={3}>
      <Icon as={icon} boxSize={5} />
    </Flex>
    <Text fontWeight="600" color="gray.700">
      {title}
    </Text>
    {description && (
      <Text fontSize="sm" mt={1} maxW="sm">
        {description}
      </Text>
    )}
    {children}
  </Flex>
);

export default EmptyState;
