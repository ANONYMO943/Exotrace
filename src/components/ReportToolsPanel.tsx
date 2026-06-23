import { useState } from "react";
import type { CSSProperties } from "react";

import type {
  PredictionResult,
  FullReportSummary,
  CandidateRecord,
} from "../lib/api";

type ReportToolsPanelProps = {
  prediction: PredictionResult | null;
  reportSummary: FullReportSummary | null;
  topCandidates: CandidateRecord[];
};

function formatPercent(value?: number | null) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "-";
  }

  return `${(value * 100).toFixed(1)}%`;
}

function safeText(value: unknown, fallback = "-") {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  return String(value);
}

function csvEscape(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

export function ReportToolsPanel({
  prediction,
  reportSummary,
  topCandidates,
}: ReportToolsPanelProps) {
  const [status, setStatus] = useState("");

  async function copyText(text: string, successMessage: string) {
    try {
      await navigator.clipboard.writeText(text);
      setStatus(successMessage);
    } catch {
      setStatus("Copy failed. Please try again.");
    }
  }

  function downloadText(filename: string, content: string, mimeType = "text/plain") {
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();

    URL.revokeObjectURL(url);
    setStatus(`Downloaded ${filename}`);
  }

  function buildProjectSummary() {
    const candidateMetrics = reportSummary?.candidate_screening_metrics;
    const classificationMetrics = reportSummary?.classification_metrics;

    return [
      "ExoTrace Project Summary",
      "========================",
      "",
      "Project: ExoTrace",
      "Title: AI-enabled Detection of Exoplanets from Noisy Astronomical Light Curves",
      "",
      "Purpose:",
      "ExoTrace detects, ranks, and explains possible exoplanet candidates from noisy TESS light curves.",
      "",
      "Technical Pipeline:",
      "- TESS light curve loading",
      "- Data cleaning and normalization",
      "- Detrending",
      "- Box Least Squares transit detection",
      "- Transit feature extraction",
      "- ExtraTrees machine learning classification",
      "- Optimized planet-candidate thresholding",
      "- FastAPI backend and React dashboard",
      "",
      "Key Results:",
      `- Total predictions: ${safeText(reportSummary?.total_predictions)}`,
      `- Full batch accuracy: ${formatPercent(classificationMetrics?.accuracy)}`,
      `- Candidate recall: ${formatPercent(candidateMetrics?.recall)}`,
      `- Candidate precision: ${formatPercent(candidateMetrics?.precision)}`,
      `- Candidate F1: ${formatPercent(candidateMetrics?.f1)}`,
      `- True positive planets: ${safeText(candidateMetrics?.true_positive_planets)}`,
      `- Missed planets: ${safeText(candidateMetrics?.missed_planets)}`,
      `- False planet alerts: ${safeText(candidateMetrics?.false_planet_alerts)}`,
      `- High priority candidates: ${safeText(reportSummary?.high_priority_candidate_count)}`,
      "",
      "Honesty Note:",
      "ExoTrace is a prototype candidate screening tool, not a final astronomical validation system.",
      "Final validation requires larger datasets, stellar metadata, centroid shift checks, contamination analysis, and expert review.",
      "",
      "Tagline:",
      "From noisy starlight to ranked exoplanet candidates.",
    ].join("\n");
  }

  function buildPredictionSummary() {
    if (!prediction) {
      return "No prediction is currently selected. Run a TIC prediction first.";
    }

    const planetProbability =
      prediction.planet_probability ?? prediction.class_probabilities?.planet;

    return [
      "ExoTrace Current Prediction Report",
      "==================================",
      "",
      `TIC ID: ${safeText(prediction.tic_id)}`,
      `True Label: ${safeText(prediction.true_label)}`,
      `Predicted Label: ${safeText(prediction.predicted_label)}`,
      `Decision: ${safeText(prediction.decision)}`,
      `Candidate: ${prediction.is_planet_candidate ? "Yes" : "No"}`,
      `Candidate Priority: ${safeText(prediction.candidate_priority)}`,
      `Planet Probability: ${formatPercent(planetProbability)}`,
      `Confidence: ${formatPercent(prediction.confidence)}`,
      `Planet Threshold: ${formatPercent(prediction.planet_threshold)}`,
      `Model: ${safeText(prediction.model_name)}`,
      "",
      "Transit Features:",
      `- Period: ${prediction.features.period_days.toFixed(4)} days`,
      `- Duration: ${prediction.features.duration_hours.toFixed(2)} hours`,
      `- Depth: ${prediction.features.depth_percent.toFixed(4)}%`,
      `- SNR: ${prediction.features.snr.toFixed(2)}`,
      `- BLS Power: ${prediction.features.bls_power.toFixed(4)}`,
      `- Detected Transits: ${prediction.features.n_detected_transits}`,
      "",
      "Class Probabilities:",
      ...Object.entries(prediction.class_probabilities).map(
        ([label, probability]) => `- ${label}: ${formatPercent(probability)}`
      ),
    ].join("\n");
  }

  function buildTopCandidatesCsv() {
    const headers = [
      "tic_id",
      "decision",
      "candidate_priority",
      "planet_probability",
      "period_days",
      "depth_percent",
      "snr",
      "n_detected_transits",
    ];

    const rows = topCandidates.map((candidate) =>
      [
        safeText(candidate.tic_id),
        safeText(candidate.decision),
        safeText(candidate.candidate_priority),
        safeText(candidate.planet_probability),
        safeText(candidate.period_days),
        safeText(candidate.depth_percent),
        safeText(candidate.snr),
        safeText(candidate.n_detected_transits),
      ]
        .map(csvEscape)
        .join(",")
    );

    return [headers.join(","), ...rows].join("\n");
  }

  return (
    <section id="report-tools" style={styles.panel}>
      <div style={styles.headerRow}>
        <div>
          <p style={styles.eyebrow}>Submission Tools</p>
          <h2 style={styles.title}>Download / Copy Report</h2>
          <p style={styles.subtitle}>
            Quickly copy summaries or download report files for demo, submission,
            and judge explanation.
          </p>
        </div>

        <div style={styles.statusBox}>
          {status || "Ready to generate report content"}
        </div>
      </div>

      <div style={styles.toolGrid}>
        <button
          style={styles.toolButton}
          onClick={() =>
            copyText(buildProjectSummary(), "Project summary copied.")
          }
        >
          <span style={styles.buttonIcon}>📋</span>
          <strong>Copy Project Summary</strong>
          <small>Copy final project metrics and explanation.</small>
        </button>

        <button
          style={styles.toolButton}
          onClick={() =>
            copyText(buildPredictionSummary(), "Prediction report copied.")
          }
        >
          <span style={styles.buttonIcon}>🛰️</span>
          <strong>Copy Current Prediction</strong>
          <small>Copy selected TIC result and transit features.</small>
        </button>

        <button
          style={styles.toolButton}
          onClick={() =>
            downloadText(
              "exotrace_top_candidates.csv",
              buildTopCandidatesCsv(),
              "text/csv"
            )
          }
        >
          <span style={styles.buttonIcon}>⬇️</span>
          <strong>Download Top Candidates CSV</strong>
          <small>Export ranked candidate table.</small>
        </button>

        <button
          style={styles.toolButton}
          onClick={() =>
            downloadText(
              "exotrace_submission_summary.txt",
              buildProjectSummary()
            )
          }
        >
          <span style={styles.buttonIcon}>📄</span>
          <strong>Download Submission Summary</strong>
          <small>Save a text file for portal submission.</small>
        </button>
      </div>

      <div style={styles.noteBox}>
        <strong>Judge-friendly note:</strong> Use this section after running a
        demo TIC prediction. It helps show that ExoTrace is not only a model, but
        also a complete reporting workflow.
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
  statusBox: {
    background: "rgba(56,189,248,0.10)",
    border: "1px solid rgba(56,189,248,0.28)",
    borderRadius: "14px",
    padding: "12px 14px",
    color: "#bae6fd",
    minWidth: "240px",
    fontWeight: 700,
  },
  toolGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
    gap: "12px",
  },
  toolButton: {
    background: "rgba(15,23,42,0.70)",
    color: "#e5edf7",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "18px",
    padding: "16px",
    cursor: "pointer",
    textAlign: "left",
    display: "flex",
    flexDirection: "column",
    gap: "7px",
    minHeight: "150px",
  },
  buttonIcon: {
    fontSize: "26px",
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