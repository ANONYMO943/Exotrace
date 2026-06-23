import { type LucideIcon, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";

export function PipelineStepCard({
  index,
  title,
  desc,
  icon: Icon,
  status,
  active,
}: {
  index: number;
  title: string;
  desc: string;
  icon: LucideIcon;
  status: "complete" | "ready" | "running" | "idle";
  active?: boolean;
}) {
  return (
    <div
      className={cn(
        "glass-card relative flex items-center gap-4 rounded-xl p-4 transition-all",
        active && "glow-cyan",
      )}
    >
      <div
        className={cn(
          "grid h-11 w-11 shrink-0 place-items-center rounded-xl border",
          status === "complete"
            ? "border-success/40 bg-success/10 text-success"
            : status === "running"
              ? "border-accent/40 bg-accent/10 text-accent"
              : "border-primary/40 bg-primary/10 text-primary",
        )}
      >
        {status === "complete" ? (
          <Check className="h-5 w-5" />
        ) : status === "running" ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Icon className="h-5 w-5" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground">
            {String(index).padStart(2, "0")}
          </span>
          <h3 className="truncate font-display text-sm font-semibold">{title}</h3>
        </div>
        <p className="truncate text-xs text-muted-foreground">{desc}</p>
      </div>
      <StatusBadge status={status} className="hidden sm:inline-flex" />
    </div>
  );
}
