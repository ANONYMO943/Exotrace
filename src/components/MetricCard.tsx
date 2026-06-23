import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function MetricCard({
  label,
  value,
  unit,
  icon: Icon,
  accent = "cyan",
  hint,
  className,
}: {
  label: string;
  value: string;
  unit?: string;
  icon?: LucideIcon;
  accent?: "cyan" | "violet" | "success";
  hint?: string;
  className?: string;
}) {
  const accentRing = {
    cyan: "glow-cyan",
    violet: "glow-violet",
    success: "shadow-[0_12px_40px_-12px_var(--success)]",
  }[accent];

  const iconColor = {
    cyan: "text-primary bg-primary/10",
    violet: "text-accent bg-accent/10",
    success: "text-success bg-success/10",
  }[accent];

  return (
    <div
      className={cn(
        "glass-card group relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1",
        accentRing,
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 font-display text-3xl font-bold text-foreground">
            {value}
            {unit ? <span className="ml-1 text-base font-medium text-muted-foreground">{unit}</span> : null}
          </p>
          {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
        </div>
        {Icon ? (
          <div className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", iconColor)}>
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>
      <div className="pointer-events-none absolute -bottom-8 -right-8 h-24 w-24 rounded-full bg-gradient-cosmic opacity-10 blur-2xl transition-opacity group-hover:opacity-25" />
    </div>
  );
}
