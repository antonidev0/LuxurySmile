import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage, 
  Button,
  Box,
  Text,
  Heading,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Stack,
  Flex
} from '@chakra-ui/react';

import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod'
import { staffSchema } from '../../validations/staffSchema.js';

import Sidebar from '../../components/dashboard/Sidebar';
import { registerStaff } from '../../service/authService';


export const RegistrationForm = () => {
  
  const {register,
         handleSubmit, 
         reset,
         formState: { errors, isValid, isDirty } 
        } = useForm({ resolver: zodResolver(staffSchema),
          mode: "onChange",
         }); 
      
        const hasErrors = Object.keys(errors).length > 0;
        const toast = useToast();
        const [successMessage, setSuccessMessage] = useState("");
        
        const onSubmit = async (data) => {
            try {
              // confirmPassword solo sirve en el formulario; no se envía al backend
              const { confirmPassword, ...staffData } = data;
              await registerStaff(staffData);
              // Muestra el mensaje toast
              toast({
                title: "Personal registrado",
                description: "Le llegará un correo para verificar su cuenta.",
                status: "success",
                duration: 5000, // 5 segundos
                isClosable: true,
                position: "top", // Puedes usar "bottom", "top-left", etc.
              });
              reset();

          } catch (error) {
            console.error("Error en el registro:", error);
            const message = error.response?.data?.message || "Ocurrió un error inesperado en el registro"; 
            
            toast({
              title: "Error en el registro",
              description: message,
              status: "error",
              duration: 5000,
              isClosable: true,
              position: "top",
          });
        };
      }

        const onError = (errors) => {
          toast({
          title: "Formulario incompleto",
          description: "Por favor completa todos los campos obligatorios.",
          status: "error",
          duration: 4000,
          isClosable: true,
          position: "top",
        });
};
    return (
        <Flex minH="100vh">
          <Sidebar />
          <Box
            flex="1"
            pt={{ base: 16, md: 4 }}
          >
          <Box
            fontFamily="body"
            py={8}
            minH="100vh"
            display="flex"
            alignItems="center"
            justifyContent="center"
            px={4} 
            bg={"whiteAlpha.900"}
          >
          <Box
            bg="white"
            p={8}
            rounded="xl"
            shadow="2xl"
            w="full"
            maxW="3xl"
          >
          <Heading mb={6} size="lg" textAlign="center" color="gray.700">
           Registro de Personal
          </Heading>
          
            <form onSubmit={handleSubmit(onSubmit, onError)}>
             {hasErrors && (
            <Stack p={3} fontWeight="bold">
              <Alert status='error'>
              <AlertIcon />
               Por favor ingrese los datos completos
              </Alert>
              </Stack>
          )}

            {/* Campo: Nombre */}
            <FormControl isInvalid={!!errors.name} mb={4}>
              <FormLabel htmlFor="name">Nombre</FormLabel>
              <Input id="name" {...register("name")} />
              <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
            </FormControl>

            {/* Campo: Apellido */}
            <FormControl isInvalid={!!errors.lastName} mb={4}>
              <FormLabel htmlFor="lastName">Apellido</FormLabel>
              <Input id="lastName" {...register("lastName")} />
              <FormErrorMessage>{errors.lastName?.message}</FormErrorMessage>
            </FormControl>

            {/* Campo: Número de Identificación */}
            <FormControl isInvalid={!!errors.numberId} mb={4}>
              <FormLabel htmlFor="numberId">Número de cedula</FormLabel>
              <Input id="numberId" {...register("numberId")} />
              <FormErrorMessage>{errors.numberId?.message}</FormErrorMessage>
            </FormControl>

            {/* Campo: Dirección */}
            <FormControl isInvalid={!!errors.address} mb={4}>
              <FormLabel htmlFor="address">Dirección</FormLabel>
              <Input id="address" {...register("address")} />
              <FormErrorMessage>{errors.address?.message}</FormErrorMessage>
            </FormControl>

            {/* Campo: Teléfono */}
            <FormControl isInvalid={!!errors.numberPhone} mb={4}>
              <FormLabel htmlFor="numberPhone">Número de Teléfono</FormLabel>
              <Input id="numberPhone" {...register("numberPhone")} />
              <FormErrorMessage>{errors.numberPhone?.message}</FormErrorMessage>
            </FormControl>

            {/* Campo: Fecha de Nacimiento */}
            <FormControl isInvalid={!!errors.birthday} mb={4}>
              <FormLabel htmlFor="birthday">Fecha de Nacimiento</FormLabel>
              <Input id="birthday" type="date" {...register("birthday")} />
              <FormErrorMessage>{errors.birthday?.message}</FormErrorMessage>
            </FormControl>

            {/* Campo: Sexo */}
            <FormControl isInvalid={!!errors.sex} mb={4}>
              <FormLabel htmlFor="sex">Sexo</FormLabel>
              <select
                id="sex"
                {...register("sex")}
                  style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #E2E8F0",
                }}
              >
              <option value="">Selecciona una opción</option>
              <option value="hombre">Hombre</option>
              <option value="mujer">Mujer</option>
              </select>
              <FormErrorMessage>{errors.sex?.message}</FormErrorMessage>
            </FormControl>
            
            {/* Campo: Especialidad */}
            <FormControl isInvalid={!!errors.specialty} mb={4}>
              <FormLabel htmlFor="specialty">Especialidad</FormLabel>
              <Input id="specialty" {...register("specialty")} />
              <FormErrorMessage>{errors.specialty?.message}</FormErrorMessage>
            </FormControl>

            {/* Campo: Correo Electrónico */}
            <FormControl isInvalid={!!errors.email} mb={4}>
              <FormLabel htmlFor="email">Correo Electrónico</FormLabel>
              <Input id="email" type="email" {...register("email")} />
              <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
            </FormControl>

            {/* Campo: Contraseña */}
            <FormControl isInvalid={!!errors.password} mb={4}>
              <FormLabel htmlFor="password">Contraseña</FormLabel>
              <Input id="password" type="password" {...register("password")} />
              <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
            </FormControl>
            
            {/* Campo: Confirmar Contraseña */}
            <FormControl isInvalid={!!errors.confirmPassword} mb={4}>
              <FormLabel htmlFor="confirmPassword">Confirmar Contraseña</FormLabel>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...register("confirmPassword")}
                />
                <FormErrorMessage>{errors.confirmPassword?.message}</FormErrorMessage>
              </FormControl>

              {/* Boton */}
              <Button
                type="submit"
                colorScheme="teal"
                size="md"
                width="full"
                mt={4}
                isDisabled={!isValid || !isDirty}
              >
              Confirmar Registro
              </Button>
 
            </form>
            </Box> 
            </Box>
            { successMessage && (
              <Stack p={3} fontWeight="bold">
              <Alert status='success'>
              <AlertIcon />
               {successMessage}
              </Alert>
              </Stack>
            )}
          </Box>
        </Flex>
    );
};
 
export default RegistrationForm;
