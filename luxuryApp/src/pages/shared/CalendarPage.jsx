import { Button, Flex, Grid, Select } from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { FiPlus, FiX } from "react-icons/fi";
import DayCalendar from "../../components/calendar/DayCalendar";
import WeekCalendar from "../../components/calendar/WeekCalendar";
import AgendaList from "../../components/dashboard/AgendaList";
import AppointmentDrawer from "../../components/dashboard/AppointmentDrawer";
import MonthCalendar from "../../components/dashboard/MonthCalendar";
import RescheduleModal from "../../components/dashboard/RescheduleModal";
import ErrorState from "../../components/ui/ErrorState";
import LoadingState from "../../components/ui/LoadingState";
import PageHeader from "../../components/ui/PageHeader";
import Panel from "../../components/ui/Panel";
import SegmentedControl from "../../components/ui/SegmentedControl";
import { useAppointments } from "../../hooks/useAppointments";
import { useSelectedAppointment } from "../../hooks/useSelectedAppointment";
import { useStaff } from "../../hooks/useStaff";
import { applyFilters, appointmentsOn, dayCounts, dayCountsText, EMPTY_FILTERS, STATUS_META, STATUSES } from "../../utils/appointments";
import { addDays, addMonths, formatLongDay, fromDayKey, monthKey, startOfWeek, todayKey, toDayKey } from "../../utils/dates";

const VIEWS = [
  ["day", "Día"],
  ["week", "Semana"],
  ["month", "Mes"],
];

const monthOf = (key) => {
  const d = fromDayKey(key);
  return { year: d.getFullYear(), month: d.getMonth() };
};
const keyOfMonth = ({ year, month }) => `${year}-${String(month + 1).padStart(2, "0")}`;

// Al cambiar de mes, el día elegido es hoy si es el mes actual o, si no, el día 1
const firstDayShown = (month) => (monthKey(todayKey()) === month ? todayKey() : `${month}-01`);

// Agenda en vista diaria, semanal o mensual. El admin ve todas las citas y crea nuevas;
// el doctor solo ve las suyas y no crea ni cancela citas.
const CalendarPage = () => {
  const { appointments, loading, error, reload, refresh, replaceAppointment, addAppointment, role } = useAppointments();
  const isAdmin = role === "admin";
  const { doctors } = useStaff(isAdmin);
  const [view, setView] = useState("month");
  const [selectedDay, setSelectedDay] = useState(todayKey);
  // Solo se usan el estado y (admin) el doctor de los filtros de citas
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  // Nueva cita (solo admin): { date } desde la cabecera o { patient } desde la ficha de una cita
  const [creating, setCreating] = useState(null);
  const drawer = useSelectedAppointment(appointments);

  const filtered = useMemo(() => applyFilters(appointments, filters), [appointments, filters]);
  const dayList = useMemo(() => appointmentsOn(filtered, selectedDay), [filtered, selectedDay]);
  const dayTotal = useMemo(() => appointmentsOn(appointments, selectedDay).length, [appointments, selectedDay]);
  const hasFilters = Boolean(filters.status || filters.doctor);
  const emptyDay = hasFilters && dayTotal
    ? { emptyTitle: "No hay citas con estos filtros", emptyDescription: "Restablece los filtros para ver todas las citas del día." }
    : { emptyTitle: "Sin citas este día" };

  const setFilter = (key) => (e) => setFilters((f) => ({ ...f, [key]: e.target.value }));
  const goToday = () => setSelectedDay(todayKey());
  const changeMonth = (next) => setSelectedDay(firstDayShown(keyOfMonth(next)));
  const shift = (delta) => {
    if (view === "day") return setSelectedDay((d) => addDays(d, delta));
    if (view === "week") return setSelectedDay((d) => addDays(d, 7 * delta));
    setSelectedDay((d) => firstDayShown(monthKey(addMonths(d, delta))));
  };
  const openDay = (key) => {
    setSelectedDay(key);
    setView("day");
  };

  // La cita nueva aparece en el calendario y se abre su ficha
  const handleCreated = (created) => {
    addAppointment(created);
    setSelectedDay(toDayKey(created.date));
    drawer.open(created);
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const navigation = { onPrev: () => shift(-1), onNext: () => shift(1), onToday: goToday };

  return (
    <>
      <PageHeader
        title="Calendario"
        description={isAdmin ? "Agenda de la clínica por día, semana o mes." : "Tu agenda por día, semana o mes."}
        actions={
          isAdmin && (
            <Button leftIcon={<FiPlus />} onClick={() => setCreating({ date: selectedDay })}>
              Nueva cita
            </Button>
          )
        }
      />
      <Flex gap={2} mb={4} wrap="wrap" align="center" justify="space-between">
        <SegmentedControl options={VIEWS} value={view} onChange={setView} label="Vista del calendario" />
        <Flex gap={2} wrap="wrap">
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
      </Flex>

      {view === "day" && (
        <Panel>
          <DayCalendar day={selectedDay} appointments={filtered} onSelectAppointment={drawer.open} {...navigation} {...emptyDay} />
        </Panel>
      )}

      {view === "week" && (
        <Panel>
          <WeekCalendar weekStart={startOfWeek(selectedDay)} appointments={filtered} onSelectDay={openDay} onSelectAppointment={drawer.open} {...navigation} />
        </Panel>
      )}

      {view === "month" && (
        <Grid templateColumns={{ base: "minmax(0, 1fr)", xl: "minmax(0, 2fr) minmax(0, 1fr)" }} gap={6} alignItems="start">
          <Panel>
            <MonthCalendar
              month={monthOf(selectedDay)}
              onMonthChange={changeMonth}
              onToday={goToday}
              appointments={filtered}
              selected={selectedDay}
              onSelect={setSelectedDay}
            />
          </Panel>
          <Panel title={formatLongDay(selectedDay)} subtitle={dayCountsText(dayCounts(dayList))} position={{ xl: "sticky" }} top={{ xl: 24 }}>
            <AgendaList appointments={dayList} onSelect={drawer.open} {...emptyDay} />
          </Panel>
        </Grid>
      )}

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
