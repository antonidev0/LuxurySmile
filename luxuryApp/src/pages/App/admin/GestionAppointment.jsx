import { useEffect, useState } from "react";
import {
  Flex,
  Text,
  Badge,
  Box,
  Heading,
  Stack,
  Select,
  useToast,
  Button,
  FormLabel,
  Input,
  Divider,
} from "@chakra-ui/react";
import Sidebar from "../../../components/dashboard/Sidebar";
import { useAdmin } from "../../../context/AdminContext";
import { motion } from "framer-motion";
import Calendar from "react-calendar"; // Importamos el calendario
import "react-calendar/dist/Calendar.css"; // Importamos los estilos del calendario
import MedicalHistoryForm from "../../../components/admin/MedicalHistoryForm";


// Importamos MotionBox para animaciones
const MotionBox = motion(Box);

const GestionAppointment = () => {
  const { getAppointments, getDoctors, assignDoctorToAppointment, updateAppointmentStatus, } = useAdmin();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [selectedCI, setSelectedCI] = useState('');

  const toast = useToast()


  // Recarga las citas tras subir o generar un historial PDF
  const handleSuccess = async () => {
    const updated = await getAppointments();
    setAppointments(updated);
  };


  // Filtramos las citas al cargar
  const handleFilter = () => {
    let filtered = [...appointments];

    if (selectedDate) {
      filtered = filtered.filter((appt) => appt.date.startsWith(selectedDate));
    }

    if (selectedStatus) {
      filtered = filtered.filter((appt) => appt.status === selectedStatus);
    }

    if (selectedCI) {
      filtered = filtered.filter(appt =>
        appt.ci.toString().includes(selectedCI.trim())
      );
    }

    setFilteredAppointments(filtered);
  };

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const data = await getAppointments();
        console.log(data);

        const doctorsData = await getDoctors(); // ✅ Aquí obtenemos los doctores
        setAppointments(data);
        // getDoctors devuelve todo el personal; solo se asignan doctores
        setDoctors(doctorsData.filter((doc) => doc.role === "doctor"));


      } catch (err) {
        console.error("Error cargando citas", err);
      }
    };
    fetchAppointments();

  }, []);

  useEffect(() => {
    let filtered = [...appointments];

    if (selectedDate) {
      // appt.date llega como "2025-07-29T00:00:00.000Z"
      filtered = filtered.filter(appt => appt.date.startsWith(selectedDate));
    }

    if (selectedStatus) {
      filtered = filtered.filter(appt => appt.status === selectedStatus);
    }

    if (selectedCI.trim() !== '') {
      filtered = filtered.filter(appt =>
        appt.ci.toString().includes(selectedCI.trim())
      );
    }

    setFilteredAppointments(filtered);
  }, [selectedDate, selectedStatus, selectedCI, appointments]);

  return (
    <Flex minH="100vh">
      <Sidebar />

      <Box
        flex="1"
        p={6}
        bg="gray.50"
        overflowY="auto"
        pt={{ base: 16, md: 4 }}
      >
        <Box
          mb={6}
          p={4}
          bg={'white'}
          color="black"
          rounded="2xl"
          shadow="md"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Heading size="lg" textAlign="center" fontSize={{ base: "xl", md: "2xl" }}>
            Gestión de Citas
          </Heading>
        </Box>

        <MotionBox
          mb={6}
          gap={4}
          flexWrap="wrap"
          justify="space-between"
          align="center"
          p={4}
          bg={'white'}
          color="black"
          rounded="2xl"
          shadow="md"
          display="flex"
          alignItems="center"
          justifyContent="center"
          overflowY="auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Box >
            <FormLabel fontWeight="medium">Filtrar por fecha</FormLabel>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              maxW="200px"
            />
          </Box>

          <Box>
            <FormLabel fontWeight="medium">Filtrar por estado</FormLabel>
            <Select
              placeholder="Todos"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              maxW="200px"
            >
              <option value="pendiente">Pendiente</option>
              <option value="confirmada">Confirmada</option>
              <option value="cancelada">Cancelada</option>
              <option value="completada">Completada</option>
            </Select>
          </Box>

          <Box>
            <FormLabel fontWeight="medium">Buscar por cédula</FormLabel>
            <Input
              type="text"
              placeholder="Ej: 12345678"
              value={selectedCI}
              onChange={(e) => setSelectedCI(e.target.value)}
              maxW="200px"
            />
          </Box>

          <Button
            colorScheme="blue"
            onClick={handleFilter}
            mt={6}
            px={6}
          >
            Aplicar filtros
          </Button>
          <Button
            variant="outline"
            colorScheme="gray"
            onClick={() => {
              setSelectedDate('');
              setSelectedStatus('');
              setSelectedCI('');
            }}
            mt={{ base: 2, md: 6 }}
            px={6}
          >
            Limpiar filtros
          </Button>
        </MotionBox>

        <Flex justify="center" align="center" w={"100%"} >
          <MotionBox
            bg="white"
            p={6}
            rounded="2xl"
            shadow="md"
            border="1px solid"
            borderColor="gray.200"
            maxH="80vh"
            overflowY="auto"
            width="100%"
            mx="auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            {appointments.length === 0 ? (
              <Text color="gray.500" textAlign="center">
                No hay citas registradas.
              </Text>
            ) : (
              <Stack spacing={5}>
                {filteredAppointments.map((appt) => (
                  <Box
                    key={appt._id}
                    p={4}
                    borderWidth="1px"
                    borderRadius="lg"
                    bg="gray.50"
                    display="flex"
                    flexDirection="column"
                    gap={2}
                    boxShadow={"lg"}
                  >
                    <Text fontWeight="bold" fontSize="md" textAlign="center">
                      {appt.firstName} {appt.lastName}
                    </Text>
                    <Text fontSize="sm" textAlign="center">CI: {appt.ci}</Text>
                    <Text fontSize="sm" textAlign="center">Hora: {appt.time}</Text>
                    <Text fontSize="sm" textAlign="center">
                      Fecha: {appt.date.split("T")[0]}
                    </Text>
                    <Text fontSize="sm" textAlign="center">Email: {appt.email}</Text>
                    <Text mt={2} fontSize="sm" fontWeight="medium" textAlign="center">
                      Doctores asignados:
                      <Box pl={2} mt={1}>
                        {appt.assignedDoctors?.length > 0
                          ? appt.assignedDoctors.map((doc, index) => (
                            <Text key={index} fontSize="sm">
                              Dr. {doc.name} {doc.lastName}
                            </Text>
                          ))
                          : <Text fontSize="sm">Ninguno</Text>}
                      </Box>
                    </Text>

                    <Select
                      placeholder="Asignar doctor"
                      value=""
                      mt={2}
                      size="sm"
                      variant="outline"
                      bg="white" borderRadius="md" p={3} boxShadow="md"
                      onChange={async (e) => {
                        const doctorId = e.target.value;
                        if (!doctorId || doctorId === "undefined") {
                          toast({
                            title: "ID de doctor inválido",
                            description: "Por favor selecciona un doctor válido.",
                            status: "warning",
                            duration: 2000,
                            isClosable: true,
                          });
                          return;
                        }

                        try {
                          await assignDoctorToAppointment(appt._id, doctorId);
                          toast({
                            title: "Doctor asignado correctamente",
                            status: "success",
                            duration: 2000,
                            isClosable: true,
                          });
                          const updated = await getAppointments();
                          setAppointments(updated);
                        } catch (err) {
                          toast({
                            title: "Error al asignar doctor",
                            description: err.message,
                            status: "error",
                            duration: 2000,
                            isClosable: true,
                          });
                        }
                      }}
                    >
                      {doctors.map((doc) => (
                        <option key={doc.id} value={doc.id}>
                          Dr. {doc.name} {doc.lastName}
                        </option>
                      ))}
                    </Select>

                    <Select
                      mt={2}
                      size="sm"
                      bg="white" borderRadius="md" p={3} boxShadow="md"
                      value={appt.status}
                      onChange={async (e) => {
                        const newStatus = e.target.value;
                        try {
                          await updateAppointmentStatus(appt._id, newStatus);
                          toast({
                            title: "Estado actualizado",
                            status: "success",
                            duration: 2000,
                            isClosable: true,
                          });

                          const updated = await getAppointments();
                          setAppointments(updated);
                        } catch (err) {
                          toast({
                            title: "Error al actualizar estado",
                            description: err.response?.data?.message || "Error desconocido",
                            status: "error",
                            duration: 2000,
                            isClosable: true,
                          });
                        }
                      }}
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="confirmada">Confirmada</option>
                      <option value="completada">Completada</option>
                      <option value="cancelada">Cancelada</option>
                    </Select>

                    <MedicalHistoryForm
                      appointmentId={appt._id}
                      historialPDF={appt.historialPDF}
                      onSuccess={handleSuccess}
                    />


                    <Flex justify="center">
                      <Badge
                        mt={3}
                        px={4}
                        py={1}
                        borderRadius="full"
                        fontSize="0.8em"
                        colorScheme={
                          appt.status === "pendiente"
                            ? "yellow"
                            : appt.status === "confirmada"
                              ? "blue"
                              : appt.status === "completada"
                                ? "green"
                                : "red"
                        }
                        textTransform="capitalize"
                      >
                        {appt.status}
                      </Badge>
                    </Flex>
                  </Box>
                ))}
              </Stack>
            )}
          </MotionBox>

        </Flex>


      </Box>
    </Flex>
  );

};

export default GestionAppointment;
