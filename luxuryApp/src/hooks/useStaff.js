import { useMemo } from "react";
import { fetchStaff } from "../services/staff.service";
import { useAsync } from "./useAsync";

// Personal de la clínica (solo admin). enabled=false evita la petición para doctores.
export const useStaff = (enabled = true) => {
  const { data, loading, error, reload, setData } = useAsync(
    () => (enabled ? fetchStaff() : Promise.resolve([])),
    [enabled],
    []
  );
  const staff = useMemo(() => data ?? [], [data]);
  const doctors = useMemo(() => staff.filter((s) => s.role === "doctor"), [staff]);
  return { staff, doctors, loading, error, reload, setStaff: setData };
};
