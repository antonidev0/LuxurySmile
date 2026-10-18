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
  Stack
} from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { appointmentSchema } from '../validations/appointmentSchema';
import Navbar from '../components/Nav';
import Notification from '../components/Notification';
import { useAppointment } from '../context/AppointmentContext';
import { useEffect } from 'react';

const Appointment = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [occupiedTimes, setOccupiedTimes] = useState([]);
  const { createAppointment } = useAppointment();
  const { register,
    handleSubmit,
    formState: { errors, isValid, isDirty }
  } = useForm({
    resolver: zodResolver(appointmentSchema),
    mode: "onChange",
  });

  const hasErrors = Object.keys(errors).length > 0;
  const toast = useToast();
  const [successMessage, setSuccessMessage] = useState("");

  const onSubmit = async (data) => {
    try {

      console.log("Datos enviados:", data);
      const response = await createAppointment(data);
      // Muestra el mensaje toast
      toast({
        title: "Cita creada",
        description: "Revise su correo electrónico .",
        status: "success",
        duration: 5000, // 5 segundos
        isClosable: true,
        position: "top", // Puedes usar "bottom", "top-left", etc.
      });

    } catch (error) {

      const message = error.response?.data?.message ||
        error.message ||
        "Ocurrió un error inesperado al agendar la cita";

      toast({
        title: "Error en el servidor",
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

  const fetchOccupiedTimes = async (date) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/appointment/occupied?date=${date}`);
      const data = await response.json();
      setOccupiedTimes(data.occupiedTimes || []);
    } catch (error) {
      console.error("Error al obtener horarios ocupados:", error);
    }
  };


  return (
    <>
      <Navbar />
      <Box
        fontFamily="body"
        pt={20}
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
            Agenda Tu cita
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
            <FormControl isInvalid={!!errors.firstName} mb={4}>
              <FormLabel htmlFor="firstName">Nombre</FormLabel>
              <Input id="firstName" {...register("firstName")} />
              <FormErrorMessage>{errors.firstName?.message}</FormErrorMessage>
            </FormControl>

            {/* Campo: Apellido */}
            <FormControl isInvalid={!!errors.lastName} mb={4}>
              <FormLabel htmlFor="lastName">Apellido</FormLabel>
              <Input id="lastName" {...register("lastName")} />
              <FormErrorMessage>{errors.lastName?.message}</FormErrorMessage>
            </FormControl>

            {/* Campo: Número de Identificación */}
            <FormControl isInvalid={!!errors.ci} mb={4}>
              <FormLabel htmlFor="ci">Número de cedula</FormLabel>
              <Input id="ci" {...register("ci")} />
              <FormErrorMessage>{errors.ci?.message}</FormErrorMessage>
            </FormControl>

            {/* Campo: Fecha  */}
            <FormControl isInvalid={!!errors.date} mb={4}>
              <FormLabel htmlFor="date">Fecha de la Cita</FormLabel>
              <Input
                id="date"
                type="date"
                {...register("date")}
                onChange={(e) => {
                  const date = e.target.value;
                  setSelectedDate(date);
                  fetchOccupiedTimes(date);
                }}
              />
              <FormErrorMessage>{errors.date?.message}</FormErrorMessage>
            </FormControl>

            {/* Campo: hora de la cita */}
            <FormControl isInvalid={!!errors.time} mb={4}>
              <FormLabel htmlFor="time">Hora de la Cita</FormLabel>
              <Input
                id="time"
                min="08:00"
                max="17:00"
                type="time"
                {...register("time", {
                  validate: (value) => {
                    const selected = value;
                    const conflict = occupiedTimes.some(occupied => {
                      // Verifica si la hora seleccionada está dentro del rango de 40min de una ocupada
                      const [h1, m1] = occupied.split(":").map(Number);
                      const [h2, m2] = selected.split(":").map(Number);
                      const diff = Math.abs((h1 * 60 + m1) - (h2 * 60 + m2));
                      return diff < 40;
                    });
                    return conflict ? "Ya existe una cita cercana a esta hora" : true;
                  },
                })}
              />
              <FormErrorMessage>{errors.time?.message}</FormErrorMessage>
            </FormControl>


            {/* Campo: Correo Electrónico */}
            <FormControl isInvalid={!!errors.email} mb={4}>
              <FormLabel htmlFor="email">Correo Electrónico</FormLabel>
              <Input id="email" type="email" aria-label="Correo electrónico" {...register("email")} />
              <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
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
      {successMessage && (
        <Stack p={3} fontWeight="bold">
          <Alert status='success'>
            <AlertIcon />
            {successMessage}
          </Alert>
        </Stack>
      )}
    </>
  );
};

export default Appointment;
