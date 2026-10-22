import { Box, Button, ButtonGroup, HStack, Input, InputGroup, InputLeftElement, Select, SimpleGrid, Text } from "@chakra-ui/react";
import { FiSearch, FiX } from "react-icons/fi";
import { EMPTY_FILTERS, hasDateFilter, STATUS_META, STATUSES } from "../../utils/appointments";

/**
 * Filtros combinables: búsqueda, estado, (admin) doctor y fecha (un día o un rango).
 */
const AppointmentFilters = ({ value, onChange, doctors }) => {
  const set = (key) => (e) => onChange({ ...value, [key]: e.target.value });
  const setMode = (dateMode) => onChange({ ...value, dateMode, date: "", dateFrom: "", dateTo: "" });
  const hasFilters = Boolean(value.search || value.status || value.doctor) || hasDateFilter(value);
  const range = value.dateMode === "range";

  return (
    <SimpleGrid columns={{ base: 1, sm: 2, lg: doctors ? 4 : 3 }} spacing={3}>
      <InputGroup gridColumn={{ sm: "span 2", lg: "auto" }}>
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
      {doctors && (
        <Select value={value.doctor} onChange={set("doctor")} bg="white" aria-label="Doctor">
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
      <Button variant="ghost" leftIcon={<FiX />} onClick={() => onChange(EMPTY_FILTERS)} isDisabled={!hasFilters}>
        Limpiar
      </Button>

      <Box gridColumn="1 / -1">
        <HStack spacing={3} flexWrap="wrap" align="center">
          <ButtonGroup size="xs" isAttached variant="outline">
            <Button onClick={() => setMode("day")} variant={range ? "outline" : "solid"}>
              Día
            </Button>
            <Button onClick={() => setMode("range")} variant={range ? "solid" : "outline"}>
              Rango
            </Button>
          </ButtonGroup>
          {range ? (
            <HStack spacing={2} flex="1" minW={{ base: "full", sm: "auto" }}>
              <Input type="date" size="sm" value={value.dateFrom} max={value.dateTo || undefined} onChange={set("dateFrom")} bg="white" aria-label="Desde" />
              <Text fontSize="sm" color="text.muted">
                a
              </Text>
              <Input type="date" size="sm" value={value.dateTo} min={value.dateFrom || undefined} onChange={set("dateTo")} bg="white" aria-label="Hasta" />
            </HStack>
          ) : (
            <Input type="date" size="sm" maxW={{ sm: "220px" }} value={value.date} onChange={set("date")} bg="white" aria-label="Fecha" />
          )}
        </HStack>
      </Box>
    </SimpleGrid>
  );
};

export default AppointmentFilters;
