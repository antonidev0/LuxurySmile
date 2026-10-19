import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatMonth } from "../../utils/dates";
import ChartTooltip from "./ChartTooltip";
import { axisProps, CHART } from "./chartTheme";

const monthLabel = (key) => formatMonth(key, { month: "long", year: "numeric" });

// Citas por mes (total y completadas) en un único eje
const MonthlyTrendChart = ({ data, height = 260 }) => (
  <ResponsiveContainer width="100%" height={height}>
    <BarChart data={data} barGap={2} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
      <CartesianGrid vertical={false} stroke={CHART.grid} />
      <XAxis dataKey="key" tickFormatter={(k) => formatMonth(k)} {...axisProps} />
      <YAxis allowDecimals={false} {...axisProps} />
      <Tooltip cursor={{ fill: "rgba(11,132,165,0.06)" }} content={<ChartTooltip labelFormatter={monthLabel} />} />
      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
      <Bar dataKey="total" name="Citas" fill={CHART.primary} radius={[4, 4, 0, 0]} maxBarSize={28} />
      <Bar dataKey="completadas" name="Completadas" fill={CHART.secondary} radius={[4, 4, 0, 0]} maxBarSize={28} />
    </BarChart>
  </ResponsiveContainer>
);

export default MonthlyTrendChart;
