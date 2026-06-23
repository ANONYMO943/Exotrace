import type { CSSProperties } from "react";

type FeatureCard = {
  name: string;
  meaning: string;
  whyImportant: string;
};

const features: FeatureCard[] = [
  {
    name: "Period",
    meaning: "Time taken for the transit pattern to repeat.",
    whyImportant:
      "A real exoplanet transit should usually appear periodically in the light curve.",
  },
  {
    name: "Transit Depth",
    meaning: "How much the star brightness drops during transit.",
    whyImportant:
      "Planet transits usually create small brightness dips, while binaries may create deeper dips.",
  },
  {
    name: "Duration",
    meaning: "How long the transit dip lasts.",
    whyImportant:
      "Duration helps separate planet-like dips from unusual or binary-star events.",
  },
  {
    name: "SNR",
    meaning: "Signal-to-noise ratio of the detected transit signal.",
    whyImportant:
      "Higher SNR means the signal is more visible compared to background noise.",
  },
  {
    name: "BLS Power",
    meaning: "Strength of the Box Least Squares transit detection signal.",
    whyImportant:
      "A stronger BLS signal means the periodic box-shaped transit pattern is clearer.",
  },
  {
    name: "Odd-Even Difference",
    meaning: "Difference between alternating transit depths.",
    whyImportant:
      "Large odd-even differences may indicate an eclipsing binary instead of a planet.",
  },
  {
    name: "Secondary Eclipse",
    meaning: "A second dip away from the main transit.",
    whyImportant:
      "A visible secondary eclipse is more common in binary systems than planet transits.",
  },
  {
    name: "V-Shape Score",
    meaning: "How V-shaped or U-shaped the transit dip looks.",
    whyImportant:
      "Planet transits are often more U-shaped, while grazing binaries can look V-shaped.",
  },
];

export function ModelExplanationPanel() {
  return (
    <section id="model-explanation" style={styles.panel}>
      <div style={styles.header}>
        <p style={styles.eyebrow}>Explainable AI</p>
        <h2 style={styles.title}>Model Explanation</h2>
        <p style={styles.subtitle}>
          ExoTrace does not only predict a label. It explains the prediction using astronomical transit features.
        </p>
      </div>

      <div style={styles.topGrid}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Why Box Least Squares?</h3>
          <p style={styles.text}>
            Exoplanet transits usually look like small, repeated, box-shaped dips in a star light curve.
            Box Least Squares helps search for this periodic dip pattern and estimates useful transit properties.
          </p>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Why ExtraTrees?</h3>
          <p style={styles.text}>
            ExtraTrees works well for tabular scientific features such as period, depth, duration, SNR, and BLS power.
            It can learn non-linear relationships and is fast enough for a prototype screening system.
          </p>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Why 20% Threshold?</h3>
          <p style={styles.text}>
            Direct classification can miss possible planets. So ExoTrace applies an optimized planet-candidate threshold of 20%.
            If planet probability is at least 20%, the object is marked as a possible planet candidate.
          </p>
        </div>
      </div>

      <div style={styles.metricsStrip}>
        <MetricBlock label="Held-out Test Accuracy" value="78.0%" />
        <MetricBlock label="Full Batch Accuracy" value="90.0%" />
        <MetricBlock label="Candidate Recall" value="98.0%" />
        <MetricBlock label="Planets Detected" value="49 / 50" />
      </div>

      <div style={styles.sectionHeader}>
        <h3 style={styles.cardTitle}>Feature Insights</h3>
        <p style={styles.smallText}>
          These are the main scientific features used to understand and classify transit-like signals.
        </p>
      </div>

      <div style={styles.featureGrid}>
        {features.map((feature) => (
          <article key={feature.name} style={styles.featureCard}>
            <h4 style={styles.featureTitle}>{feature.name}</h4>
            <p style={styles.featureMeaning}>{feature.meaning}</p>
            <p style={styles.featureImportance}>{feature.whyImportant}</p>
          </article>
        ))}
      </div>

      <div style={styles.bottomGrid}>
        <div style={styles.warningCard}>
          <h3 style={styles.warningTitle}>Important Scientific Honesty</h3>
          <p style={styles.text}>
            ExoTrace is a prototype candidate screening tool.
            It is not a final astronomical validation system.
            Final validation needs stellar metadata, centroid shift analysis, contamination checks, and expert review.
          </p>
        </div>

        <div style={styles.interpretCard}>
          <h3 style={styles.cardTitle}>How to Interpret Output</h3>

          <div style={styles.interpretList}>
            <InterpretLine label="Strong candidate" value="High planet probability and strong transit-like signal." />
            <InterpretLine label="Possible candidate" value="Above threshold, useful for further review." />
            <InterpretLine label="False positive" value="Signal looks less planet-like or more contaminated." />
            <InterpretLine label="Eclipsing binary" value="Signal is more consistent with two stars eclipsing." />
          </div>
        </div>
      </div>
    </section>
  );
}

function MetricBlock({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.metricBlock}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function InterpretLine({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.interpretLine}>
      <strong>{label}</strong>
      <span>{value}</span>
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
  header: {
    marginBottom: "18px",
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
  topGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "14px",
    marginBottom: "16px",
  },
  card: {
    background: "rgba(0,0,0,0.20)",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: "18px",
    padding: "16px",
  },
  cardTitle: {
    margin: "0 0 10px 0",
    fontSize: "18px",
  },
  text: {
    color: "#cbd5e1",
    lineHeight: 1.6,
    margin: 0,
  },
  metricsStrip: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "12px",
    marginBottom: "20px",
  },
  metricBlock: {
    background: "rgba(56,189,248,0.10)",
    border: "1px solid rgba(56,189,248,0.25)",
    borderRadius: "16px",
    padding: "14px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  sectionHeader: {
    marginBottom: "12px",
  },
  smallText: {
    color: "#94a3b8",
    margin: 0,
    lineHeight: 1.5,
  },
  featureGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "12px",
    marginBottom: "18px",
  },
  featureCard: {
    background: "rgba(15,23,42,0.62)",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: "16px",
    padding: "14px",
  },
  featureTitle: {
    margin: "0 0 8px 0",
    color: "#bae6fd",
    fontSize: "16px",
  },
  featureMeaning: {
    color: "#e2e8f0",
    lineHeight: 1.5,
    margin: "0 0 8px 0",
    fontSize: "14px",
  },
  featureImportance: {
    color: "#9fb1c9",
    lineHeight: 1.5,
    margin: 0,
    fontSize: "13px",
  },
  bottomGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "14px",
  },
  warningCard: {
    background: "rgba(251,191,36,0.10)",
    border: "1px solid rgba(251,191,36,0.25)",
    borderRadius: "18px",
    padding: "16px",
  },
  warningTitle: {
    color: "#fde68a",
    margin: "0 0 10px 0",
    fontSize: "18px",
  },
  interpretCard: {
    background: "rgba(0,0,0,0.20)",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: "18px",
    padding: "16px",
  },
  interpretList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  interpretLine: {
    display: "grid",
    gridTemplateColumns: "150px 1fr",
    gap: "10px",
    color: "#cbd5e1",
    lineHeight: 1.5,
  },
};