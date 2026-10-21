import { Button, Input, InputGroup, InputLeftElement, Select, SimpleGrid } from "@chakra-ui/react";
import { FiSearch, FiX } from "react-icons/fi";
import { ACCOUNT_STATUS, EMPTY_STAFF_FILTERS } from "../../utils/staff";

// Búsqueda + filtros por rol, especialidad y estado de la cuenta (se combinan entre sí)
const StaffFilters = ({ value, onChange, specialties }) => {
  const set = (key) => (e) => onChange({ ...value, [key]: e.target.value });
  const hasFilters = Object.values(value).some(Boolean);

  return (
    <SimpleGrid columns={{ base: 1, sm: 2, lg: 5 }} spacing={3} mb={5}>
      <InputGroup>
        <InputLeftElement pointerEvents="none" color="gray.400">
          <FiSearch />
        </InputLeftElement>
        <Input placeholder="Buscar por nombre o especialidad" value={value.search} onChange={set("search")} bg="white" />
      </InputGroup>
      <Select value={value.role} onChange={set("role")} bg="white" aria-label="Rol">
        <option value="">Todos los roles</option>
        <option value="doctor">Doctores</option>
        <option value="admin">Administradores</option>
      </Select>
      {/* La especialidad solo aplica a doctores */}
      <Select value={value.specialty} onChange={set("specialty")} bg="white" aria-label="Especialidad" isDisabled={value.role === "admin"}>
        <option value="">Todas las especialidades</option>
        {specialties.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </Select>
      <Select value={value.status} onChange={set("status")} bg="white" aria-label="Estado de la cuenta">
        <option value="">Todos los estados</option>
        {Object.entries(ACCOUNT_STATUS).map(([key, meta]) => (
          <option key={key} value={key}>
            {meta.label}
          </option>
        ))}
      </Select>
      <Button variant="ghost" leftIcon={<FiX />} onClick={() => onChange(EMPTY_STAFF_FILTERS)} isDisabled={!hasFilters}>
        Limpiar filtros
      </Button>
    </SimpleGrid>
  );
};

export default StaffFilters;
