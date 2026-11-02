import { fetchPatientRecords } from "../services/records.service";
import { useAsync } from "./useAsync";

/**
 * Historia clínica completa de un paciente (todas sus fichas, las escriba quien las escriba),
 * a partir de cualquiera de sus citas. Cada ficha indica con canEdit si el usuario puede editarla.
 */
export const usePatientRecords = (appointmentId) => {
  const { data, loading, error, reload } = useAsync(
    () => (appointmentId ? fetchPatientRecords(appointmentId) : Promise.resolve([])),
    [appointmentId],
    []
  );
  return { records: data ?? [], loading, error, reload };
};
