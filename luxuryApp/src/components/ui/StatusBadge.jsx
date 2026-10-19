import { Badge } from "@chakra-ui/react";
import { STATUS_META } from "../../utils/appointments";

const StatusBadge = ({ status, ...props }) => {
  const meta = STATUS_META[status] ?? { label: status, color: "gray" };
  return (
    <Badge colorScheme={meta.color} variant="subtle" borderRadius="full" alignSelf="center" flexShrink={0} px={2.5} py={0.5} textTransform="none" {...props}>
      {meta.label}
    </Badge>
  );
};

export default StatusBadge;
