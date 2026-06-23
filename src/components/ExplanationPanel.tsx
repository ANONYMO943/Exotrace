import { CheckCircle2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function ExplanationPanel({
  points,
  className,
}: {
  points: string[];
  className?: string;
}) {
  return (
    <div className={cn("glass-card rounded-2xl p-6", className)}>
      <div className="mb-4 flex items-center gap-2">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-accent/15 text-accent">
          <Sparkles className="h-4 w-4" />
        </div>
        <h3 className="font-display text-lg font-semibold">Model Explainability</h3>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">
        Key evidence the vetting model used to reach its decision.
      </p>
      <ul className="space-y-3">
        {points.map((point) => (
          <li key={point} className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
            <span className="text-sm leading-relaxed text-foreground/90">{point}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
