import { Button, HStack } from "@chakra-ui/react";

// Selector de una opción entre pocas (vistas, filtros rápidos). options: [[valor, etiqueta], ...]
const SegmentedControl = ({ options, value, onChange, label, ...props }) => (
  <HStack spacing={1} bg="gray.100" p={1} borderRadius="full" role="group" aria-label={label} {...props}>
    {options.map(([key, text]) => (
      <Button key={key} size="xs" px={3} variant={value === key ? "solid" : "ghost"} aria-pressed={value === key} onClick={() => onChange(key)}>
        {text}
      </Button>
    ))}
  </HStack>
);

export default SegmentedControl;
