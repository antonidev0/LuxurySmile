import { Button, Input, InputGroup, InputLeftElement, Select, SimpleGrid } from "@chakra-ui/react";
import { FiSearch, FiX } from "react-icons/fi";
import { EMPTY_FILTERS, STATUS_META, STATUSES } from "../../utils/appointments";

// Filtros en una sola fila: búsqueda, estado, fecha y (admin) doctor
const AppointmentFilters = ({ value, onChange, doctors }) => {
  const set = (key) => (e) => onChange({ ...value, [key]: e.target.value });
  const hasFilters = Object.values(value).some(Boolean);

  return (
    <SimpleGrid columns={{ base: 1, sm: 2, lg: doctors ? 5 : 4 }} spacing={3}>
      <InputGroup>
        <InputLeftElement pointerEvents="none" color="gray.400">
          <FiSearch />
        </InputLeftElement>
        <Input placeholder="Nombre, cédula o correo" value={value.search} onChange={set("search")} bg="white" />
      </InputGroup>
      <Select value={value.status} onChange={set("status")} bg="white" aria-label="Estado">
        <option value="">Todos los estados</option>
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {STATUS_META[s].label}
          </option>
        ))}
      </Select>
      <Input type="date" value={value.date} onChange={set("date")} bg="white" aria-label="Fecha" />
      {doctors && (
        <Select value={value.doctor} onChange={set("doctor")} bg="white" aria-label="Doctor">
          <option value="">Todos los doctores</option>
          <option value="none">Sin asignar</option>
          {doctors.map((d) => (
            <option key={d.id} value={d.id}>
              Dr. {d.name} {d.lastName}
            </option>
          ))}
        </Select>
      )}
      <Button variant="ghost" leftIcon={<FiX />} onClick={() => onChange(EMPTY_FILTERS)} isDisabled={!hasFilters}>
        Limpiar
      </Button>
    </SimpleGrid>
  );
};

export default AppointmentFilters;
