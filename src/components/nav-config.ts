import { Rocket, type LucideIcon } from "lucide-react";
import {
  Upload,
  Waves,
  Radar,
  Orbit,
  BrainCircuit,
  SlidersHorizontal,
  FileDown,
  LayoutDashboard,
} from "lucide-react";

export type NavItem = {
  title: string;
  to: string;
  icon: LucideIcon;
  description: string;
};

export const navItems: NavItem[] = [
  { title: "Overview", to: "/dashboard", icon: LayoutDashboard, description: "Mission summary" },
  { title: "Upload", to: "/dashboard/upload", icon: Upload, description: "Ingest light curve" },
  { title: "Preprocessing", to: "/dashboard/preprocessing", icon: Waves, description: "Clean & detrend" },
  { title: "Transit Detection", to: "/dashboard/detection", icon: Radar, description: "BLS periodogram" },
  { title: "Phase Folding", to: "/dashboard/phase-folding", icon: Orbit, description: "Folded transit" },
  { title: "AI Classification", to: "/dashboard/classification", icon: BrainCircuit, description: "Vetting model" },
  { title: "Parameters", to: "/dashboard/parameters", icon: SlidersHorizontal, description: "Orbital solution" },
  { title: "Report Export", to: "/dashboard/report", icon: FileDown, description: "Export results" },
];

export const brandIcon = Rocket;
