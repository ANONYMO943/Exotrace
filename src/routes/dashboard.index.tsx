import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Orbit, Timer, ArrowDownToLine, Activity, Zap, BrainCircuit, ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";
import { MetricCard } from "@/components/MetricCard";
import { PipelineStepCard } from "@/components/PipelineStepCard";
import { ConfidenceMeter } from "@/components/ConfidenceMeter";
import { LightCurveChart } from "@/components/LightCurveChart";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { navItems } from "@/components/nav-config";
import {
  classification,
  parameters,
  pipelineSteps,
  targetMeta,
  generateLightCurve,
} from "@/data/missionData";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({ meta: [{ title: "Overview — ExoTrace Transit Detection Dashboard" }] }),
  component: Overview,
});

function Overview() {
  const curve = useMemo(() => generateLightCurve(180), []);
  const navByStep = Object.fromEntries(navItems.map((n) => [n.to.split("/").pop() || "", n.to]));

  return (
    <div>
      <SectionHeading
        eyebrow={`${targetMeta.ticId} · ${targetMeta.sector}`}
        title="Mission Overview"
        description="Full vetting pipeline complete. A high-confidence exoplanet transit candidate was identified in this light curve."
        status="complete"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Orbital Period" value={parameters.orbitalPeriod.value} unit="d" icon={Orbit} accent="cyan" />
        <MetricCard label="Transit Duration" value={parameters.transitDuration.value} unit="hr" icon={Timer} accent="violet" />
        <MetricCard label="Transit Depth" value={parameters.transitDepth.value} unit="%" icon={ArrowDownToLine} accent="cyan" />
        <MetricCard label="SNR" value={parameters.snr.value} unit="σ" icon={Activity} accent="success" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="glass-card rounded-2xl p-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold">Detrended Light Curve</h2>
              <p className="text-xs text-muted-foreground">Cleaned flux with recurring transit dips</p>
            </div>
            <StatusBadge status="complete" />
          </div>
          <LightCurveChart data={curve} series={["detrended"]} height={260} />
        </div>

        <div className="glass-card flex flex-col items-center justify-center rounded-2xl p-5">
          <ConfidenceMeter value={classification.confidence} />
          <div className="mt-4 flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent">
            <BrainCircuit className="h-4 w-4" />
            {classification.predictedClass}
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">Pipeline Status</h2>
        <Button asChild variant="ghost" size="sm">
          <Link to="/dashboard/report">
            View report <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {pipelineSteps.map((step, i) => {
          const Icon = navItems.find((n) => n.to.endsWith(step.id))?.icon ?? Zap;
          const to = navByStep[step.id];
          const card = (
            <PipelineStepCard
              index={i + 1}
              title={step.title}
              desc={step.desc}
              icon={Icon}
              status={step.status === "ready" ? "ready" : "complete"}
            />
          );
          return to ? (
            <Link key={step.id} to={to} className="block">
              {card}
            </Link>
          ) : (
            <div key={step.id}>{card}</div>
          );
        })}
      </div>
    </div>
  );
}
