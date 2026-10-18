import { useEffect, useState, useMemo } from "react";
import {
  Box,
  Flex,
  Heading,
  SimpleGrid,
  Text,
  Stack,
  Spinner,
  Badge,
  useColorModeValue, 
} from "@chakra-ui/react";
import Sidebar from "../../../components/dashboard/Sidebar";  
import { useAdmin } from "../../../context/AdminContext.jsx";
import { motion } from "framer-motion";
import AppointmentsBarChart from "../../../components/admin/BarChart.jsx"; 

const MotionBox = motion(Box);

// Verifica si una cita es hoy.
// appt.date llega como "2025-07-29T00:00:00.000Z": comparamos solo el día,
// porque convertirlo a hora local (UTC-4) lo movería al día anterior.
const isToday = (dateString) => {
  const today = new Date();
  const localToday = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");
  return dateString.slice(0, 10) === localToday;
};

const AdminDashboard = () => {
  const { getAppointments, loading } = useAdmin();
  const [appointments, setAppointments] = useState([]);
  const cardBg = useColorModeValue("white", "gray.800");

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const data = await getAppointments();
        setAppointments(data);
      } catch (error) {
        console.error("Error al obtener citas:", error);
      }
    };
    fetchAppointments();
  }, []);

  // Citas del dia
  const todayAppointments = useMemo(
    () => appointments.filter((appt) => isToday(appt.date)),
    [appointments]
  );

  // doctores activos del dia
  const activeDoctorsToday = useMemo(() => {
    const doctors = todayAppointments.flatMap((appt) => appt.assignedDoctors ?? []);

    return doctors.filter(
      (doctor, index, self) =>
        index === self.findIndex(
          (d) => d.name === doctor.name && d.email === doctor.email
        )
    );
  }, [todayAppointments]);

  // Datos para el gráfico de citas mensuales
  // Agrupa las citas por mes y cuenta cuántas hay en cada uno
  const monthlyData = useMemo(() => {
  const stats = {};

  appointments.forEach(appt => {
    const date = new Date(appt.date);
    const key = `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}`; // ej: "2025-7"

    if (!stats[key]) stats[key] = 0;
    stats[key]++;
  });

  return Object.entries(stats).map(([key, count]) => {
    const [year, month] = key.split("-");
    return {
      mes: `${month}/${year}`,
      citas: count
    };
  });
}, [appointments]);


return (
  <Flex minH="100vh">
    {/* Sidebar */}
    <Sidebar />

    <Box flex="1" p={6} pt={{ base: 16, md: 4 }} bg="gray.50" overflow="auto">
      <Box
        mb={6}
        p={4}
        bg={cardBg}
        color="black"
        rounded="2xl"
        shadow="md"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Heading fontSize={{ base: "xl", md: "2xl" }}>
          Panel de Administrador
        </Heading>
      </Box>
      


      {loading ? (
        <Flex justify="center" align="center" h="70vh">
          <Spinner size="xl" />
        </Flex>
      ) : (
        <Stack spacing={6}>
          {/* Primera fila: Citas mensuales + Doctores activos */}
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            {/* Gráfico de citas mensuales */}
            <MotionBox
              bg={cardBg}
              p={4}
              rounded="2xl"
              shadow="md"
              border="1px solid"
              borderColor="gray.200"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Heading size="md" mb={4}>
                Citas mensuales
              </Heading>
              <AppointmentsBarChart data={monthlyData} />
            </MotionBox>

            {/* Doctores activos hoy */}
            <MotionBox
              bg={cardBg}
              p={4}
              rounded="2xl"
              shadow="md"
              border="1px solid"
              borderColor="gray.200"
              h={"full"}
              display="flex"
              flexDirection="column"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Heading size="md" mb={4} flexShrink={0}>
                Doctores activos hoy
              </Heading>

              <Box overflowY="auto" flex="1">
                {activeDoctorsToday.length === 0 ? (
                  <Text color="gray.500">
                    Ningún doctor tiene citas hoy.
                  </Text>
                ) : (
                  <Stack spacing={3}>
                    {activeDoctorsToday.map((doctor) => (
                      <Box
                        key={doctor.id}
                        p={3}
                        borderWidth="1px"
                        borderRadius="md"
                        bg="gray.50"
                      >
                        <Text fontWeight="bold">{doctor.name}</Text>
                        <Text fontSize="sm">{doctor.email}</Text>
                      </Box>
                    ))}
                  </Stack>
                )}
              </Box>
            </MotionBox>
          </SimpleGrid>

          {/* Segunda fila: Citas para hoy (ocupa ancho completo) */}
          <MotionBox
            w="100%"
            bg={cardBg}
            p={4}
            rounded="2xl"
            shadow="md"
            border="1px solid"
            borderColor="gray.200"
            overflowY="auto"
            maxH="70vh"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Heading size="md" mb={4}>
              Citas para hoy
            </Heading>

            {todayAppointments.length === 0 ? (
              <Text color="gray.500">No hay citas para hoy.</Text>
            ) : (
              <Stack spacing={4}>
                {todayAppointments.map((appt) => (
                  <Box key={appt.id} p={3} borderWidth="1px" rounded="md" >
                    <Text fontWeight="semibold">
                      {appt.firstName} {appt.lastName}
                    </Text>
                    <Text fontSize="sm">CI: {appt.ci}</Text>
                    <Text fontSize="sm">Hora: {appt.time}</Text>
                    <Text fontSize="sm">Email: {appt.email}</Text>
                    <Text mt={2} fontSize="sm" fontWeight="medium">
                      Doctores asignados:{" "}
                      {appt.completedBy?.length > 0
                      ? appt.completedBy.map(doc => `${doc.name} ${doc.lastName}`).join(', ')
                      : "Ninguno"}
                    </Text>

                    <Badge
                      mt={2}
                      colorScheme={
                        appt.status === "pendiente" ? "yellow" : "green"
                      }
                    >
                      {appt.status}
                    </Badge>
                  </Box>
                ))}
              </Stack>
            )}
          </MotionBox>

        </Stack>
      )}
    </Box>
  </Flex>
);

};

export default AdminDashboard;
