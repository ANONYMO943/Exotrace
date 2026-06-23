import { type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function ReportExportCard({
  title,
  desc,
  icon: Icon,
  cta,
  accent = "cyan",
  meta,
}: {
  title: string;
  desc: string;
  icon: LucideIcon;
  cta: string;
  accent?: "cyan" | "violet" | "success";
  meta?: string;
}) {
  const ring = {
    cyan: "hover:glow-cyan",
    violet: "hover:glow-violet",
    success: "hover:shadow-[0_12px_40px_-12px_var(--success)]",
  }[accent];

  const iconColor = {
    cyan: "text-primary bg-primary/10",
    violet: "text-accent bg-accent/10",
    success: "text-success bg-success/10",
  }[accent];

  return (
    <div className={cn("glass-card flex flex-col rounded-2xl p-6 transition-all", ring)}>
      <div className={cn("grid h-12 w-12 place-items-center rounded-xl", iconColor)}>
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
      <p className="mt-1 flex-1 text-sm text-muted-foreground">{desc}</p>
      {meta ? <p className="mt-3 font-mono text-xs text-muted-foreground">{meta}</p> : null}
      <Button
        variant="outline"
        className="mt-4 w-full"
        onClick={() => toast.success(`${cta} started`, { description: `${title} is being generated.` })}
      >
        {cta}
      </Button>
    </div>
  );
}
