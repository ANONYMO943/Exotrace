import {
  ResponsiveContainer,
  ComposedChart,
  Scatter,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import type { PhasePoint } from "@/data/missionData";

export function PhaseFoldChart({
  data,
  height = 300,
}: {
  data: PhasePoint[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 8, right: 12, left: -8, bottom: 4 }}>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="phase"
          stroke="var(--muted-foreground)"
          tick={{ fontSize: 11 }}
          tickLine={false}
          type="number"
          domain={[-0.5, 0.5]}
          tickFormatter={(v: number) => v.toFixed(2)}
          label={{ value: "Orbital Phase", position: "insideBottom", offset: -2, fontSize: 11, fill: "var(--muted-foreground)" }}
        />
        <YAxis
          stroke="var(--muted-foreground)"
          tick={{ fontSize: 11 }}
          tickLine={false}
          width={52}
          domain={["dataMin - 0.1", "dataMax + 0.1"]}
          tickFormatter={(v: number) => v.toFixed(2)}
          label={{ value: "Norm. Flux (%)", angle: -90, position: "insideLeft", fontSize: 11, fill: "var(--muted-foreground)" }}
        />
        <Tooltip
          contentStyle={{
            background: "var(--popover)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            fontSize: 12,
            color: "var(--popover-foreground)",
          }}
        />
        <Scatter dataKey="flux" fill="var(--cyan)" fillOpacity={0.45} isAnimationActive={false} />
        <Line
          type="monotone"
          dataKey="model"
          stroke="var(--violet)"
          strokeWidth={2.5}
          dot={false}
          isAnimationActive={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
