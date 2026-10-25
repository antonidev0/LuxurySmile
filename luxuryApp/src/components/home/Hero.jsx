import { Box, Button, Container, Flex, Heading, HStack, Icon, SimpleGrid, Stack, Text } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";
import { FiArrowRight, FiCheckCircle } from "react-icons/fi";
import { Link } from "react-router-dom";
import { CLINIC } from "../../constants/clinic";
import HeroVisual from "./HeroVisual";

const MotionBox = motion(Box);

const fadeUp = (delay) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] },
});

const HIGHLIGHTS = ["Diseño digital de sonrisa", "Atención sin dolor", "Tecnología 3D"];

const Hero = ({ ready }) => (
  <Box
    position="relative"
    overflow="hidden"
    pt={{ base: 24, md: 28 }}
    pb={{ base: 12, md: 20 }}
    bgGradient="linear(to-b, ivory 0%, #f3ede2 100%)"
  >
    {/* Trama decorativa */}
    <Box
      position="absolute"
      inset={0}
      opacity={0.5}
      bgImage="radial-gradient(rgba(15,47,55,0.07) 1px, transparent 1px)"
      bgSize="22px 22px"
      sx={{ maskImage: "linear-gradient(to bottom, black, transparent 85%)" }}
      pointerEvents="none"
    />
    <Container maxW="7xl" px={{ base: 4, md: 8 }} position="relative">
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 4, lg: 10 }} alignItems="center">
        <Stack spacing={{ base: 5, md: 7 }} order={{ base: 2, lg: 1 }} textAlign={{ base: "center", lg: "left" }} align={{ base: "center", lg: "flex-start" }}>
          <MotionBox {...fadeUp(ready ? 0.1 : 0)}>
            <HStack
              spacing={2}
              px={3}
              py={1}
              borderRadius="full"
              bg="white"
              borderWidth="1px"
              borderColor="gold.200"
              fontSize="xs"
              fontWeight="600"
              color="gold.700"
              letterSpacing="0.08em"
              textTransform="uppercase"
            >
              <Box boxSize={1.5} borderRadius="full" bg="gold.400" />
              <Text>Clínica odontológica en Margarita</Text>
            </HStack>
          </MotionBox>

          <MotionBox {...fadeUp(ready ? 0.2 : 0)}>
            <Heading as="h1" fontSize={{ base: "4xl", sm: "5xl", lg: "6xl", xl: "7xl" }} lineHeight={1.05}>
              Una sonrisa sana,{" "}
              <Box as="span" color="gold.500" fontStyle="italic">
                diseñada
              </Box>{" "}
              para ti.
            </Heading>
          </MotionBox>

          <MotionBox {...fadeUp(ready ? 0.35 : 0)}>
            <Text fontSize={{ base: "md", md: "xl" }} color="text.muted" maxW="lg">
              Tecnología avanzada y atención personalizada para que cada visita sea cómoda, precisa y con
              resultados que se notan.
            </Text>
          </MotionBox>

          <MotionBox {...fadeUp(ready ? 0.5 : 0)} w={{ base: "full", sm: "auto" }}>
            <Stack direction={{ base: "column", sm: "row" }} spacing={3}>
              <Button as={Link} to="/tratamientos" size="lg" rightIcon={<FiArrowRight />} px={8}>
                Ver tratamientos
              </Button>
              <Button as="a" href={CLINIC.whatsapp} target="_blank" rel="noreferrer" size="lg" variant="outline" colorScheme="brand" bg="whiteAlpha.700" leftIcon={<FaWhatsapp />}>
                Escríbenos
              </Button>
            </Stack>
          </MotionBox>

          <MotionBox {...fadeUp(ready ? 0.65 : 0)}>
            <Flex gap={{ base: 3, md: 5 }} wrap="wrap" justify={{ base: "center", lg: "flex-start" }}>
              {HIGHLIGHTS.map((item) => (
                <HStack key={item} spacing={2} fontSize="sm" color="gray.700">
                  <Icon as={FiCheckCircle} color="brand.500" />
                  <Text>{item}</Text>
                </HStack>
              ))}
            </Flex>
          </MotionBox>
        </Stack>

        <Box order={{ base: 1, lg: 2 }}>
          <HeroVisual ready={ready} />
        </Box>
      </SimpleGrid>
    </Container>
  </Box>
);

export default Hero;
