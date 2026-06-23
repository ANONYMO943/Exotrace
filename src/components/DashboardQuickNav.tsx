import type { CSSProperties } from "react";

const navItems = [
  { label: "Health", target: "backend-health" },
  { label: "Demo", target: "demo-panel" },
  { label: "Pipeline", target: "pipeline-poster" },
  { label: "History", target: "prediction-history" },
  { label: "Reports", target: "report-tools" },
  { label: "Performance", target: "performance-report" },
  { label: "Model", target: "model-explanation" },
  { label: "Explorer", target: "candidate-explorer" },
  { label: "Prediction", target: "prediction-section" },
  { label: "Top Candidates", target: "top-candidates-section" },
];

export function DashboardQuickNav() {
  function scrollToSection(target: string) {
    const element = document.getElementById(target);

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }

  return (
    <nav style={styles.nav}>
      <div style={styles.left}>
        <strong>ExoTrace Demo Navigation</strong>
        <span>Jump to important dashboard sections</span>
      </div>

      <div style={styles.links}>
        {navItems.map((item) => (
          <button
            key={item.target}
            style={styles.button}
            onClick={() => scrollToSection(item.target)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
}

const styles: Record<string, CSSProperties> = {
  nav: {
    position: "sticky",
    top: "12px",
    zIndex: 20,
    background: "rgba(2, 6, 23, 0.82)",
    backdropFilter: "blur(14px)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "18px",
    padding: "12px",
    marginBottom: "22px",
    display: "flex",
    justifyContent: "space-between",
    gap: "14px",
    alignItems: "center",
    boxShadow: "0 18px 45px rgba(0,0,0,0.25)",
    flexWrap: "wrap",
  },
  left: {
    display: "flex",
    flexDirection: "column",
    gap: "3px",
    color: "#e2e8f0",
  },
  links: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  button: {
    border: "1px solid rgba(125,211,252,0.28)",
    background: "rgba(56,189,248,0.10)",
    color: "#bae6fd",
    borderRadius: "999px",
    padding: "8px 11px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "13px",
  },
};