import { Link } from "@tanstack/react-router";
import { Github, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" className="flex min-w-0 items-center gap-2.5">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-cosmic glow-cyan">
            <Rocket className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="min-w-0 leading-tight">
            <p className="truncate font-display text-sm font-bold sm:text-base">
              ExoTrace <span className="text-gradient">Transit Detection Dashboard</span>
            </p>
            <p className="hidden text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:block">
              Exoplanet Transit Detection
            </p>
          </div>
        </Link>

        <nav className="flex items-center gap-2">
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="hidden h-9 w-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:grid"
            aria-label="GitHub repository"
          >
            <Github className="h-5 w-5" />
          </a>
          <Button asChild variant="cosmic" size="sm">
            <Link to="/dashboard">Launch Console</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
