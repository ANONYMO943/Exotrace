import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Orbit, Timer, ArrowDownToLine, Zap } from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";
import { PeriodogramChart } from "@/components/PeriodogramChart";
import { MetricCard } from "@/components/MetricCard";
import { generatePeriodogram, parameters } from "@/data/missionData";

export const Route = createFileRoute("/dashboard/detection")({
  head: () => ({ meta: [{ title: "Transit Detection — ExoTrace Transit Detection Dashboard" }] }),
  component: DetectionPage,
});

function DetectionPage() {
  const periodogram = useMemo(() => generatePeriodogram(220), []);
  const bestPeriod = Number(parameters.orbitalPeriod.value);

  return (
    <div>
      <SectionHeading
        eyebrow="Stage 03"
        title="Transit Detection"
        description="A Box Least Squares (BLS) search scans candidate periods. The strongest peak marks the most likely transit period."
        status="complete"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Best Period" value={parameters.orbitalPeriod.value} unit="d" icon={Orbit} accent="cyan" />
        <MetricCard label="Duration" value={parameters.transitDuration.value} unit="hr" icon={Timer} accent="violet" />
        <MetricCard label="Depth" value={parameters.transitDepth.value} unit="%" icon={ArrowDownToLine} accent="cyan" />
        <MetricCard label="BLS Power" value={parameters.blsPower.value} icon={Zap} accent="success" />
      </div>

      <div className="glass-card mt-6 rounded-2xl p-5">
        <div className="mb-3">
          <h2 className="font-display text-lg font-semibold">BLS Periodogram</h2>
          <p className="text-xs text-muted-foreground">
            Power vs. trial period · dashed line marks the detected period at {bestPeriod} days
          </p>
        </div>
        <PeriodogramChart data={periodogram} bestPeriod={bestPeriod} height={320} />
      </div>

      <div className="glass-card mt-6 rounded-2xl p-5">
        <h2 className="font-display text-base font-semibold">Detection Notes</h2>
        <ul className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
          <li>• Dominant peak at {bestPeriod} d with BLS power {parameters.blsPower.value}.</li>
          <li>• Secondary peaks correspond to 1× harmonics of the base period.</li>
          <li>• No alias near 1 day, ruling out diurnal systematics.</li>
          <li>• Peak significance exceeds the 7σ detection threshold.</li>
        </ul>
      </div>
    </div>
  );
}
