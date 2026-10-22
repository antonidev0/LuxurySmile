import { Button, HStack, Select, Text } from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { FiRefreshCw } from "react-icons/fi";
import { useSearchParams } from "react-router-dom";
import AppointmentDrawer from "../../components/dashboard/AppointmentDrawer";
import AppointmentFilters from "../../components/dashboard/AppointmentFilters";
import AppointmentSummary from "../../components/dashboard/AppointmentSummary";
import AppointmentsTable from "../../components/dashboard/AppointmentsTable";
import ErrorState from "../../components/ui/ErrorState";
import LoadingState from "../../components/ui/LoadingState";
import PageHeader from "../../components/ui/PageHeader";
import Panel from "../../components/ui/Panel";
import { useAppointments } from "../../hooks/useAppointments";
import { useSelectedAppointment } from "../../hooks/useSelectedAppointment";
import { useStaff } from "../../hooks/useStaff";
import { applyFilters, EMPTY_FILTERS, hasDateFilter, sortAppointments, summaryCounts } from "../../utils/appointments";
import { todayKey, toDayKey } from "../../utils/dates";

const SORTS = [
  ["priority", "Prioridad: pendientes y próximas primero"],
  ["asc", "Fecha y hora (más antiguas primero)"],
  ["desc", "Fecha y hora (más recientes primero)"],
];

// Gestión de citas: el admin ve todas y las gestiona; el doctor ve las suyas
const AppointmentsPage = () => {
  const { appointments, loading, error, reload, refresh, replaceAppointment, addAppointment, role } = useAppointments();
  const isAdmin = role === "admin";
  const { doctors } = useStaff(isAdmin);
  const [params] = useSearchParams();
  const [filters, setFilters] = useState({ ...EMPTY_FILTERS, doctor: params.get("doctor") ?? "" });
  const [scope, setScope] = useState("upcoming");
  const [sort, setSort] = useState("priority");
  const drawer = useSelectedAppointment(appointments);

  const counts = useMemo(() => summaryCounts(appointments), [appointments]);
  const byDate = hasDateFilter(filters);
  // Tarjeta seleccionada en los contadores (un estado o "today")
  const activeCard = filters.dateMode === "day" && filters.date === todayKey() && !filters.status ? "today" : filters.status;

  const visible = useMemo(() => {
    const today = todayKey();
    // Si se filtra por fechas, mandan las fechas elegidas en lugar de Próximas / Pasadas
    const inScope = byDate
      ? appointments
      : appointments.filter((a) =>
          scope === "upcoming" ? toDayKey(a.date) >= today || a.status === "pendiente" : scope === "past" ? toDayKey(a.date) < today : true
        );
    return sortAppointments(applyFilters(inScope, filters), sort);
  }, [appointments, filters, scope, sort, byDate]);

  const selectCard = (key) => {
    if (key === activeCard) return setFilters((f) => ({ ...f, status: "", ...(key === "today" ? { date: "" } : {}) }));
    if (key === "today") return setFilters((f) => ({ ...f, status: "", dateMode: "day", date: todayKey(), dateFrom: "", dateTo: "" }));
    setFilters((f) => ({ ...f, status: key }));
    // Las canceladas suelen ser pasadas: se muestran todas
    if (key === "cancelada") setScope("all");
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <>
      <PageHeader
        title={isAdmin ? "Citas" : "Mis citas"}
        description={isAdmin ? "Confirma solicitudes, asigna doctores y lleva el estado de cada cita." : "Las citas que tienes asignadas."}
        actions={
          <Button variant="outline" leftIcon={<FiRefreshCw />} onClick={reload}>
            Actualizar
          </Button>
        }
      />

      <AppointmentSummary counts={counts} active={activeCard} onSelect={selectCard} />

      <Panel mb={6}>
        <AppointmentFilters value={filters} onChange={setFilters} doctors={isAdmin ? doctors : undefined} />
      </Panel>

      <Panel
        title={`${visible.length} ${visible.length === 1 ? "cita" : "citas"}`}
        subtitle={byDate ? "Según las fechas elegidas" : scope === "upcoming" ? "Desde hoy, más las solicitudes pendientes" : undefined}
        action={
          <HStack spacing={2} flexWrap="wrap">
            <Select size="xs" borderRadius="full" w="auto" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Ordenar">
              {SORTS.map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </Select>
            {!byDate && (
              <HStack spacing={1} bg="gray.100" p={1} borderRadius="full">
                {[
                  ["upcoming", "Próximas"],
                  ["past", "Pasadas"],
                  ["all", "Todas"],
                ].map(([key, label]) => (
                  <Button key={key} size="xs" px={3} variant={scope === key ? "solid" : "ghost"} onClick={() => setScope(key)}>
                    {label}
                  </Button>
                ))}
              </HStack>
            )}
          </HStack>
        }
      >
        <AppointmentsTable
          appointments={visible}
          onSelect={drawer.open}
          emptyTitle={appointments.length ? "No hay citas con estos filtros" : "Todavía no hay citas"}
          emptyDescription={appointments.length ? "Prueba a cambiar o limpiar los filtros." : isAdmin ? "Las solicitudes de la web aparecerán aquí." : "Cuando te asignen una cita aparecerá aquí."}
        />
        {!isAdmin && (
          <Text fontSize="xs" color="text.muted" mt={4}>
            Si necesitas que te asignen o reasignen una cita, pídeselo a la administración.
          </Text>
        )}
      </Panel>

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
        canAssign={isAdmin}
      />
    </>
  );
};

export default AppointmentsPage;
