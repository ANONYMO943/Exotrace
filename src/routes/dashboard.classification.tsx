import { createFileRoute } from "@tanstack/react-router";
import { BrainCircuit } from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";
import { ConfidenceMeter } from "@/components/ConfidenceMeter";
import { ProbabilityBars } from "@/components/ProbabilityBars";
import { ExplanationPanel } from "@/components/ExplanationPanel";
import { classification } from "@/data/missionData";

export const Route = createFileRoute("/dashboard/classification")({
  head: () => ({ meta: [{ title: "AI Classification — ExoTrace Transit Detection Dashboard" }] }),
  component: ClassificationPage,
});

function ClassificationPage() {
  return (
    <div>
      <SectionHeading
        eyebrow="Stage 05"
        title="AI Classification"
        description="A neural vetting model scores the candidate against known false-positive scenarios and assigns a class probability."
        status="complete"
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        <div className="glass-card flex flex-col items-center justify-center rounded-2xl p-6">
          <ConfidenceMeter value={classification.confidence} />
          <div className="mt-5 flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent">
            <BrainCircuit className="h-4 w-4" />
            {classification.predictedClass}
          </div>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Predicted class with the highest posterior probability
          </p>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <h2 className="mb-4 font-display text-lg font-semibold">Class Probabilities</h2>
          <ProbabilityBars data={classification.probabilities} />
        </div>
      </div>

      <ExplanationPanel className="mt-6" points={classification.explanation} />
    </div>
  );
}
