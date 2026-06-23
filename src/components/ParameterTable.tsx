import { cn } from "@/lib/utils";

type Row = { label: string; value: string; unit?: string; confidence?: number };

export function ParameterTable({ rows, className }: { rows: Row[]; className?: string }) {
  return (
    <div className={cn("glass-card overflow-hidden rounded-2xl", className)}>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
            <th className="px-5 py-3 font-medium">Parameter</th>
            <th className="px-5 py-3 font-medium">Value</th>
            <th className="hidden px-5 py-3 text-right font-medium sm:table-cell">Confidence</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.label}
              className="border-b border-border/50 transition-colors last:border-0 hover:bg-secondary/40"
            >
              <td className="px-5 py-4 text-muted-foreground">{row.label}</td>
              <td className="px-5 py-4">
                <span className="font-display text-base font-semibold text-foreground">
                  {row.value}
                </span>
                {row.unit ? (
                  <span className="ml-1 text-xs text-muted-foreground">{row.unit}</span>
                ) : null}
              </td>
              <td className="hidden px-5 py-4 sm:table-cell">
                {row.confidence != null ? (
                  <div className="flex items-center justify-end gap-2">
                    <div className="h-1.5 w-20 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-gradient-cosmic"
                        style={{ width: `${row.confidence}%` }}
                      />
                    </div>
                    <span className="w-9 text-right font-mono text-xs text-muted-foreground">
                      {row.confidence}%
                    </span>
                  </div>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
