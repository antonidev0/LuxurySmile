import { Button, Flex, Grid, Select } from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { FiPlus, FiX } from "react-icons/fi";
import AgendaList from "../../components/dashboard/AgendaList";
import AppointmentDrawer from "../../components/dashboard/AppointmentDrawer";
import MonthCalendar from "../../components/dashboard/MonthCalendar";
import RescheduleModal from "../../components/dashboard/RescheduleModal";
import ErrorState from "../../components/ui/ErrorState";
import LoadingState from "../../components/ui/LoadingState";
import PageHeader from "../../components/ui/PageHeader";
import Panel from "../../components/ui/Panel";
import { useAppointments } from "../../hooks/useAppointments";
import { useSelectedAppointment } from "../../hooks/useSelectedAppointment";
import { useStaff } from "../../hooks/useStaff";
import { applyFilters, appointmentsOn, dayCounts, dayCountsText, EMPTY_FILTERS, STATUS_META, STATUSES } from "../../utils/appointments";
import { formatLongDay, fromDayKey, monthKey, todayKey, toDayKey } from "../../utils/dates";

const monthOf = (key) => {
  const d = fromDayKey(key);
  return { year: d.getFullYear(), month: d.getMonth() };
};
const keyOfMonth = ({ year, month }) => `${year}-${String(month + 1).padStart(2, "0")}`;

const CalendarPage = () => {
  const { appointments, loading, error, reload, refresh, replaceAppointment, addAppointment, role } = useAppointments();
  const isAdmin = role === "admin";
  const { doctors } = useStaff(isAdmin);
  const [selectedDay, setSelectedDay] = useState(todayKey);
  const [month, setMonth] = useState(() => monthOf(todayKey()));
  // Solo se usan el estado y (admin) el doctor de los filtros de citas
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  // Nueva cita: { date } desde la cabecera o { patient } desde la ficha de una cita
  const [creating, setCreating] = useState(null);
  const drawer = useSelectedAppointment(appointments);

  const filtered = useMemo(() => applyFilters(appointments, filters), [appointments, filters]);
  const dayList = useMemo(() => appointmentsOn(filtered, selectedDay), [filtered, selectedDay]);
  const dayTotal = useMemo(() => appointmentsOn(appointments, selectedDay).length, [appointments, selectedDay]);
  const hasFilters = Boolean(filters.status || filters.doctor);

  const setFilter = (key) => (e) => setFilters((f) => ({ ...f, [key]: e.target.value }));

  // Al cambiar de mes, la lista sigue al mes visible: hoy si es el mes actual, si no el día 1
  const changeMonth = (next) => {
    setMonth(next);
    const key = keyOfMonth(next);
    if (monthKey(selectedDay) !== key) setSelectedDay(monthKey(todayKey()) === key ? todayKey() : `${key}-01`);
  };

  const goToday = () => {
    setMonth(monthOf(todayKey()));
    setSelectedDay(todayKey());
  };

  // La cita nueva aparece en el calendario y se abre su ficha
  const handleCreated = (created) => {
    addAppointment(created);
    const day = toDayKey(created.date);
    setMonth(monthOf(day));
    setSelectedDay(day);
    drawer.open(created);
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <>
      <PageHeader
        title="Calendario"
        description="Toca un día para ver sus citas."
        actions={
          isAdmin && (
            <Button leftIcon={<FiPlus />} onClick={() => setCreating({ date: selectedDay })}>
              Nueva cita
            </Button>
          )
        }
      />
      <Grid templateColumns={{ base: "minmax(0, 1fr)", xl: "minmax(0, 2fr) minmax(0, 1fr)" }} gap={6} alignItems="start">
        <Panel>
          <Flex gap={2} mb={4} wrap="wrap">
            <Select size="sm" w={{ base: "full", sm: "auto" }} value={filters.status} onChange={setFilter("status")} bg="white" aria-label="Filtrar por estado">
              <option value="">Todos los estados</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_META[s].label}
                </option>
              ))}
            </Select>
            {isAdmin && (
              <Select size="sm" w={{ base: "full", sm: "auto" }} value={filters.doctor} onChange={setFilter("doctor")} bg="white" aria-label="Filtrar por doctor">
                <option value="">Todos los doctores</option>
                <option value="none">Sin asignar</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    Dr. {d.name} {d.lastName}
                    {d.deactivatedAt ? " (de baja)" : ""}
                  </option>
                ))}
              </Select>
            )}
            <Button size="sm" variant="ghost" leftIcon={<FiX />} onClick={() => setFilters(EMPTY_FILTERS)} isDisabled={!hasFilters}>
              Restablecer
            </Button>
          </Flex>
          <MonthCalendar
            month={month}
            onMonthChange={changeMonth}
            onToday={goToday}
            appointments={filtered}
            selected={selectedDay}
            onSelect={setSelectedDay}
          />
        </Panel>
        <Panel title={formatLongDay(selectedDay)} subtitle={dayCountsText(dayCounts(dayList))} position={{ xl: "sticky" }} top={{ xl: 24 }}>
          <AgendaList
            appointments={dayList}
            onSelect={drawer.open}
            emptyTitle={hasFilters && dayTotal ? "No hay citas con estos filtros" : "Sin citas este día"}
            emptyDescription={hasFilters && dayTotal ? "Restablece los filtros para ver todas las citas del día." : undefined}
          />
        </Panel>
      </Grid>
      <AppointmentDrawer
        appointment={drawer.selected}
        isOpen={drawer.isOpen}
        onClose={drawer.close}
        onUpdated={replaceAppointment}
        onCreated={addAppointment}
        onOpen={drawer.open}
        onConflict={refresh}
        onNewAppointment={isAdmin ? (appt) => setCreating({ patient: appt }) : undefined}
        doctors={doctors}
        appointments={appointments}
        canAssign={isAdmin}
      />
      {isAdmin && (
        <RescheduleModal
          mode="create"
          patient={creating?.patient}
          initialDate={creating?.date}
          isOpen={Boolean(creating)}
          onClose={() => setCreating(null)}
          doctors={doctors}
          appointments={appointments}
          onSaved={handleCreated}
          onConflict={refresh}
        />
      )}
    </>
  );
};

export default CalendarPage;
