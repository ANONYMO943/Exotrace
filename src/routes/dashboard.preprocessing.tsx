import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { SectionHeading } from "@/components/SectionHeading";
import { LightCurveChart } from "@/components/LightCurveChart";
import { StatusBadge } from "@/components/StatusBadge";
import { generateLightCurve } from "@/data/missionData";

export const Route = createFileRoute("/dashboard/preprocessing")({
  head: () => ({ meta: [{ title: "Preprocessing — ExoTrace Transit Detection Dashboard" }] }),
  component: PreprocessingPage,
});

const stages = [
  {
    key: "raw" as const,
    title: "Raw Light Curve",
    desc: "Unprocessed SAP flux with instrumental systematics and stellar variability.",
    badge: "Input",
  },
  {
    key: "cleaned" as const,
    title: "Cleaned",
    desc: "Outliers removed via sigma-clipping; quality-flagged cadences masked.",
    badge: "Sigma-clipped",
  },
  {
    key: "detrended" as const,
    title: "Detrended",
    desc: "Long-term trends removed with a Savitzky–Golay filter, isolating transits.",
    badge: "Flattened",
  },
];

function PreprocessingPage() {
  const curve = useMemo(() => generateLightCurve(220), []);

  return (
    <div>
      <SectionHeading
        eyebrow="Stage 02"
        title="Preprocessing"
        description="Raw flux is cleaned and detrended so periodic transit dips stand out from noise and systematics."
        status="complete"
      />

      <div className="space-y-6">
        {stages.map((s) => (
          <div key={s.key} className="glass-card rounded-2xl p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-display text-lg font-semibold">{s.title}</h2>
                <p className="text-xs text-muted-foreground">{s.desc}</p>
              </div>
              <StatusBadge status="complete" label={s.badge} />
            </div>
            <LightCurveChart data={curve} series={[s.key]} height={220} />
          </div>
        ))}
      </div>

      <div className="glass-card mt-6 rounded-2xl p-5">
        <h2 className="mb-3 font-display text-lg font-semibold">Overlay Comparison</h2>
        <LightCurveChart data={curve} series={["raw", "cleaned", "detrended"]} height={300} />
      </div>
    </div>
  );
}
