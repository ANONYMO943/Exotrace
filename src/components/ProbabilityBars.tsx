import { cn } from "@/lib/utils";
import type { ClassProbability } from "@/data/missionData";

export function ProbabilityBars({
  data,
  className,
}: {
  data: ClassProbability[];
  className?: string;
}) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div className={cn("space-y-4", className)}>
      {data.map((item, i) => {
        const isTop = item.value === max;
        return (
          <div key={item.label}>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className={cn("font-medium", isTop ? "text-foreground" : "text-muted-foreground")}>
                {item.label}
              </span>
              <span className={cn("font-mono", isTop ? "text-primary" : "text-muted-foreground")}>
                {item.value.toFixed(1)}%
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-700 ease-out",
                  isTop ? "bg-gradient-cosmic" : "bg-muted-foreground/40",
                )}
                style={{ width: `${(item.value / max) * 100}%`, transitionDelay: `${i * 80}ms` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
