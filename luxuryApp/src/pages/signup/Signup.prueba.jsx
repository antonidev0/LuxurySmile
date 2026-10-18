import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Nav";
import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Alert,
  AlertIcon,
  useToast
} from '@chakra-ui/react';
import axios from 'axios';

const RegistrationFormm = () => {
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    direccion: '',
    numeroIdentidad: '',
    fechaNacimiento: '',
    telefono: '',
    sexo: '',
    correo: '',
    clave: '',
    confirmarClave: '',
    especialidad: []
  });

  const [passwordError, setPasswordError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  useEffect(() => {
    if (formData.clave !== formData.confirmarClave) {
      setPasswordError(true);
    } else {
      setPasswordError(false);
    }
  }, [formData.clave, formData.confirmarClave]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (passwordError) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    try {
      const newUser = {
        ...formData,
        especialidad: formData.especialidad,
        rol: 'dentista' // Asignar rol según necesidad
      };

      const response = await axios.post('/api/users/adminRouter', newUser);
      
      toast({
        title: 'Registro exitoso',
        description: "Usuario creado correctamente",
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Reset form
      setFormData({
        nombres: '',
        apellidos: '',
        direccion: '',
        numeroIdentidad: '',
        fechaNacimiento: '',
        telefono: '',
        sexo: '',
        correo: '',
        clave: '',
        confirmarClave: '',
        especialidad: []
      });

    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
  <> 
  <Navbar />
    <Box pt={30} maxW="md" mx="auto" mt={10} p={5} borderWidth={1} borderRadius="md">
      <form onSubmit={handleSubmit}>
        {error && (
          <Alert status="error" mb={4}>
            <AlertIcon />
            {error}
          </Alert>
        )}

        <FormControl isRequired mb={4}>
          <FormLabel>Nombres</FormLabel>
          <Input
            name="nombres"
            value={formData.nombres}
            onChange={handleChange}
          />
        </FormControl>

        <FormControl isRequired mb={4}>
          <FormLabel>Apellidos</FormLabel>
          <Input
            name="apellidos"
            value={formData.apellidos}
            onChange={handleChange}
          />
        </FormControl>

        <FormControl isRequired mb={4}>
          <FormLabel>Dirección</FormLabel>
          <Input
            name="direccion"
            value={formData.direccion}
            onChange={handleChange}
          />
        </FormControl>

        <FormControl isRequired mb={4}>
          <FormLabel>Número de Identidad</FormLabel>
          <Input
            type="number"
            name="numeroIdentidad"
            value={formData.numeroIdentidad}
            onChange={handleChange}
          />
        </FormControl>

        <FormControl isRequired mb={4}>
          <FormLabel>Fecha de Nacimiento</FormLabel>
          <Input
            type="date"
            name="fechaNacimiento"
            value={formData.fechaNacimiento}
            onChange={handleChange}
          />
        </FormControl>

        <FormControl isRequired mb={4}>
          <FormLabel>Teléfono</FormLabel>
          <Input
            type="tel"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
          />
        </FormControl>

        <FormControl isRequired mb={4}>
          <FormLabel>Sexo</FormLabel>
          <Select
            name="sexo"
            value={formData.sexo}
            onChange={handleChange}
            placeholder="Seleccionar sexo"
          >
            <option value="masculino">Masculino</option>
            <option value="femenino">Femenino</option>
            <option value="otro">Otro</option>
          </Select>
        </FormControl>

        <FormControl isRequired mb={4}>
          <FormLabel>Correo Electrónico</FormLabel>
          <Input
            type="email"
            name="correo"
            value={formData.correo}
            onChange={handleChange}
          />
        </FormControl>

        <FormControl isRequired mb={4}>
          <FormLabel>Contraseña</FormLabel>
          <Input
            type="password"
            name="clave"
            value={formData.clave}
            onChange={handleChange}
          />
        </FormControl>

        <FormControl isRequired mb={4}>
          <FormLabel>Confirmar Contraseña</FormLabel>
          <Input
            type="password"
            name="confirmarClave"
            value={formData.confirmarClave}
            onChange={handleChange}
          />
          {passwordError && (
            <Alert status="error" mt={2}>
              <AlertIcon />
              Las contraseñas no coinciden
            </Alert>
          )}
        </FormControl>

        <FormControl isRequired mb={4}>
          <FormLabel>Especialidad</FormLabel>
          <Select
            name="especialidad"
            multiple
            value={formData.especialidad}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              especialidad: Array.from(e.target.selectedOptions, option => option.value)
            }))}
          >
            <option value="ortodoncia">Ortodoncia</option>
            <option value="cirugia">Cirugía Oral</option>
            <option value="periodoncia">Periodoncia</option>
            <option value="endodoncia">Endodoncia</option>
          </Select>
        </FormControl>

        <Button
          type="submit"
          colorScheme="teal"
          width="full"
          isLoading={loading}
          isDisabled={passwordError}
        >
          Registrar
        </Button>
      </form>
    </Box>
    </>
  );
};

export default RegistrationFormm;