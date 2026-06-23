import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import type { CurvePoint } from "@/data/missionData";

type SeriesKey = "raw" | "cleaned" | "detrended";

const seriesConfig: Record<SeriesKey, { color: string; name: string }> = {
  raw: { color: "var(--muted-foreground)", name: "Raw Flux" },
  cleaned: { color: "var(--cyan)", name: "Cleaned" },
  detrended: { color: "var(--violet)", name: "Detrended" },
};

export function LightCurveChart({
  data,
  series,
  height = 280,
}: {
  data: CurvePoint[];
  series: SeriesKey[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: -8, bottom: 4 }}>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="time"
          stroke="var(--muted-foreground)"
          tick={{ fontSize: 11 }}
          tickLine={false}
          label={{ value: "Time (days)", position: "insideBottom", offset: -2, fontSize: 11, fill: "var(--muted-foreground)" }}
        />
        <YAxis
          stroke="var(--muted-foreground)"
          tick={{ fontSize: 11 }}
          tickLine={false}
          domain={["dataMin - 0.05", "dataMax + 0.05"]}
          tickFormatter={(v: number) => v.toFixed(2)}
          width={48}
        />
        <Tooltip
          contentStyle={{
            background: "var(--popover)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            fontSize: 12,
            color: "var(--popover-foreground)",
          }}
          labelStyle={{ color: "var(--muted-foreground)" }}
        />
        {series.length > 1 ? <Legend wrapperStyle={{ fontSize: 12 }} /> : null}
        {series.map((key) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            name={seriesConfig[key].name}
            stroke={seriesConfig[key].color}
            strokeWidth={key === "raw" ? 1 : 2}
            dot={false}
            isAnimationActive={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
