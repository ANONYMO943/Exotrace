import { cn } from "@/lib/utils";

type Status = "complete" | "ready" | "running" | "warning" | "idle";

const styles: Record<Status, string> = {
  complete: "bg-success/15 text-success border-success/30",
  ready: "bg-primary/15 text-primary border-primary/30",
  running: "bg-accent/15 text-accent border-accent/40 animate-pulse-glow",
  warning: "bg-warning/15 text-warning border-warning/30",
  idle: "bg-muted text-muted-foreground border-border",
};

const labels: Record<Status, string> = {
  complete: "Complete",
  ready: "Ready",
  running: "Running",
  warning: "Attention",
  idle: "Idle",
};

export function StatusBadge({
  status,
  label,
  className,
}: {
  status: Status;
  label?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium font-mono uppercase tracking-wider",
        styles[status],
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label ?? labels[status]}
    </span>
  );
}
