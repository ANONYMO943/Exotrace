import { Link, useRouterState } from "@tanstack/react-router";
import { Rocket } from "lucide-react";
import { cn } from "@/lib/utils";
import { navItems } from "./nav-config";
import { StatusBadge } from "./StatusBadge";

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside className="flex h-full w-72 flex-col border-r border-border/60 bg-sidebar">
      <Link
        to="/"
        className="flex items-center gap-2.5 border-b border-border/60 px-5 py-4"
        onClick={onNavigate}
      >
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-cosmic glow-cyan">
          <Rocket className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="leading-tight">
          <p className="font-display text-sm font-bold">ExoTrace</p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Transit Detection Dashboard
          </p>
        </div>
      </Link>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Pipeline
        </p>
        {navItems.map((item) => {
          const active =
            item.to === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all",
                active
                  ? "bg-sidebar-accent text-foreground glow-cyan"
                  : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground",
              )}
            >
              <span
                className={cn(
                  "grid h-8 w-8 shrink-0 place-items-center rounded-lg border transition-colors",
                  active
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border bg-secondary/40 text-muted-foreground group-hover:text-foreground",
                )}
              >
                <item.icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{item.title}</span>
                <span className="block truncate text-[11px] text-muted-foreground">
                  {item.description}
                </span>
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border/60 p-4">
        <div className="glass-card flex items-center justify-between rounded-xl px-3 py-2.5">
          <div className="leading-tight">
            <p className="font-mono text-xs font-medium">TIC 307210830</p>
            <p className="text-[10px] text-muted-foreground">Sector 42 · 120s</p>
          </div>
          <StatusBadge status="complete" label="Live" />
        </div>
      </div>
    </aside>
  );
}
