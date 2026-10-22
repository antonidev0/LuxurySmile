import { Alert, AlertDescription, AlertIcon, Button, Grid, GridItem, SimpleGrid } from "@chakra-ui/react";
import { useMemo } from "react";
import { FiAlertCircle, FiCalendar, FiCheckCircle, FiUsers } from "react-icons/fi";
import { Link } from "react-router-dom";
import AgendaList from "../../components/dashboard/AgendaList";
import AppointmentDrawer from "../../components/dashboard/AppointmentDrawer";
import DoctorLoadChart from "../../components/dashboard/DoctorLoadChart";
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
import { useStaff } from "../../hooks/useStaff";
import {
  appointmentsOn,
  countByStatus,
  groupPatients,
  isActive,
  monthlySeries,
  upcomingAppointments,
} from "../../utils/appointments";
import { greeting, monthKey, todayKey, toDayKey } from "../../utils/dates";

const AdminOverviewPage = () => {
  const { user } = useAuth();
  const { appointments, loading, error, reload, refresh, replaceAppointment, addAppointment } = useAppointments();
  const { doctors } = useStaff();
  const drawer = useSelectedAppointment(appointments);

  const stats = useMemo(() => {
    const today = todayKey();
    const thisMonth = monthKey(today);
    const todayList = appointmentsOn(appointments, today);
    const unassigned = appointments.filter((a) => isActive(a) && toDayKey(a.date) >= today && !a.assignedDoctors?.length);
    return {
      today: todayList,
      pending: appointments.filter((a) => a.status === "pendiente").length,
      completedMonth: appointments.filter((a) => a.status === "completada" && monthKey(toDayKey(a.date)) === thisMonth).length,
      patients: groupPatients(appointments).length,
      unassigned,
      counts: countByStatus(appointments),
      monthly: monthlySeries(appointments, 6),
      upcoming: upcomingAppointments(appointments.filter((a) => toDayKey(a.date) > today), 6),
      doctorLoad: doctors
        .map((d) => ({
          name: `Dr. ${d.lastName}`,
          citas: appointments.filter((a) => isActive(a) && a.assignedDoctors?.some((x) => x.id === d.id)).length,
        }))
        .sort((a, b) => b.citas - a.citas),
    };
  }, [appointments, doctors]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <>
      <PageHeader
        title={`${greeting()}, ${user.name}`}
        description="Así va la clínica hoy."
        actions={
          <Button as={Link} to="/admin/dashboard/citas" leftIcon={<FiCalendar />}>
            Gestionar citas
          </Button>
        }
      />

      {stats.unassigned.length > 0 && (
        <Alert status="warning" borderRadius="xl" mb={6} flexWrap="wrap" gap={2}>
          <AlertIcon />
          <AlertDescription flex="1" fontSize="sm">
            Hay {stats.unassigned.length} {stats.unassigned.length === 1 ? "cita próxima" : "citas próximas"} sin doctor asignado.
          </AlertDescription>
          <Button as={Link} to="/admin/dashboard/citas?doctor=none" size="sm" variant="outline" colorScheme="orange">
            Asignar ahora
          </Button>
        </Alert>
      )}

      <SimpleGrid columns={{ base: 1, sm: 2, xl: 4 }} spacing={4} mb={6}>
        <StatCard label="Citas hoy" value={stats.today.length} icon={FiCalendar} hint={`${stats.today.filter(isActive).length} por atender`} />
        <StatCard label="Por confirmar" value={stats.pending} icon={FiAlertCircle} color="orange" hint="Solicitudes pendientes" />
        <StatCard label="Completadas este mes" value={stats.completedMonth} icon={FiCheckCircle} color="green" />
        <StatCard label="Pacientes" value={stats.patients} icon={FiUsers} color="purple" hint={`${doctors.length} doctores en el equipo`} />
      </SimpleGrid>

      <Grid templateColumns={{ base: "1fr", xl: "2fr 1fr" }} gap={6}>
        <GridItem>
          <Panel title="Citas por mes" subtitle="Últimos 6 meses">
            <MonthlyTrendChart data={stats.monthly} />
          </Panel>
        </GridItem>
        <GridItem>
          <Panel title="Estado de las citas" subtitle="Histórico total">
            <StatusDonut counts={stats.counts} />
          </Panel>
        </GridItem>

        <GridItem>
          <Panel
            title="Agenda de hoy"
            subtitle={`${stats.today.length} citas`}
            action={
              <Button as={Link} to="/admin/dashboard/calendario" size="sm" variant="ghost">
                Ver calendario
              </Button>
            }
          >
            <AgendaList appointments={stats.today} onSelect={drawer.open} emptyTitle="No hay citas para hoy" />
          </Panel>
        </GridItem>
        <GridItem>
          <Panel title="Carga por doctor" subtitle="Citas pendientes y confirmadas">
            <DoctorLoadChart data={stats.doctorLoad} />
          </Panel>
        </GridItem>

        <GridItem colSpan={{ base: 1, xl: 2 }}>
          <Panel title="Próximas citas">
            <AgendaList appointments={stats.upcoming} onSelect={drawer.open} showDate emptyTitle="No hay citas próximas" />
          </Panel>
        </GridItem>
      </Grid>

      <AppointmentDrawer
        appointment={drawer.selected}
        isOpen={drawer.isOpen}
        onClose={drawer.close}
        onUpdated={replaceAppointment}
        onCreated={addAppointment}
        onOpen={drawer.open}
        onConflict={refresh}
        doctors={doctors}
        appointments={appointments}
        canAssign
      />
    </>
  );
};

export default AdminOverviewPage;
