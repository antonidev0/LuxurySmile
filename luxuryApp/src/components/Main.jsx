import { 
  Box,
  Image, 
  Text,
  Flex,
  List,
  ListItem,
  Button, } from "@chakra-ui/react";
import { Icon1, Icon2, Icon3, Icon4 } from "./Icons"; 
import AOS from 'aos';
import 'aos/dist/aos.css';
import Footer from "./Footer";
import React, { useEffect } from "react";

const Main = () => {
  useEffect(() => { AOS.init(); }, []);
  return (
    <>
      <Box data-aos="fade-up" data-aos-duration="800" position={"relative"} pt={16} h={"100vh"}>
        {/* Contenedor del texto superpuesto */}
        <Box position={"absolute"} display={"flex"} flexDirection={"column"} inset={"0"} alignItems={"center"} justifyContent={"center"} zIndex={10} pt={16}>
          <Box p={8} display={"flex"} justifyContent={"center"} alignItems={"center"} borderRadius={"3xl"} className="bg-slate-200 bg-opacity-50 mt-4 2xl:w-2/3 2xl:h-2/3">
            <Box display={"flex"} justifyContent={"center"} alignItems={"center"} flexDirection={"column"} className="">
              <Text className="text-center text-2xl p-4 2xl:text-6xl">
                MANTEN TU SONRISA
              </Text> 
              <Text className=" text-center text-3xl font-bold 2xl:text-9xl">
                SANA Y FUERTE
              </Text>
              <Text className="text-center text-xl p-4 2xl:text-5xl">
                tecnología avanzada y atención personalizada para brindarte la mejor
                  <br />
                experiencia dental. Transformamos tu sonrisa y tu vida                
              </Text>
            </Box>
          </Box> 
        </Box> 
        {/* Imagen de fondo */}
        <Image
        src="https://www.antiaginggroupbarcelona.com/wp-content/uploads/2017/10/arrugas-marioneta-agb.jpg" // Cambia esto a tu imagen
        className="z-10 h-full w-full object-cover"
        alt="Fondo"
        />
      </Box>  

      <Box top={0} right={0} left={0} h={"100vh"} data-aos="fade-up" data-aos-duration="800">
        <Box top={0} right={0} left={0} display={"flex"} alignItems={"center"} justifyContent={"center"} h={{ base:"9rem", "xl":"13rem"}}> 
          {/* Barra */}
          <Box display={"flex"} justifyContent={"space-around"} gap={7}>
            <Image 
            src="https://www.pngmart.com/files/17/Tooth-Transparent-Background.png"
            alt="Diente"
            boxSize={{base:"6rem", "xl":"8rem"}}
            display={{ base:"none", md:"flex"}}
             />
             <Flex display={"flex"} flexDirection={"column"}>
              <Text
                fontSize={{ base: "2xl", md: "3xl", xl: "6xl" }} // Diferentes tamaños en base al viewport
                color={"blue.800"}
                textAlign={"center"}
                fontWeight={"bold"}
              >
                RESERVA TU CITA EN LÍNEA
              </Text>
              <Text 
                fontSize={{ base:"xl" }}
                textAlign={"center"}
                >
                SOLICITE RAPIDO Y FACIL PARA RESERVAR SU CITA
              </Text>
             </Flex>
            <Image 
              src="https://www.pngmart.com/files/17/Tooth-Transparent-Background.png"
              alt="Diente"
              boxSize={{base:"6rem", "xl":"8rem"}}
              display={{ base:"none", md:"flex"}}
            />

          </Box>
        </Box>
        
        <Box minH="100vh" pl={7} pr={7} bgGradient='linear(to-r, gray.200, white, gray.200)'> 
          <Box maxW="7xl" m="auto" w="full">
              <List m={0} p={4} display={"flex"} justifyContent={"center"} gap={14}  className=" list-none flex-col    sm:flex-row sm:flex-wrap ">
            
                  <ListItem data-aos="fade-up" data-aos-duration="800" display="flex" flexDirection="column" className="h-80 sm:w-2/5"> 
                    <Box className="h-2/5 w-full">
                     <Icon1/>
                    </Box>
                    <Box>
                      <Text className="text-2xl font-bold text-center">
                      ODONTOLOGÍA GENERAL
                      </Text>
                      <Box as="br" />
                      <Text className="text-center">
                      EVALUACIÓN Y ATENCIÓN INICIAL DE PROBLEMAS DENTALES QUE IMPACTAN SU SALUD BUCAL.
                      </Text>
                    </Box>                
                  </ListItem>

                  <ListItem data-aos="fade-up" data-aos-duration="800" display="flex" flexDirection="column" className="h-80 sm:w-2/5"> 
                    <Box className="h-2/5 w-full">
                     <Icon2 />
                    </Box>
                    <Box>
                      <Text className="text-2xl font-bold text-center">
                      DISEÑO DE SONRISA
                      </Text>
                      <Box as="br" />
                      <Text className="text-center">
                      TRATAMIENTO ESTÉTICO DENTAL PERSONALIZADO PARA MEJORAR LA APARIENCIA DE TU SONRISA. 
                      </Text>
                    </Box>                
                  </ListItem>

                  <ListItem data-aos="fade-up" data-aos-duration="800" display="flex" flexDirection="column" className="h-80 sm:w-2/5"> 
                    <Box className="h-2/5 w-full">
                     <Icon3 />
                    </Box>
                    <Box>
                      <Text className="text-2xl font-bold text-center">
                      ORTODONCIA
                      </Text>
                      <Box as="br" />
                      <Text className="text-center">
                      ¡SONRISA PERFECTA CON ORTODONCIA! CORRIGE DIENTES Y MANDÍBULAS, MEJORA TU ESTÉTICA Y FUNCIÓN DENTAL.
                      </Text>
                    </Box>                
                  </ListItem>

                  <ListItem data-aos="fade-up" data-aos-duration="800" display="flex" flexDirection="column" className="h-80 sm:w-2/5"> 
                    <Box className="h-2/5 w-full">
                     <Icon4 />
                    </Box>
                    <Box>
                      <Text className="text-2xl font-bold text-center">
                      ODONTOLOGÍA GENERAL
                      </Text>
                      <Box as="br" />
                      <Text className="text-center">
                      EVALUACIÓN Y ATENCIÓN INICIAL DE PROBLEMAS DENTALES QUE IMPACTAN LA SALUD BUCAL DEL PACIENTE. 
                      </Text>
                    </Box>                
                  </ListItem>
              </List>
          </Box>
        </Box>
        <Footer />
      </Box>
    </>
  );
}

export default Main;