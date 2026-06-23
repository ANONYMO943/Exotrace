import type { CSSProperties } from "react";

export function PipelinePosterPanel() {
  return (
    <section id="pipeline-poster" style={styles.panel}>
      <div style={styles.headerRow}>
        <div>
          <p style={styles.eyebrow}>Visual Pipeline</p>
          <h2 style={styles.title}>AI Pipeline Overview</h2>
          <p style={styles.subtitle}>
            A complete view of the ExoTrace workflow from noisy TESS light curves
            to ranked and explainable exoplanet candidate screening.
          </p>
        </div>

        <div style={styles.badge}>
          Judge-friendly visual summary
        </div>
      </div>

      <div style={styles.imageFrame}>
        <img
          src="/exotrace_pipeline.png"
          alt="ExoTrace AI-enabled exoplanet candidate detection pipeline"
          style={styles.image}
        />
      </div>

      <div style={styles.noteBox}>
        <strong>How to explain this:</strong>{" "}
        ExoTrace loads TESS light curves, preprocesses them, detects transit-like
        dips using Box Least Squares, extracts scientific features, classifies
        the signal using an ExtraTrees model, applies a candidate threshold, and
        generates ranked explainable outputs.
      </div>
    </section>
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
    marginBottom: "18px",
    flexWrap: "wrap",
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
    maxWidth: "760px",
  },
  badge: {
    background: "rgba(56,189,248,0.10)",
    border: "1px solid rgba(56,189,248,0.28)",
    color: "#bae6fd",
    borderRadius: "999px",
    padding: "10px 14px",
    fontWeight: 800,
    fontSize: "13px",
  },
  imageFrame: {
    background: "rgba(0,0,0,0.28)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "20px",
    padding: "12px",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    display: "block",
    borderRadius: "14px",
  },
  noteBox: {
    marginTop: "14px",
    background: "rgba(251,191,36,0.10)",
    border: "1px solid rgba(251,191,36,0.25)",
    color: "#fde68a",
    borderRadius: "14px",
    padding: "13px",
    lineHeight: 1.5,
  },
};