import { Box, Button, Image, Text, VStack } from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import logo from "../../assets/images/logo.png";

const MotionBox = motion(Box);

/**
 * Bienvenida breve para quien entra por primera vez: el logo aparece,
 * una línea dorada se dibuja y la cortina se abre hacia la portada 3D.
 */
const IntroSplash = ({ show, onDone }) => {
  useEffect(() => {
    if (!show) return undefined;
    const timer = setTimeout(onDone, 2600);
    return () => clearTimeout(timer);
  }, [show, onDone]);

  return (
    <AnimatePresence>
      {show && (
        <MotionBox
          position="fixed"
          inset={0}
          zIndex="overlay"
          bg="brand.900"
          display="flex"
          alignItems="center"
          justifyContent="center"
          initial={{ opacity: 1 }}
          exit={{ clipPath: "inset(0 0 100% 0)", transition: { duration: 0.9, ease: [0.76, 0, 0.24, 1] } }}
          style={{ clipPath: "inset(0 0 0% 0)" }}
        >
          <VStack spacing={6} px={6}>
            <MotionBox
              initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <Image src={logo} alt="LuxurySmile" h={{ base: 12, md: 16 }} filter="invert(1)" />
            </MotionBox>
            <MotionBox
              h="1px"
              bg="gold.300"
              initial={{ width: 0 }}
              animate={{ width: 220 }}
              transition={{ duration: 1.1, delay: 0.5, ease: "easeInOut" }}
            />
            <MotionBox initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
              <Text color="whiteAlpha.800" letterSpacing="0.3em" textTransform="uppercase" fontSize="xs">
                Odontología de autor
              </Text>
            </MotionBox>
          </VStack>
          <Button position="absolute" bottom={8} variant="ghost" size="sm" color="whiteAlpha.700" _hover={{ color: "white", bg: "whiteAlpha.100" }} onClick={onDone}>
            Saltar
          </Button>
        </MotionBox>
      )}
    </AnimatePresence>
  );
};

export default IntroSplash;
