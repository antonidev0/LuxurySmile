import {
  Box,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Grid,
  Stack,
  Text,
} from "@chakra-ui/react";
import { formatLongDay, formatTime } from "../../utils/dates";
import StatusBadge from "../ui/StatusBadge";
import DoctorAssigner from "./DoctorAssigner";
import MedicalRecordActions from "./MedicalRecordActions";
import StatusSelect from "./StatusSelect";

const Detail = ({ label, children }) => (
  <Box>
    <Text fontSize="xs" color="text.muted" textTransform="uppercase" letterSpacing="0.06em">
      {label}
    </Text>
    <Text fontWeight="500" wordBreak="break-word">
      {children}
    </Text>
  </Box>
);

const SectionTitle = ({ children }) => (
  <Text fontWeight="700" fontSize="sm" mb={3}>
    {children}
  </Text>
);

/**
 * Ficha completa de una cita con todas sus acciones.
 * doctors solo se pasa para el admin (para asignar).
 */
const AppointmentDrawer = ({ appointment, isOpen, onClose, onUpdated, doctors, canAssign = false }) => (
  <Drawer isOpen={isOpen && Boolean(appointment)} onClose={onClose} placement="right" size="md">
    <DrawerOverlay />
    <DrawerContent>
      <DrawerCloseButton mt={2} />
      {appointment && (
        <>
          <DrawerHeader borderBottomWidth="1px">
            <Text fontSize="xl">
              {appointment.firstName} {appointment.lastName}
            </Text>
            <StatusBadge status={appointment.status} mt={1} />
          </DrawerHeader>
          <DrawerBody py={6}>
            <Stack spacing={6}>
              <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap={4}>
                <Detail label="Fecha">
                  {formatLongDay(appointment.date)}
                </Detail>
                <Detail label="Hora">{formatTime(appointment.time)}</Detail>
                <Detail label="Cédula">{appointment.ci}</Detail>
                <Detail label="Correo">{appointment.email}</Detail>
              </Grid>

              <Divider />
              <Box>
                <SectionTitle>Estado</SectionTitle>
                <StatusSelect appointment={appointment} onUpdated={onUpdated} size="md" />
              </Box>

              <Box>
                <SectionTitle>Doctores</SectionTitle>
                {canAssign ? (
                  <DoctorAssigner appointment={appointment} doctors={doctors ?? []} onUpdated={onUpdated} />
                ) : (
                  <Text fontSize="sm">{(appointment.assignedDoctors ?? []).map((d) => `Dr. ${d.name} ${d.lastName}`).join(", ") || "—"}</Text>
                )}
              </Box>

              {Array.isArray(appointment.completedBy) && appointment.completedBy.length > 0 && (
                <Box>
                  <SectionTitle>Completada por</SectionTitle>
                  {appointment.completedBy.map((d) => (
                    <Text key={d.email} fontSize="sm">
                      {d.name} · {d.specialty}
                    </Text>
                  ))}
                </Box>
              )}

              <Divider />
              <Box>
                <SectionTitle>Historia clínica</SectionTitle>
                <MedicalRecordActions appointment={appointment} onUpdated={onUpdated} />
              </Box>
            </Stack>
          </DrawerBody>
        </>
      )}
    </DrawerContent>
  </Drawer>
);

export default AppointmentDrawer;
