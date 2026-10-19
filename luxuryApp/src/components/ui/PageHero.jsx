import { Box, Container, Heading, Text } from "@chakra-ui/react";
import Reveal from "./Reveal";

// Cabecera de las páginas públicas interiores
const PageHero = ({ eyebrow, title, description, image }) => (
  <Box
    position="relative"
    pt={{ base: 32, md: 40 }}
    pb={{ base: 16, md: 24 }}
    bg="brand.900"
    bgImage={image ? `url(${image})` : undefined}
    bgSize="cover"
    bgPosition="center"
    color="white"
    overflow="hidden"
  >
    <Box position="absolute" inset={0} bgGradient="linear(to-b, rgba(8,28,33,0.75), rgba(8,28,33,0.92))" />
    <Container maxW="4xl" px={{ base: 4, md: 8 }} position="relative" textAlign="center">
      <Reveal>
        {eyebrow && (
          <Text textTransform="uppercase" letterSpacing="0.25em" fontSize="xs" fontWeight="700" color="gold.300" mb={4}>
            {eyebrow}
          </Text>
        )}
        <Heading as="h1" color="white" fontSize={{ base: "4xl", md: "6xl" }} lineHeight={1.1}>
          {title}
        </Heading>
        {description && (
          <Text mt={5} fontSize={{ base: "md", md: "xl" }} color="whiteAlpha.800" maxW="2xl" mx="auto">
            {description}
          </Text>
        )}
      </Reveal>
    </Container>
  </Box>
);

export default PageHero;
