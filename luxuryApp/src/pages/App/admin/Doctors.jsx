import {
  Box,
  Heading,
  Text,
  Stack,
  Button,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  IconButton,
  Flex,
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import { useEffect, useState } from 'react';
import axiosInstance from '../../../service/api'; // tu instancia con token

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchDoctors = async () => {
    try {
      const { data } = await axiosInstance.get('/api/admin/getDoctors');
      // El endpoint devuelve todo el personal; aquí solo listamos doctores
      setDoctors(data.filter((staff) => staff.role === 'doctor'));
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron obtener los doctores.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (doctorId) => {
    if (!window.confirm('¿Seguro que quieres eliminar este doctor?')) return;

    try {
      await axiosInstance.delete(`/api/admin/deleteDoctor/${doctorId}`);
      toast({
        title: 'Doctor eliminado',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setDoctors((prev) => prev.filter((doc) => doc.id !== doctorId));
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el doctor.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  if (loading) {
    return <Spinner size="xl" thickness="4px" />;
  }

  if (doctors.length === 0) {
    return (
      <Alert status="info" mt={4}>
        <AlertIcon />
        No hay doctores registrados.
      </Alert>
    );
  }

  return (
    <Box p={6}>
      <Heading size="lg" mb={4}>Lista de Doctores</Heading>
      <Stack spacing={4}>
        {doctors.map((doctor) => (
          <Box
            key={doctor.id}
            p={4}
            borderWidth={1}
            borderRadius="lg"
            boxShadow="md"
            _hover={{ bg: 'gray.50' }}
          >
            <Flex justify="space-between" align="center">
              <Box>
                <Text fontWeight="bold">Dr. {doctor.name} {doctor.lastName}</Text>
                <Text color="gray.600">{doctor.specialty}</Text>
                <Text fontSize="sm" color="gray.500">{doctor.email}</Text>
              </Box>
              <IconButton
                icon={<DeleteIcon />}
                colorScheme="red"
                aria-label="Eliminar doctor"
                onClick={() => handleDelete(doctor.id)}
              />
            </Flex>
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default Doctors;
