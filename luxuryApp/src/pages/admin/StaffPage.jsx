import { Button, SimpleGrid } from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { FiUserPlus } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import AccessModal from "../../components/staff/AccessModal";
import AvailabilityModal from "../../components/staff/AvailabilityModal";
import DeactivateDoctorModal from "../../components/staff/DeactivateDoctorModal";
import RoleModal from "../../components/staff/RoleModal";
import StaffCard from "../../components/staff/StaffCard";
import StaffEditModal from "../../components/staff/StaffEditModal";
import StaffFilters from "../../components/staff/StaffFilters";
import StaffProfileDrawer from "../../components/staff/StaffProfileDrawer";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import EmptyState from "../../components/ui/EmptyState";
import ErrorState from "../../components/ui/ErrorState";
import LoadingState from "../../components/ui/LoadingState";
import PageHeader from "../../components/ui/PageHeader";
import Panel from "../../components/ui/Panel";
import { useAuth } from "../../context/AuthContext";
import { useAppointments } from "../../hooks/useAppointments";
import { useNotify } from "../../hooks/useNotify";
import { useStaff } from "../../hooks/useStaff";
import { reactivateStaff, verifyStaff } from "../../services/staff.service";
import { isActive } from "../../utils/appointments";
import { accountStatus, EMPTY_STAFF_FILTERS } from "../../utils/staff";

const matchesFilters = (person, filters) => {
  if (filters.role && person.role !== filters.role) return false;
  // La especialidad solo existe en los doctores
  if (filters.specialty && (person.role !== "doctor" || person.specialty !== filters.specialty)) return false;
  if (filters.status && accountStatus(person) !== filters.status) return false;
  const q = filters.search.trim().toLowerCase();
  const fields = [person.name, person.lastName, person.email, person.role === "doctor" ? person.specialty : ""];
  return !q || fields.some((f) => f?.toLowerCase().includes(q));
};

const StaffPage = () => {
  const notify = useNotify();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { staff, doctors, loading, error, reload, setStaff } = useStaff();
  const { appointments, reload: reloadAppointments, replaceAppointment } = useAppointments();
  const [filters, setFilters] = useState(EMPTY_STAFF_FILTERS);
  // Acción abierta desde el menú ⋯ de una tarjeta: { type, person }
  const [action, setAction] = useState(null);
  const [reactivating, setReactivating] = useState(false);

  const filtered = useMemo(() => staff.filter((s) => matchesFilters(s, filters)), [staff, filters]);
  const specialties = useMemo(() => [...new Set(doctors.map((d) => d.specialty))].sort(), [doctors]);
  const activeAdmins = staff.filter((s) => s.role === "admin" && !s.deactivatedAt).length;

  const activeCount = (id) => appointments.filter((a) => isActive(a) && a.assignedDoctors?.some((d) => d.id === id)).length;

  const replaceStaff = (updated) => setStaff((list) => list.map((s) => (s.id === updated.id ? updated : s)));
  const closeAction = () => setAction(null);
  // Se busca en la lista para mostrar siempre los datos actualizados
  const opened = (type) => (action?.type === type ? staff.find((s) => s.id === action.person.id) ?? null : null);

  const handleAction = (type, person) => {
    if (type === "appointments") {
      navigate(`/admin/dashboard/citas?doctor=${person.id}`);
      return;
    }
    setAction({ type, person });
  };

  const handleVerify = async (person) => {
    try {
      const updated = await verifyStaff(person.id);
      replaceStaff(updated);
      notify.success("Cuenta activada", `${person.name} ${person.lastName} ya puede iniciar sesión.`);
    } catch (err) {
      notify.error("No se pudo activar la cuenta", err);
    }
  };

  const confirmReactivate = async () => {
    setReactivating(true);
    try {
      replaceStaff(await reactivateStaff(action.person.id));
      notify.success("Cuenta reactivada");
      closeAction();
    } catch (err) {
      notify.error("No se pudo reactivar la cuenta", err);
    } finally {
      setReactivating(false);
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <>
      <PageHeader
        title="Personal"
        description={`${staff.filter((s) => s.role === "doctor").length} doctores y ${staff.filter((s) => s.role === "admin").length} administradores.`}
        actions={
          <Button as={Link} to="/admin/dashboard/registro" leftIcon={<FiUserPlus />}>
            Registrar personal
          </Button>
        }
      />
      <Panel>
        <StaffFilters value={filters} onChange={setFilters} specialties={specialties} />
        {filtered.length ? (
          <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={4}>
            {filtered.map((person) => (
              <StaffCard key={person.id} person={person} activeCount={activeCount(person.id)} onAction={handleAction} onVerify={handleVerify} />
            ))}
          </SimpleGrid>
        ) : (
          <EmptyState title="No hay personal que coincida" />
        )}
      </Panel>

      <StaffProfileDrawer person={opened("profile")} appointments={appointments} onClose={closeAction} />
      <StaffEditModal person={opened("edit")} staff={staff} onClose={closeAction} onSaved={replaceStaff} />
      <AvailabilityModal person={opened("availability")} onClose={closeAction} onSaved={replaceStaff} />
      <DeactivateDoctorModal
        doctor={opened("deactivate")}
        appointments={appointments}
        doctors={doctors}
        onClose={closeAction}
        onAppointmentUpdated={replaceAppointment}
        onDeactivated={replaceStaff}
        onConflict={reloadAppointments}
      />
      <AccessModal person={opened("access")} currentUserId={user.id} activeAdmins={activeAdmins} onClose={closeAction} onSaved={replaceStaff} />
      <RoleModal person={opened("role")} currentUserId={user.id} activeAdmins={activeAdmins} onClose={closeAction} onSaved={replaceStaff} />

      <ConfirmDialog
        isOpen={action?.type === "reactivate"}
        onClose={closeAction}
        onConfirm={confirmReactivate}
        isLoading={reactivating}
        title="Reactivar cuenta"
        confirmLabel="Reactivar"
        confirmColor="brand"
      >
        <b>
          Dr. {action?.person.name} {action?.person.lastName}
        </b>{" "}
        podrá volver a iniciar sesión y recibir citas.
      </ConfirmDialog>
    </>
  );
};

export default StaffPage;
