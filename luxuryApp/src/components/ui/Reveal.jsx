import { Box } from "@chakra-ui/react";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

// Aparece suavemente al entrar en pantalla (sustituye a AOS)
const Reveal = ({ children, delay = 0, y = 24, ...props }) => (
  <MotionBox
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    {...props}
  >
    {children}
  </MotionBox>
);

export default Reveal;
