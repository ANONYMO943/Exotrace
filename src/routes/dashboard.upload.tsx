import { createFileRoute } from "@tanstack/react-router";
import { FileText, Server, ShieldCheck } from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";
import { UploadPanel } from "@/components/UploadPanel";
import { targetMeta } from "@/data/missionData";

export const Route = createFileRoute("/dashboard/upload")({
  head: () => ({ meta: [{ title: "Upload — ExoTrace Transit Detection Dashboard" }] }),
  component: UploadPage,
});

function UploadPage() {
  return (
    <div>
      <SectionHeading
        eyebrow="Stage 01"
        title="Data Ingestion"
        description="Upload a TESS light curve as CSV or FITS, or load one of the bundled sample targets to run the pipeline."
        status="ready"
      />

      <UploadPanel />

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { icon: FileText, title: "Formats", desc: "CSV, FITS and TXT light curves with time & flux columns." },
          { icon: Server, title: "Cadence", desc: `Auto-detects ${targetMeta.cadence} short-cadence and FFI data.` },
          { icon: ShieldCheck, title: "Validation", desc: "Files are checked for NaNs, gaps and quality flags on load." },
        ].map((item) => (
          <div key={item.title} className="glass-card rounded-2xl p-5">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <item.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-3 font-display text-base font-semibold">{item.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
