import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { SectionHeading } from "@/components/SectionHeading";
import { PhaseFoldChart } from "@/components/PhaseFoldChart";
import { MetricCard } from "@/components/MetricCard";
import { Orbit, ArrowDownToLine, Timer } from "lucide-react";
import { generatePhaseFold, parameters } from "@/data/missionData";

export const Route = createFileRoute("/dashboard/phase-folding")({
  head: () => ({ meta: [{ title: "Phase Folding — ExoTrace Transit Detection Dashboard" }] }),
  component: PhaseFoldingPage,
});

function PhaseFoldingPage() {
  const folded = useMemo(() => generatePhaseFold(240), []);

  return (
    <div>
      <SectionHeading
        eyebrow="Stage 04"
        title="Phase Folding"
        description="Folding the light curve on the best period stacks every transit at phase zero, revealing a clean U-shaped dip."
        status="complete"
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Folded Period" value={parameters.orbitalPeriod.value} unit="d" icon={Orbit} accent="cyan" />
        <MetricCard label="Transit Depth" value={parameters.transitDepth.value} unit="%" icon={ArrowDownToLine} accent="violet" />
        <MetricCard label="Duration" value={parameters.transitDuration.value} unit="hr" icon={Timer} accent="cyan" />
      </div>

      <div className="glass-card mt-6 rounded-2xl p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-lg font-semibold">Phase-Folded Light Curve</h2>
            <p className="text-xs text-muted-foreground">
              Points = folded flux · violet line = transit model fit
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-primary/60" /> Folded flux
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1 w-4 rounded-full bg-accent" /> Model
            </span>
          </div>
        </div>
        <PhaseFoldChart data={folded} height={340} />
      </div>

      <div className="glass-card mt-6 rounded-2xl p-5">
        <h2 className="font-display text-base font-semibold">Shape Diagnostics</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The folded curve shows a symmetric, flat-bottomed dip consistent with a planetary transit.
          No significant secondary eclipse appears at phase 0.5, and odd/even transit depths agree
          within uncertainties — both strong indicators against an eclipsing-binary scenario.
        </p>
      </div>
    </div>
  );
}
