import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import EmptyState from "../ui/EmptyState";
import ChartTooltip from "./ChartTooltip";
import { axisProps, CHART } from "./chartTheme";

// Citas activas asignadas a cada doctor (una sola serie)
const DoctorLoadChart = ({ data }) => {
  if (!data.length) return <EmptyState title="Sin doctores registrados" />;
  const height = Math.max(160, data.length * 44);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 28, left: 0, bottom: 0 }}>
        <CartesianGrid horizontal={false} stroke={CHART.grid} />
        <XAxis type="number" allowDecimals={false} {...axisProps} />
        <YAxis type="category" dataKey="name" width={110} {...axisProps} />
        <Tooltip cursor={{ fill: "rgba(11,132,165,0.06)" }} content={<ChartTooltip />} />
        <Bar dataKey="citas" name="Citas activas" fill={CHART.primary} radius={[0, 4, 4, 0]} barSize={18}>
          <LabelList dataKey="citas" position="right" style={{ fill: "#4a5568", fontSize: 12 }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default DoctorLoadChart;
