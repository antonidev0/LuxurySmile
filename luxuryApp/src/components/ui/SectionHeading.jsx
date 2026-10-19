import { Heading, Text, VStack } from "@chakra-ui/react";

const SectionHeading = ({ eyebrow, title, description, align = "center", light = false, ...props }) => (
  <VStack
    spacing={3}
    align={align === "center" ? "center" : "flex-start"}
    textAlign={align}
    maxW="2xl"
    mx={align === "center" ? "auto" : 0}
    mb={{ base: 10, md: 14 }}
    {...props}
  >
    {eyebrow && (
      <Text textTransform="uppercase" letterSpacing="0.2em" fontSize="xs" fontWeight="700" color="gold.500">
        {eyebrow}
      </Text>
    )}
    <Heading as="h2" fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }} color={light ? "white" : "brand.900"}>
      {title}
    </Heading>
    {description && (
      <Text fontSize={{ base: "md", md: "lg" }} color={light ? "whiteAlpha.800" : "text.muted"}>
        {description}
      </Text>
    )}
  </VStack>
);

export default SectionHeading;
