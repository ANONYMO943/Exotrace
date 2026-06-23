import { createFileRoute } from "@tanstack/react-router";
import { FileSpreadsheet, ImageDown, FileText, CheckCircle2 } from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";
import { ReportExportCard } from "@/components/ReportExportCard";
import { classification, parameters, targetMeta } from "@/data/missionData";

export const Route = createFileRoute("/dashboard/report")({
  head: () => ({ meta: [{ title: "Report Export — ExoTrace Transit Detection Dashboard" }] }),
  component: ReportPage,
});

function ReportPage() {
  return (
    <div>
      <SectionHeading
        eyebrow="Stage 07"
        title="Report Export"
        description="Package the full vetting result as machine-readable data, publication-ready plots, or a shareable mission report."
        status="ready"
      />

      <div className="glass-card mb-6 rounded-2xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Candidate Summary</p>
            <h2 className="mt-1 font-display text-xl font-semibold">
              {targetMeta.ticId} · {classification.predictedClass}
            </h2>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-4 py-2 text-sm font-medium text-success">
            <CheckCircle2 className="h-4 w-4" /> {classification.confidence}% confidence
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          {[
            ["Period", `${parameters.orbitalPeriod.value} d`],
            ["Duration", `${parameters.transitDuration.value} hr`],
            ["Depth", `${parameters.transitDepth.value} %`],
            ["SNR", `${parameters.snr.value} σ`],
          ].map(([k, v]) => (
            <div key={k} className="rounded-xl border border-border bg-secondary/40 px-4 py-3">
              <p className="text-xs text-muted-foreground">{k}</p>
              <p className="mt-0.5 font-display text-lg font-semibold">{v}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <ReportExportCard
          icon={FileSpreadsheet}
          title="Export CSV"
          desc="Download all estimated parameters, probabilities and metadata as a structured CSV file."
          cta="Download CSV"
          accent="cyan"
          meta="≈ 4 KB · 1 file"
        />
        <ReportExportCard
          icon={ImageDown}
          title="Export Plots"
          desc="High-resolution PNG figures: light curve, BLS periodogram and phase-folded transit."
          cta="Download Plots"
          accent="violet"
          meta="3 figures · 300 DPI"
        />
        <ReportExportCard
          icon={FileText}
          title="3-Page Report"
          desc="A formatted PDF vetting report with charts, parameters and the model's explanation."
          cta="Generate PDF"
          accent="success"
          meta="PDF · 3 pages"
        />
      </div>
    </div>
  );
}
