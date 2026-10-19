import { Box, Flex, HStack, Stack, Text } from "@chakra-ui/react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { STATUS_META, STATUSES } from "../../utils/appointments";
import ChartTooltip from "./ChartTooltip";
import EmptyState from "../ui/EmptyState";

// Reparto de citas por estado, con leyenda y cifras siempre visibles
const StatusDonut = ({ counts }) => {
  const data = STATUSES.map((s) => ({ name: STATUS_META[s].label, value: counts[s] ?? 0, fill: STATUS_META[s].hex }));
  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (total === 0) return <EmptyState title="Aún no hay citas" />;

  return (
    <Flex direction={{ base: "column", sm: "row" }} align="center" gap={6}>
      <Box position="relative" w="180px" h="180px" flexShrink={0}>
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="value" innerRadius={58} outerRadius={84} paddingAngle={2} stroke="#fff" strokeWidth={2}>
              {data.map((d) => (
                <Cell key={d.name} fill={d.fill} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <Flex position="absolute" inset={0} direction="column" align="center" justify="center" pointerEvents="none">
          <Text fontSize="2xl" fontWeight="700" lineHeight={1}>
            {total}
          </Text>
          <Text fontSize="xs" color="text.muted">
            citas
          </Text>
        </Flex>
      </Box>
      <Stack spacing={2.5} flex="1" w="full">
        {data.map((d) => (
          <HStack key={d.name} fontSize="sm">
            <Box boxSize={2.5} borderRadius="full" bg={d.fill} />
            <Text color="gray.700">{d.name}</Text>
            <Text ml="auto" fontWeight="600">
              {d.value}
            </Text>
            <Text color="text.muted" w="42px" textAlign="right">
              {Math.round((d.value / total) * 100)}%
            </Text>
          </HStack>
        ))}
      </Stack>
    </Flex>
  );
};

export default StatusDonut;
