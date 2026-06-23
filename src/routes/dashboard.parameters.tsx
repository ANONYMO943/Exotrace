import { createFileRoute } from "@tanstack/react-router";
import { Orbit, Timer, ArrowDownToLine, Activity, Zap } from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";
import { ParameterTable } from "@/components/ParameterTable";
import { MetricCard } from "@/components/MetricCard";
import { ConfidenceMeter } from "@/components/ConfidenceMeter";
import { parameters } from "@/data/missionData";

export const Route = createFileRoute("/dashboard/parameters")({
  head: () => ({ meta: [{ title: "Parameter Estimation — ExoTrace Transit Detection Dashboard" }] }),
  component: ParametersPage,
});

function ParametersPage() {
  const rows = [
    parameters.orbitalPeriod,
    parameters.transitDuration,
    parameters.transitDepth,
    parameters.snr,
    parameters.blsPower,
  ];

  return (
    <div>
      <SectionHeading
        eyebrow="Stage 06"
        title="Parameter Estimation"
        description="The transit model is fit to recover the orbital solution and signal quality metrics, each with a confidence estimate."
        status="complete"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Orbital Period" value={parameters.orbitalPeriod.value} unit="d" icon={Orbit} accent="cyan" />
        <MetricCard label="Transit Duration" value={parameters.transitDuration.value} unit="hr" icon={Timer} accent="violet" />
        <MetricCard label="Transit Depth" value={parameters.transitDepth.value} unit="%" icon={ArrowDownToLine} accent="cyan" />
        <MetricCard label="SNR" value={parameters.snr.value} unit="σ" icon={Activity} accent="success" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <h2 className="mb-3 font-display text-lg font-semibold">Estimated Parameters</h2>
          <ParameterTable rows={rows} />
        </div>
        <div className="glass-card flex flex-col items-center justify-center rounded-2xl p-6">
          <ConfidenceMeter value={94} label="Overall Fit Confidence" />
          <div className="mt-4 flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <Zap className="h-4 w-4" /> BLS Power {parameters.blsPower.value}
          </div>
        </div>
      </div>
    </div>
  );
}
