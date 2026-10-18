import {
  Box,
  Flex,
  HStack,
  IconButton,
  Button,
  useDisclosure,
  useColorModeValue,
  VStack,
  Image, 
} from '@chakra-ui/react';
import { Link } from "react-router-dom"
import Logo from '../assets/Logo-Luxury.png';
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons';
import { motion } from 'framer-motion';

const Navbar = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const MotionBox = motion(Box); 

  return (
    <Box bg={useColorModeValue('white', 'gray.800')} px={4} shadow="md" className='fixed top-0 right-0 left-0 z-20 '>
      <Flex h={{base: 16, "2xl":144}} alignItems="center" justifyContent="space-around"  maxW="1024px" mx={'auto'}>
        {/* Logo de la clínica */}
        <Link to={"/"}>
        <Box >
        <Image
            src={Logo}
            alt="Logo de la Clínica"
            boxSize="4rem"
            w={'full'} // Ajusta el tamaño según tu diseño
            objectFit="cover"
            
          />
        </Box>
        </Link>

        {/* Menú en pantallas grandes */}
        <HStack as="nav" spacing={{ base: 6, xl: 9 }} display={{ base: 'none', md: 'flex' }}>
          <Link to="/">
          <Button variant="ghost" as="a" fontSize={{ base: 'md', "2xl": '2xl' }}>
            Inicio
          </Button>
          </Link>

          <Link to="/services">
          <Button variant="ghost" as="a" fontSize={{ base: 'md', "2xl": '2xl' }}>
            Tratamientos
          </Button>
          </Link>

          <Link to="/nosotros">
          <Button variant="ghost" as="a" fontSize={{ base: 'md', "2xl": '2xl' }}>
            Nosotros
          </Button>
          </Link>

          <Link to="/solicitar-cita">
          <Button variant="ghost" as="a" fontSize={{ base: 'md', "2xl": '2xl' }}>
            Agendar
          </Button>
          </Link>

        </HStack>

        {/* Botón para abrir/cerrar menú móvil */}
        <IconButton
          size="md"
          icon={isOpen ? (
            <motion.div
              initial={{ rotate: 0}}
              animate={{ rotate: 180 }}
              transition={{ duration: 0.3 }}>
                <CloseIcon />
            </motion.div>
          )  : (
            <motion.div
              initial={{ rotate: 180 }}
              animate={{ rotate: 0 }}
              transition={{ duration: 0.3 }}
            >
                <HamburgerIcon />
            </motion.div>
          )}
          aria-label="Abrir Menú"
          display={{ md: 'none' }}
          onClick={isOpen ? onClose : onOpen}
        />
      </Flex>
   
      {/* Menú desplegable en móviles */}         
      {isOpen ? (
        <MotionBox
        initial={{ height: 0, opacity: 0 }} // Altura inicial
        animate={
          isOpen
            ? { height: "14rem", opacity: 1 } // Altura animada al abrir
            : { height: 0, opacity: 0 } // Altura al cerrar
        }
        transition={{ duration: 0.3, ease: "easeIn"}}
        display={{ md: 'none' }}
        pb={isOpen ? 4 : 0} // Añade espacio solo si está abierto
         >
          <VStack spacing={6}  >

            <Link to="/" >
              Inicio 
            </Link>

            <Link to="/services" >
              Tratamiento 
            </Link>

            <Link to="/nosotros" >
              Nosotros 
            </Link>

            <Link to="/solicitar-cita" >
              Agendar 
            </Link>

          </VStack>
        </MotionBox>
      ) : <MotionBox
      initial={{ height: "14rem", opacity: 1 }} 
      animate={
        isOpen
          ? { height: 0, opacity: 0 }
          : { height: 0, opacity: 1 } 
      }
      transition={{ duration: 0.3, ease: "easeIn"}}
      display={{ md: 'none' }} />}
    </Box>
  );
};

export default Navbar;
