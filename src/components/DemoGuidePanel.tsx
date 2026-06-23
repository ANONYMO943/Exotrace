import type { CSSProperties } from "react";

type DemoTarget = {
  ticId: string;
  title: string;
  expected: string;
  note: string;
};

type DemoGuidePanelProps = {
  onRunPrediction: (ticId: string) => void;
};

const demoTargets: DemoTarget[] = [
  {
    ticId: "146172354",
    title: "Medium Planet Candidate",
    expected: "Possible planet candidate",
    note: "Good main demo target with visible planet classification.",
  },
  {
    ticId: "120247528",
    title: "Strong Planet Candidate",
    expected: "Strong planet candidate",
    note: "High probability planet candidate for showing ranking power.",
  },
  {
    ticId: "155044736",
    title: "False Positive Example",
    expected: "Likely false positive",
    note: "Shows that the model can reject non-planet signals.",
  },
  {
    ticId: "2020964",
    title: "Eclipsing Binary Example",
    expected: "Likely eclipsing binary",
    note: "Shows separation between planets and eclipsing binary stars.",
  },
];

export function DemoGuidePanel({ onRunPrediction }: DemoGuidePanelProps) {
  return (
    <section id="demo-panel" style={styles.panel}>
      <div style={styles.headerRow}>
        <div>
          <p style={styles.eyebrow}>Presentation Mode</p>
          <h2 style={styles.title}>Demo Control Panel</h2>
          <p style={styles.subtitle}>
            Use these ready-made demo targets while explaining ExoTrace to judges.
          </p>
        </div>

        <div style={styles.taglineBox}>
          <span style={styles.taglineLabel}>Tagline</span>
          <strong>From noisy starlight to ranked exoplanet candidates.</strong>
        </div>
      </div>

      <div style={styles.contentGrid}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Quick Demo Targets</h3>

          <div style={styles.targetGrid}>
            {demoTargets.map((target) => (
              <button
                key={target.ticId}
                style={styles.targetButton}
                onClick={() => onRunPrediction(target.ticId)}
              >
                <div style={styles.targetTop}>
                  <strong>TIC {target.ticId}</strong>
                  <span style={styles.targetBadge}>{target.title}</span>
                </div>

                <p style={styles.expected}>{target.expected}</p>
                <p style={styles.note}>{target.note}</p>
              </button>
            ))}
          </div>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Pipeline Flow</h3>

          <div style={styles.flowList}>
            <FlowStep number="1" text="Load TESS light curve" />
            <FlowStep number="2" text="Clean, normalize, and detrend flux" />
            <FlowStep number="3" text="Run Box Least Squares transit search" />
            <FlowStep number="4" text="Extract transit features" />
            <FlowStep number="5" text="Classify using ExtraTrees model" />
            <FlowStep number="6" text="Apply 20% planet-candidate threshold" />
          </div>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Key Results</h3>

          <div style={styles.resultGrid}>
            <MiniMetric label="Full Batch Accuracy" value="90.0%" />
            <MiniMetric label="Candidate Recall" value="98.0%" />
            <MiniMetric label="Planets Detected" value="49 / 50" />
            <MiniMetric label="Missed Planets" value="1" />
          </div>

          <p style={styles.warning}>
            Mention clearly: 78.0% is held-out test accuracy, while 90.0% is full batch report accuracy.
          </p>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>What to Say</h3>

          <p style={styles.scriptText}>
            ExoTrace analyzes noisy TESS light curves and ranks possible exoplanet candidates using BLS transit features, machine learning classification, and optimized candidate thresholding.
          </p>

          <p style={styles.scriptText}>
            It is a candidate screening tool, not a final astronomical validation system.
          </p>
        </div>
      </div>
    </section>
  );
}

function FlowStep({ number, text }: { number: string; text: string }) {
  return (
    <div style={styles.flowStep}>
      <span style={styles.flowNumber}>{number}</span>
      <span>{text}</span>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.metricBox}>
      <p>{label}</p>
      <strong>{value}</strong>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  panel: {
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "24px",
    padding: "22px",
    marginBottom: "22px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.22)",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "18px",
    alignItems: "flex-start",
    marginBottom: "20px",
  },
  eyebrow: {
    color: "#7dd3fc",
    textTransform: "uppercase",
    letterSpacing: "0.14em",
    fontSize: "12px",
    margin: 0,
  },
  title: {
    margin: "6px 0",
    fontSize: "26px",
  },
  subtitle: {
    color: "#a7b7cc",
    margin: 0,
    lineHeight: 1.5,
  },
  taglineBox: {
    background: "rgba(56,189,248,0.10)",
    border: "1px solid rgba(56,189,248,0.30)",
    borderRadius: "18px",
    padding: "14px",
    maxWidth: "340px",
    color: "#e0f2fe",
  },
  taglineLabel: {
    display: "block",
    color: "#7dd3fc",
    fontSize: "12px",
    marginBottom: "6px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  contentGrid: {
    display: "grid",
    gridTemplateColumns: "1.3fr 1fr",
    gap: "16px",
  },
  card: {
    background: "rgba(0,0,0,0.20)",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: "18px",
    padding: "16px",
  },
  cardTitle: {
    margin: "0 0 14px 0",
    fontSize: "18px",
  },
  targetGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "10px",
  },
  targetButton: {
    textAlign: "left",
    background: "rgba(255,255,255,0.07)",
    color: "#e5edf7",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "14px",
    padding: "12px",
    cursor: "pointer",
  },
  targetTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "8px",
    alignItems: "center",
  },
  targetBadge: {
    background: "rgba(125,211,252,0.15)",
    color: "#7dd3fc",
    borderRadius: "999px",
    padding: "4px 8px",
    fontSize: "11px",
    whiteSpace: "nowrap",
  },
  expected: {
    color: "#bae6fd",
    fontWeight: 700,
    margin: "10px 0 4px 0",
  },
  note: {
    color: "#9fb1c9",
    fontSize: "13px",
    lineHeight: 1.4,
    margin: 0,
  },
  flowList: {
    display: "flex",
    flexDirection: "column",
    gap: "9px",
  },
  flowStep: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "#dbeafe",
  },
  flowNumber: {
    width: "26px",
    height: "26px",
    borderRadius: "50%",
    background: "#38bdf8",
    color: "#06111f",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: "13px",
  },
  resultGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "10px",
  },
  metricBox: {
    background: "rgba(255,255,255,0.07)",
    borderRadius: "14px",
    padding: "12px",
  },
  warning: {
    marginTop: "14px",
    color: "#fde68a",
    fontSize: "13px",
    lineHeight: 1.5,
  },
  scriptText: {
    color: "#cbd5e1",
    lineHeight: 1.6,
    marginTop: 0,
  },
};