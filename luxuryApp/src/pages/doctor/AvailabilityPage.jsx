import { Grid, Text } from "@chakra-ui/react";
import { useMemo } from "react";
import AvailabilitySummary from "../../components/availability/AvailabilitySummary";
import AgendaList from "../../components/dashboard/AgendaList";
import AppointmentDrawer from "../../components/dashboard/AppointmentDrawer";
import ErrorState from "../../components/ui/ErrorState";
import LoadingState from "../../components/ui/LoadingState";
import PageHeader from "../../components/ui/PageHeader";
import Panel from "../../components/ui/Panel";
import { useAuth } from "../../context/AuthContext";
import { useAppointments } from "../../hooks/useAppointments";
import { useSelectedAppointment } from "../../hooks/useSelectedAppointment";
import { appointmentsBetween, upcomingAppointments } from "../../utils/appointments";
import { CLINIC_SCHEDULE_TEXT } from "../../utils/availability";
import { addDays, startOfWeek, todayKey } from "../../utils/dates";

// El doctor consulta su horario de atención y las citas de la semana.
// El horario lo define la administración.
const AvailabilityPage = () => {
  const { user } = useAuth();
  const { appointments, loading, error, reload, replaceAppointment } = useAppointments();
  const drawer = useSelectedAppointment(appointments);

  const thisWeek = useMemo(() => {
    const monday = startOfWeek(todayKey());
    return upcomingAppointments(appointmentsBetween(appointments, monday, addDays(monday, 6)), 50);
  }, [appointments]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <>
      <PageHeader title="Disponibilidad horaria" description={`Días y horas en los que atiendes citas. ${CLINIC_SCHEDULE_TEXT}`} />
      <Grid templateColumns={{ base: "minmax(0, 1fr)", xl: "minmax(0, 2fr) minmax(0, 3fr)" }} gap={6} alignItems="start">
        <Panel title="Mi horario semanal" subtitle="Solo se te agendan citas dentro de este horario.">
          <AvailabilitySummary availability={user.availability} highlightDay={new Date().getDay()} />
          <Text fontSize="xs" color="text.muted" mt={5}>
            Si necesitas cambiar tu horario, pídeselo a la administración.
          </Text>
        </Panel>
        <Panel title="Mis citas de esta semana" subtitle="Pendientes y confirmadas, desde hoy.">
          <AgendaList appointments={thisWeek} onSelect={drawer.open} showDate emptyTitle="Sin citas esta semana" />
        </Panel>
      </Grid>
      <AppointmentDrawer appointment={drawer.selected} isOpen={drawer.isOpen} onClose={drawer.close} onUpdated={replaceAppointment} />
    </>
  );
};

export default AvailabilityPage;
