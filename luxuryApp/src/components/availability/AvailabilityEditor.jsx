import { Flex, Input, Stack, Switch, Text } from "@chakra-ui/react";
import { CLINIC_HOURS, WEEKDAYS } from "../../utils/availability";

// Editor del horario semanal (controlado). Lo usan el admin, para cualquier doctor, y el propio doctor.
const AvailabilityEditor = ({ value, onChange, isDisabled = false }) => {
  const setDay = (day, range) => onChange({ ...value, [day]: range });

  return (
    <Stack spacing={3}>
      {WEEKDAYS.map(({ day, label }) => {
        const range = value[day];
        return (
          <Flex key={day} align="center" gap={3} wrap="wrap">
            <Flex as="label" align="center" gap={3} w="130px" cursor={isDisabled ? "default" : "pointer"}>
              <Switch
                colorScheme="brand"
                isChecked={Boolean(range)}
                isDisabled={isDisabled}
                onChange={(e) => setDay(day, e.target.checked ? { ...CLINIC_HOURS } : null)}
              />
              <Text fontSize="sm" fontWeight="600">
                {label}
              </Text>
            </Flex>
            {range ? (
              <Flex align="center" gap={2} flex="1" minW="200px">
                <Input type="time" size="sm" min={CLINIC_HOURS.start} max={CLINIC_HOURS.end} value={range.start} isDisabled={isDisabled} aria-label={`${label}: desde`} onChange={(e) => setDay(day, { ...range, start: e.target.value })} />
                <Text fontSize="sm">a</Text>
                <Input type="time" size="sm" min={CLINIC_HOURS.start} max={CLINIC_HOURS.end} value={range.end} isDisabled={isDisabled} aria-label={`${label}: hasta`} onChange={(e) => setDay(day, { ...range, end: e.target.value })} />
              </Flex>
            ) : (
              <Text fontSize="sm" color="text.muted">
                No atiende
              </Text>
            )}
          </Flex>
        );
      })}
    </Stack>
  );
};

export default AvailabilityEditor;
