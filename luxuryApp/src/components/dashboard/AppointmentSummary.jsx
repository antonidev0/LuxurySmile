import { Box, SimpleGrid } from "@chakra-ui/react";
import { FiAlertCircle, FiCalendar, FiCheck, FiXCircle } from "react-icons/fi";
import StatCard from "../ui/StatCard";

const CARDS = [
  { key: "pendiente", label: "Pendientes", icon: FiAlertCircle, color: "orange", hint: "Solicitudes por atender" },
  { key: "confirmada", label: "Confirmadas", icon: FiCheck, color: "blue", hint: "Con doctor y horario" },
  { key: "today", label: "Programadas hoy", icon: FiCalendar, color: "brand", hint: "Sin contar las canceladas" },
  { key: "cancelada", label: "Canceladas", icon: FiXCircle, color: "red", hint: "Con su registro" },
];

/**
 * Contadores de la cabecera de Citas, calculados con las citas cargadas.
 * Al pulsar una tarjeta se filtra la lista por ese criterio (y se quita al volver a pulsarla).
 */
const AppointmentSummary = ({ counts, active, onSelect }) => (
  <SimpleGrid columns={{ base: 2, xl: 4 }} spacing={{ base: 3, md: 4 }} mb={6}>
    {CARDS.map((card) => (
      <Box
        key={card.key}
        as="button"
        type="button"
        textAlign="left"
        borderRadius="2xl"
        onClick={() => onSelect(card.key)}
        aria-pressed={active === card.key}
        outline={active === card.key ? "2px solid" : "none"}
        outlineColor={`${card.color}.300`}
        transition="transform .15s"
        _hover={{ transform: "translateY(-1px)" }}
      >
        <StatCard label={card.label} value={counts[card.key]} icon={card.icon} color={card.color} hint={card.hint} />
      </Box>
    ))}
  </SimpleGrid>
);

export default AppointmentSummary;
