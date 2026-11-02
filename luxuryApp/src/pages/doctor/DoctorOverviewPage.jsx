import { Button, Grid, GridItem, SimpleGrid } from "@chakra-ui/react";
import { useMemo } from "react";
import { FiCalendar, FiCheckCircle, FiClock, FiUsers } from "react-icons/fi";
import { Link } from "react-router-dom";
import AvailabilitySummary from "../../components/availability/AvailabilitySummary";
import AgendaList from "../../components/dashboard/AgendaList";
import AppointmentDrawer from "../../components/dashboard/AppointmentDrawer";
import MonthlyTrendChart from "../../components/dashboard/MonthlyTrendChart";
import StatusDonut from "../../components/dashboard/StatusDonut";
import ErrorState from "../../components/ui/ErrorState";
import LoadingState from "../../components/ui/LoadingState";
import PageHeader from "../../components/ui/PageHeader";
import Panel from "../../components/ui/Panel";
import StatCard from "../../components/ui/StatCard";
import { useAuth } from "../../context/AuthContext";
import { useAppointments } from "../../hooks/useAppointments";
import { useSelectedAppointment } from "../../hooks/useSelectedAppointment";
import {
  appointmentsOn,
  countByStatus,
  groupPatients,
  isActive,
  monthlySeries,
  plural,
  sortByDateTime,
  upcomingAppointments,
} from "../../utils/appointments";
import { formatTime, greeting, monthKey, todayKey, toDayKey } from "../../utils/dates";

const DoctorOverviewPage = () => {
  const { user } = useAuth();
  const { appointments, loading, error, reload, replaceAppointment } = useAppointments();
  const drawer = useSelectedAppointment(appointments);

  const stats = useMemo(() => {
    const today = todayKey();
    const todayList = appointmentsOn(appointments, today);
    const nextToday = todayList.find((a) => isActive(a));
    return {
      today: todayList,
      nextToday,
      upcoming: upcomingAppointments(appointments.filter((a) => toDayKey(a.date) > today), 6),
      completedMonth: appointments.filter((a) => a.status === "completada" && monthKey(toDayKey(a.date)) === monthKey(today)).length,
      patients: groupPatients(appointments).length,
      pendingRecords: sortByDateTime(appointments.filter((a) => a.status === "completada" && !a.historialPDF)).reverse(),
      counts: countByStatus(appointments),
      monthly: monthlySeries(appointments, 6),
    };
  }, [appointments]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <>
      <PageHeader
        title={`${greeting()}, Dr. ${user.lastName}`}
        description={
          stats.nextToday
            ? `Tu próxima cita de hoy es a las ${formatTime(stats.nextToday.time)} con ${stats.nextToday.firstName} ${stats.nextToday.lastName}.`
            : "No tienes más citas pendientes hoy."
        }
        actions={
          <Button as={Link} to="/doctor/dashboard/calendario" leftIcon={<FiCalendar />}>
            Ver mi calendario
          </Button>
        }
      />

      <SimpleGrid columns={{ base: 1, sm: 2, xl: 4 }} spacing={4} mb={6}>
        <StatCard label="Citas hoy" value={stats.today.length} icon={FiCalendar} hint={`${stats.today.filter(isActive).length} por atender`} />
        <StatCard label="Próximas" value={upcomingAppointments(appointments, 999).length} icon={FiClock} color="orange" hint="Pendientes y confirmadas" />
        <StatCard label="Completadas este mes" value={stats.completedMonth} icon={FiCheckCircle} color="green" />
        <StatCard label="Mis pacientes" value={stats.patients} icon={FiUsers} color="purple" hint={stats.pendingRecords.length ? `${plural(stats.pendingRecords.length, "ficha")} por llenar` : "Fichas al día"} />
      </SimpleGrid>

      <Grid templateColumns={{ base: "1fr", xl: "3fr 2fr" }} gap={6}>
        <GridItem>
          <Panel title="Mi agenda de hoy" subtitle={`${stats.today.length} citas`}>
            <AgendaList appointments={stats.today} onSelect={drawer.open} emptyTitle="Día libre" emptyDescription="No tienes citas asignadas para hoy." />
          </Panel>
        </GridItem>
        <GridItem>
          <Panel title="Próximos días">
            <AgendaList appointments={stats.upcoming} onSelect={drawer.open} showDate emptyTitle="Nada programado" />
          </Panel>
        </GridItem>
        <GridItem>
          <Panel title="Mi actividad" subtitle="Últimos 6 meses">
            <MonthlyTrendChart data={stats.monthly} />
          </Panel>
        </GridItem>
        <GridItem>
          <Panel title="Estado de mis citas">
            <StatusDonut counts={stats.counts} />
          </Panel>
        </GridItem>
        <GridItem>
          <Panel
            title="Fichas clínicas por llenar"
            subtitle="Citas completadas sin historia clínica"
            action={
              <Button as={Link} to="/doctor/dashboard/historias" size="xs" variant="ghost">
                Ver todas
              </Button>
            }
          >
            <AgendaList appointments={stats.pendingRecords.slice(0, 5)} onSelect={drawer.open} showDate emptyTitle="Todo al día" emptyDescription="Todas tus consultas completadas tienen su ficha." />
          </Panel>
        </GridItem>
        <GridItem>
          <Panel
            title="Mi horario"
            action={
              <Button as={Link} to="/doctor/dashboard/disponibilidad" size="xs" variant="ghost">
                Ver disponibilidad
              </Button>
            }
          >
            <AvailabilitySummary availability={user.availability} highlightDay={new Date().getDay()} />
          </Panel>
        </GridItem>
      </Grid>

      <AppointmentDrawer appointment={drawer.selected} isOpen={drawer.isOpen} onClose={drawer.close} onUpdated={replaceAppointment} />
    </>
  );
};

export default DoctorOverviewPage;
