import {
  Box,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from "@chakra-ui/react";
import { useAuth } from "../../context/AuthContext";
import { formatDay, formatTime } from "../../utils/dates";
import MedicalRecordActions from "../dashboard/MedicalRecordActions";
import PatientRecordsList from "../records/PatientRecordsList";
import StatusBadge from "../ui/StatusBadge";

const doctorsText = (appt) =>
  appt.assignedDoctors?.length ? appt.assignedDoctors.map((d) => `Dr. ${d.name} ${d.lastName}`).join(", ") : "Sin doctor asignado";

const AppointmentItem = ({ appointment, onUpdated }) => (
  <Box p={4} borderRadius="xl" borderWidth="1px" borderColor="border.subtle">
    <Flex justify="space-between" align="center" mb={2} gap={2}>
      <Text fontWeight="600" fontSize="sm">
        {formatDay(appointment.date)} · {formatTime(appointment.time)}
      </Text>
      <StatusBadge status={appointment.status} />
    </Flex>
    <Text fontSize="xs" color="text.muted" mb={3}>
      {doctorsText(appointment)}
    </Text>
    <MedicalRecordActions appointment={appointment} onUpdated={onUpdated} size="xs" />
  </Box>
);

/**
 * Ficha de un paciente: sus citas (con la historia de cada una) y su historia clínica completa.
 * patient es un elemento de groupPatients; defaultTab elige la pestaña inicial ("citas" o "historia").
 */
const PatientDrawer = ({ patient, onClose, onUpdated, defaultTab = "citas" }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const latest = patient?.appointments.at(-1);
  return (
    <Drawer isOpen={Boolean(patient)} onClose={onClose} size="md">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton mt={2} />
        {patient && (
          <>
            <DrawerHeader borderBottomWidth="1px">
              <Text fontSize="xl">
                {patient.firstName} {patient.lastName}
              </Text>
              <Text fontSize="sm" fontWeight="400" color="text.muted">
                {patient.ci} · {patient.email}
              </Text>
            </DrawerHeader>
            <DrawerBody py={4}>
              <Tabs colorScheme="brand" isLazy defaultIndex={defaultTab === "historia" ? 1 : 0}>
                <TabList>
                  <Tab fontSize="sm">Citas ({patient.appointments.length})</Tab>
                  <Tab fontSize="sm">Historia clínica</Tab>
                </TabList>
                <TabPanels>
                  <TabPanel px={0}>
                    <Stack spacing={3}>
                      {[...patient.appointments].reverse().map((appt) => (
                        <AppointmentItem key={appt.id} appointment={appt} onUpdated={onUpdated} />
                      ))}
                    </Stack>
                  </TabPanel>
                  <TabPanel px={0}>
                    <Text fontSize="sm" color="text.muted" mb={4}>
                      {isAdmin
                        ? "Todas las fichas del paciente, de la más reciente a la más antigua."
                        : "Todas las fichas del paciente, también las de otros doctores. Solo puedes editar las que creaste tú, desde la cita."}
                    </Text>
                    <PatientRecordsList appointmentId={latest?.id} patientLabel={`${patient.firstName} ${patient.lastName} · ${patient.ci}`} />
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </DrawerBody>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
};

export default PatientDrawer;
