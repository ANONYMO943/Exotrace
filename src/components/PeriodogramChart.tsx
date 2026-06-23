import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import type { PeriodogramPoint } from "@/data/missionData";

export function PeriodogramChart({
  data,
  bestPeriod,
  height = 280,
}: {
  data: PeriodogramPoint[];
  bestPeriod: number;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 12, left: -8, bottom: 4 }}>
        <defs>
          <linearGradient id="bls-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--cyan)" stopOpacity={0.5} />
            <stop offset="100%" stopColor="var(--cyan)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="period"
          stroke="var(--muted-foreground)"
          tick={{ fontSize: 11 }}
          tickLine={false}
          type="number"
          domain={["dataMin", "dataMax"]}
          tickFormatter={(v: number) => v.toFixed(1)}
          label={{ value: "Period (days)", position: "insideBottom", offset: -2, fontSize: 11, fill: "var(--muted-foreground)" }}
        />
        <YAxis
          stroke="var(--muted-foreground)"
          tick={{ fontSize: 11 }}
          tickLine={false}
          width={40}
          domain={[0, 1]}
        />
        <Tooltip
          contentStyle={{
            background: "var(--popover)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            fontSize: 12,
            color: "var(--popover-foreground)",
          }}
          labelFormatter={(v) => `Period: ${v} d`}
        />
        <ReferenceLine
          x={bestPeriod}
          stroke="var(--violet)"
          strokeDasharray="4 4"
          label={{ value: `${bestPeriod} d`, fill: "var(--violet)", fontSize: 11, position: "top" }}
        />
        <Area
          type="monotone"
          dataKey="power"
          stroke="var(--cyan)"
          strokeWidth={2}
          fill="url(#bls-fill)"
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
