import { Button, HStack, Text } from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { FiRefreshCw } from "react-icons/fi";
import { useSearchParams } from "react-router-dom";
import AppointmentDrawer from "../../components/dashboard/AppointmentDrawer";
import AppointmentFilters from "../../components/dashboard/AppointmentFilters";
import AppointmentsTable from "../../components/dashboard/AppointmentsTable";
import ErrorState from "../../components/ui/ErrorState";
import LoadingState from "../../components/ui/LoadingState";
import PageHeader from "../../components/ui/PageHeader";
import Panel from "../../components/ui/Panel";
import { useAppointments } from "../../hooks/useAppointments";
import { useSelectedAppointment } from "../../hooks/useSelectedAppointment";
import { useStaff } from "../../hooks/useStaff";
import { EMPTY_FILTERS, matchesSearch, sortByDateTime } from "../../utils/appointments";
import { todayKey, toDayKey } from "../../utils/dates";

const applyFilters = (appointments, filters) =>
  appointments.filter((a) => {
    if (filters.status && a.status !== filters.status) return false;
    if (filters.date && toDayKey(a.date) !== filters.date) return false;
    if (filters.doctor === "none" && a.assignedDoctors?.length) return false;
    if (filters.doctor && filters.doctor !== "none" && !a.assignedDoctors?.some((d) => d.id === filters.doctor)) return false;
    return matchesSearch(a, filters.search);
  });

// Gestión de citas: el admin ve todas y asigna doctores; el doctor ve las suyas
const AppointmentsPage = () => {
  const { appointments, loading, error, reload, replaceAppointment, role } = useAppointments();
  const isAdmin = role === "admin";
  const { doctors } = useStaff(isAdmin);
  const [params] = useSearchParams();
  const [filters, setFilters] = useState({ ...EMPTY_FILTERS, doctor: params.get("doctor") ?? "" });
  const [scope, setScope] = useState("upcoming");
  const drawer = useSelectedAppointment(appointments);

  const visible = useMemo(() => {
    const today = todayKey();
    const inScope = appointments.filter((a) =>
      scope === "upcoming" ? toDayKey(a.date) >= today : scope === "past" ? toDayKey(a.date) < today : true
    );
    const sorted = sortByDateTime(applyFilters(inScope, filters));
    return scope === "past" ? sorted.reverse() : sorted;
  }, [appointments, filters, scope]);

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

      <Panel mb={6}>
        <AppointmentFilters value={filters} onChange={setFilters} doctors={isAdmin ? doctors : undefined} />
      </Panel>

      <Panel
        title={`${visible.length} ${visible.length === 1 ? "cita" : "citas"}`}
        action={
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
        }
      >
        <AppointmentsTable appointments={visible} onSelect={drawer.open} onUpdated={replaceAppointment} />
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
        doctors={doctors}
        canAssign={isAdmin}
      />
    </>
  );
};

export default AppointmentsPage;
