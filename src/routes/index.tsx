import { createFileRoute } from "@tanstack/react-router";
import { ExoTraceDashboard } from "../components/ExoTraceDashboard";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return <ExoTraceDashboard />;
}