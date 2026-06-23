import { cn } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";

export function SectionHeading({
  eyebrow,
  title,
  description,
  status,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  status?: "complete" | "ready" | "running";
  className?: string;
}) {
  return (
    <div className={cn("mb-6 flex flex-wrap items-start justify-between gap-4", className)}>
      <div className="min-w-0">
        {eyebrow ? (
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-display text-2xl font-bold sm:text-3xl">{title}</h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {status ? <StatusBadge status={status} /> : null}
    </div>
  );
}
