import { Grid } from "@chakra-ui/react";
import { useMemo, useState } from "react";
import AgendaList from "../../components/dashboard/AgendaList";
import AppointmentDrawer from "../../components/dashboard/AppointmentDrawer";
import MonthCalendar from "../../components/dashboard/MonthCalendar";
import ErrorState from "../../components/ui/ErrorState";
import LoadingState from "../../components/ui/LoadingState";
import PageHeader from "../../components/ui/PageHeader";
import Panel from "../../components/ui/Panel";
import { useAppointments } from "../../hooks/useAppointments";
import { useSelectedAppointment } from "../../hooks/useSelectedAppointment";
import { useStaff } from "../../hooks/useStaff";
import { appointmentsOn } from "../../utils/appointments";
import { formatLongDay, todayKey } from "../../utils/dates";

const CalendarPage = () => {
  const { appointments, loading, error, reload, replaceAppointment, role } = useAppointments();
  const isAdmin = role === "admin";
  const { doctors } = useStaff(isAdmin);
  const [selectedDay, setSelectedDay] = useState(todayKey);
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const drawer = useSelectedAppointment(appointments);
  const dayList = useMemo(() => appointmentsOn(appointments, selectedDay), [appointments, selectedDay]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <>
      <PageHeader title="Calendario" description="Toca un día para ver sus citas." />
      <Grid templateColumns={{ base: "1fr", xl: "2fr 1fr" }} gap={6} alignItems="start">
        <Panel>
          <MonthCalendar month={month} onMonthChange={setMonth} appointments={appointments} selected={selectedDay} onSelect={setSelectedDay} />
        </Panel>
        <Panel title={formatLongDay(selectedDay)} subtitle={`${dayList.length} citas`} position={{ xl: "sticky" }} top={{ xl: 24 }}>
          <AgendaList appointments={dayList} onSelect={drawer.open} emptyTitle="Sin citas este día" />
        </Panel>
      </Grid>
      <AppointmentDrawer
        appointment={drawer.selected}
        isOpen={drawer.isOpen}
        onClose={drawer.close}
        onUpdated={replaceAppointment}
        doctors={doctors}
        canAssign={isAdmin}
      />
    </>
  );
};

export default CalendarPage;
