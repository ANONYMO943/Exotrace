import { useEffect, useState } from "react";
import type { CSSProperties } from "react";

import { BackendHealthPanel } from "./BackendHealthPanel";
import { CandidateExplorer } from "./CandidateExplorer";
import { DashboardQuickNav } from "./DashboardQuickNav";
import { DemoGuidePanel } from "./DemoGuidePanel";

import { LightCurvePlots } from "./LightCurvePlots";
import { ModelExplanationPanel } from "./ModelExplanationPanel";
import { PerformanceReportPanel } from "./PerformanceReportPanel";
import { PipelinePosterPanel } from "./PipelinePosterPanel";
import {
  PredictionHistoryPanel,
  type PredictionHistoryItem,
} from "./PredictionHistoryPanel";
import { ReportToolsPanel } from "./ReportToolsPanel";

import {
  getFullReportSummary,
  getSummary,
  getTargetsByLabel,
  getTopCandidates,
  predictByTic,
} from "../lib/api";

import type {
  CandidateRecord,
  FullReportSummary,
  PredictionResult,
  SummaryResponse,
  Target,
} from "../lib/api";

export function ExoTraceDashboard() {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [reportSummary, setReportSummary] = useState<FullReportSummary | null>(
    null
  );
  const [topCandidates, setTopCandidates] = useState<CandidateRecord[]>([]);
  const [targets, setTargets] = useState<Target[]>([]);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [predictionHistory, setPredictionHistory] = useState<
    PredictionHistoryItem[]
  >([]);
  const [judgeMode, setJudgeMode] = useState(false);
  const [selectedTic, setSelectedTic] = useState("146172354");
  const [selectedLabel, setSelectedLabel] = useState("planet");
  const [error, setError] = useState<string | null>(null);

  async function loadDashboardData(label = selectedLabel) {
    try {
      setLoading(true);
      setError(null);

      const [summaryData, targetsData, reportData, topCandidateData] =
        await Promise.all([
          getSummary(),
          getTargetsByLabel(label, 12),
          getFullReportSummary(),
          getTopCandidates(10),
        ]);

      setSummary(summaryData);
      setTargets(targetsData.targets);
      setReportSummary(reportData.summary);
      setTopCandidates(topCandidateData.candidates);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown API error");
    } finally {
      setLoading(false);
    }
  }

  async function changeTargetLabel(label: string) {
    setSelectedLabel(label);
    await loadDashboardData(label);
  }

  function addPredictionToHistory(ticId: string, result: PredictionResult) {
    const now = new Date();

    const item: PredictionHistoryItem = {
      ticId,
      trueLabel: result.true_label,
      predictedLabel: result.predicted_label,
      decision: result.decision,
      planetProbability:
        result.planet_probability ?? result.class_probabilities?.planet,
      confidence: result.confidence,
      isPlanetCandidate: result.is_planet_candidate,
      candidatePriority: result.candidate_priority,
      timestamp: now.toLocaleTimeString(),
    };

    setPredictionHistory((previous) => {
      const withoutDuplicate = previous.filter(
        (entry) => entry.ticId !== item.ticId
      );

      return [item, ...withoutDuplicate].slice(0, 10);
    });
  }

  async function runPrediction(ticId?: string | number) {
    try {
      setLoading(true);
      setError(null);

      const id = ticId ?? selectedTic;
      const idString = String(id);

      setSelectedTic(idString);

      const predictionData = await predictByTic(id);
      const result = predictionData.result;

      setPrediction(result);
      addPredictionToHistory(idString, result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown prediction error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboardData("planet");
  }, []);

  const planetProbability = prediction
    ? Math.round(prediction.planet_probability * 100)
    : 0;

  const confidence = prediction ? Math.round(prediction.confidence * 100) : 0;

  const planetThreshold =
    prediction?.planet_threshold !== undefined
      ? Math.round(prediction.planet_threshold * 100)
      : null;

  const fullAccuracy = reportSummary
    ? formatPercent(reportSummary.classification_metrics.accuracy)
    : "-";

  const candidateRecall = reportSummary
    ? formatPercent(reportSummary.candidate_screening_metrics.recall)
    : "-";

  const missedPlanets =
    reportSummary?.candidate_screening_metrics.missed_planets ?? "-";

  const falseAlerts =
    reportSummary?.candidate_screening_metrics.false_planet_alerts ?? "-";

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <p style={styles.eyebrow}>AI-enabled Exoplanet Transit Detection</p>

          <h1 style={styles.title}>ExoTrace</h1>

          <p style={styles.subtitle}>
            Detecting possible exoplanet transits from noisy TESS light curves
            using BLS features, optimized planet-candidate thresholding, and
            machine learning.
          </p>
        </div>

        <div style={styles.statusCard}>
          <div style={styles.statusDot}></div>
          <span>Backend Connected</span>
        </div>
      </header>

      {error && <div style={styles.errorBox}>{error}</div>}

      <DashboardQuickNav />



      <BackendHealthPanel />

      <DemoGuidePanel onRunPrediction={(ticId) => runPrediction(ticId)} />

      <PipelinePosterPanel />

      {!judgeMode && (
        <PredictionHistoryPanel
          history={predictionHistory}
          onRunAgain={(ticId) => runPrediction(ticId)}
          onClear={() => setPredictionHistory([])}
        />
      )}

      <ReportToolsPanel
        prediction={prediction}
        reportSummary={reportSummary}
        topCandidates={topCandidates}
      />

      {!judgeMode && <PerformanceReportPanel />}

      {!judgeMode && <ModelExplanationPanel />}

      {!judgeMode && <CandidateExplorer />}

      <section style={styles.grid}>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Light Curves</p>
          <h2 style={styles.metricValue}>
            {summary?.dataset.total_lightcurves ?? "-"}
          </h2>
          <p style={styles.metricNote}>Balanced pilot dataset</p>
        </div>

        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Full Batch Accuracy</p>
          <h2 style={styles.metricValue}>{fullAccuracy}</h2>
          <p style={styles.metricNote}>All 150 predictions</p>
        </div>

        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Candidate Recall</p>
          <h2 style={styles.metricValue}>{candidateRecall}</h2>
          <p style={styles.metricNote}>Planet screening recall</p>
        </div>

        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Missed Planets</p>
          <h2 style={styles.metricValue}>{missedPlanets}</h2>
          <p style={styles.metricNote}>Out of 50 planet examples</p>
        </div>
      </section>

      <section style={styles.grid}>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Best Model</p>
          <h2 style={styles.metricValue}>{summary?.model.name ?? "-"}</h2>
          <p style={styles.metricNote}>ExtraTrees classifier</p>
        </div>

        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Test Split Accuracy</p>
          <h2 style={styles.metricValue}>
            {summary ? formatPercent(summary.model.accuracy) : "-"}
          </h2>
          <p style={styles.metricNote}>Held-out split metric</p>
        </div>

        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>False Alerts</p>
          <h2 style={styles.metricValue}>{falseAlerts}</h2>
          <p style={styles.metricNote}>Non-planets flagged for review</p>
        </div>

        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>High Priority</p>
          <h2 style={styles.metricValue}>
            {reportSummary?.high_priority_candidate_count ?? "-"}
          </h2>
          <p style={styles.metricNote}>Strong planet candidates</p>
        </div>
      </section>

      <section style={styles.mainGrid}>
        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <div>
              <h2 style={styles.panelTitle}>Dataset Overview</h2>

              <p style={styles.panelSubtitle}>
                Three-class light curve classification dataset.
              </p>
            </div>
          </div>

          <div style={styles.classGrid}>
            <div style={styles.classBox}>
              <p style={styles.classLabel}>Planet</p>
              <h3 style={styles.classValue}>
                {summary?.dataset.class_counts.planet ?? "-"}
              </h3>
            </div>

            <div style={styles.classBox}>
              <p style={styles.classLabel}>False Positive</p>
              <h3 style={styles.classValue}>
                {summary?.dataset.class_counts.false_positive ?? "-"}
              </h3>
            </div>

            <div style={styles.classBox}>
              <p style={styles.classLabel}>Eclipsing Binary</p>
              <h3 style={styles.classValue}>
                {summary?.dataset.class_counts.eclipsing_binary ?? "-"}
              </h3>
            </div>
          </div>

          <h3 style={styles.smallHeading}>Candidate Screening Report</h3>

          <div style={styles.reportGrid}>
            <ReportBox
              label="True Positive Planets"
              value={String(
                reportSummary?.candidate_screening_metrics
                  .true_positive_planets ?? "-"
              )}
            />

            <ReportBox
              label="True Non-planets"
              value={String(
                reportSummary?.candidate_screening_metrics.true_non_planets ??
                  "-"
              )}
            />

            <ReportBox
              label="Candidate Precision"
              value={
                reportSummary
                  ? formatPercent(
                      reportSummary.candidate_screening_metrics.precision
                    )
                  : "-"
              }
            />

            <ReportBox
              label="Candidate F1"
              value={
                reportSummary
                  ? formatPercent(reportSummary.candidate_screening_metrics.f1)
                  : "-"
              }
            />
          </div>

          <h3 style={styles.smallHeading}>Available Targets</h3>

          <div style={styles.filterRow}>
            <button
              style={{
                ...styles.filterButton,
                ...(selectedLabel === "planet" ? styles.activeFilterButton : {}),
              }}
              onClick={() => changeTargetLabel("planet")}
            >
              Planet
            </button>

            <button
              style={{
                ...styles.filterButton,
                ...(selectedLabel === "false_positive"
                  ? styles.activeFilterButton
                  : {}),
              }}
              onClick={() => changeTargetLabel("false_positive")}
            >
              False Positive
            </button>

            <button
              style={{
                ...styles.filterButton,
                ...(selectedLabel === "eclipsing_binary"
                  ? styles.activeFilterButton
                  : {}),
              }}
              onClick={() => changeTargetLabel("eclipsing_binary")}
            >
              Eclipsing Binary
            </button>
          </div>

          <div style={styles.targetList}>
            {targets.map((target) => (
              <button
                key={`${target.tic_id}-${target.label}`}
                style={styles.targetButton}
                onClick={() => runPrediction(target.tic_id)}
              >
                <span>TIC {target.tic_id}</span>
                <span style={styles.badge}>{target.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div id="prediction-section" style={styles.panel}>
          <h2 style={styles.panelTitle}>Run Transit Prediction</h2>

          <p style={styles.panelSubtitle}>
            Enter a TIC ID from the dataset and run the trained ExoTrace
            classifier.
          </p>

          <div style={styles.inputRow}>
            <input
              value={selectedTic}
              onChange={(event) => setSelectedTic(event.target.value)}
              placeholder="Enter TIC ID"
              style={styles.input}
            />

            <button
              onClick={() => runPrediction()}
              disabled={loading}
              style={styles.primaryButton}
            >
              {loading ? "Analyzing..." : "Predict"}
            </button>
          </div>

          {prediction ? (
            <div style={styles.predictionCard}>
              <div style={styles.predictionHeader}>
                <div>
                  <p style={styles.metricLabel}>Prediction Result</p>

                  <h2 style={styles.predictedLabel}>
                    {prediction.predicted_label}
                  </h2>

                  <p style={styles.decision}>{prediction.decision}</p>

                  <div style={styles.candidatePill}>
                    Candidate: {prediction.is_planet_candidate ? "Yes" : "No"}
                    {" · "}
                    Priority: {prediction.candidate_priority ?? "review"}
                  </div>
                </div>

                <div style={styles.probCircle}>
                  <strong>{planetProbability}%</strong>
                  <span>planet</span>
                  <small>
                    threshold{" "}
                    {planetThreshold !== null ? `${planetThreshold}%` : "N/A"}
                  </small>
                </div>
              </div>

              <div style={styles.resultGrid}>
                <div style={styles.resultBox}>
                  <p style={styles.resultLabel}>TIC ID</p>
                  <p style={styles.resultValue}>{prediction.tic_id}</p>
                </div>

                <div style={styles.resultBox}>
                  <p style={styles.resultLabel}>True Label</p>
                  <p style={styles.resultValue}>{prediction.true_label}</p>
                </div>

                <div style={styles.resultBox}>
                  <p style={styles.resultLabel}>Confidence</p>
                  <p style={styles.resultValue}>{confidence}%</p>
                </div>

                <div style={styles.resultBox}>
                  <p style={styles.resultLabel}>Model</p>
                  <p style={styles.resultValue}>{prediction.model_name}</p>
                </div>

                <div style={styles.resultBox}>
                  <p style={styles.resultLabel}>Candidate</p>
                  <p style={styles.resultValue}>
                    {prediction.is_planet_candidate ? "Yes" : "No"}
                  </p>
                </div>

                <div style={styles.resultBox}>
                  <p style={styles.resultLabel}>Priority</p>
                  <p style={styles.resultValue}>
                    {prediction.candidate_priority ?? "review"}
                  </p>
                </div>
              </div>

              <h3 style={styles.smallHeading}>Transit Features</h3>

              <div style={styles.featureGrid}>
                <Feature
                  label="Period"
                  value={`${prediction.features.period_days.toFixed(4)} d`}
                />

                <Feature
                  label="Duration"
                  value={`${prediction.features.duration_hours.toFixed(2)} h`}
                />

                <Feature
                  label="Depth"
                  value={`${prediction.features.depth_percent.toFixed(4)}%`}
                />

                <Feature
                  label="SNR"
                  value={prediction.features.snr.toFixed(2)}
                />

                <Feature
                  label="BLS Power"
                  value={prediction.features.bls_power.toFixed(4)}
                />

                <Feature
                  label="Transits"
                  value={String(prediction.features.n_detected_transits)}
                />
              </div>

              <h3 style={styles.smallHeading}>Class Probabilities</h3>

              <div style={styles.probabilityList}>
                {Object.entries(prediction.class_probabilities).map(
                  ([label, probability]) => (
                    <div key={label} style={styles.probabilityRow}>
                      <span>{label}</span>

                      <div style={styles.probabilityTrack}>
                        <div
                          style={{
                            ...styles.probabilityFill,
                            width: `${Math.round(probability * 100)}%`,
                          }}
                        />
                      </div>

                      <strong>{(probability * 100).toFixed(1)}%</strong>
                    </div>
                  )
                )}
              </div>

              <LightCurvePlots plotUrls={prediction.plot_urls} />
            </div>
          ) : (
            <div style={styles.emptyState}>
              Run a prediction to see the classification, candidate decision,
              transit features, probability scores, and light curve plots.
            </div>
          )}
        </div>
      </section>

      <section id="top-candidates-section" style={styles.topCandidatesPanel}>
        <div style={styles.panelHeader}>
          <div>
            <h2 style={styles.panelTitle}>Top Planet Candidates</h2>

            <p style={styles.panelSubtitle}>
              Highest ranked candidate predictions from the full batch report.
            </p>
          </div>
        </div>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>TIC ID</th>
                <th style={styles.th}>Decision</th>
                <th style={styles.th}>Priority</th>
                <th style={styles.th}>Planet Prob.</th>
                <th style={styles.th}>Period</th>
                <th style={styles.th}>Depth</th>
                <th style={styles.th}>SNR</th>
                <th style={styles.th}>Transits</th>
              </tr>
            </thead>

            <tbody>
              {topCandidates.map((candidate) => (
                <tr key={candidate.tic_id}>
                  <td style={styles.td}>TIC {candidate.tic_id}</td>
                  <td style={styles.td}>{candidate.decision}</td>
                  <td style={styles.td}>
                    <span style={styles.priorityBadge}>
                      {candidate.candidate_priority}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {formatPercent(candidate.planet_probability)}
                  </td>
                  <td style={styles.td}>
                    {candidate.period_days.toFixed(4)} d
                  </td>
                  <td style={styles.td}>
                    {candidate.depth_percent.toFixed(4)}%
                  </td>
                  <td style={styles.td}>{candidate.snr.toFixed(2)}</td>
                  <td style={styles.td}>{candidate.n_detected_transits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Feature({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.featureBox}>
      <p style={styles.resultLabel}>{label}</p>
      <p style={styles.resultValue}>{value}</p>
    </div>
  );
}

function ReportBox({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.classBox}>
      <p style={styles.classLabel}>{label}</p>
      <h3 style={styles.classValue}>{value}</h3>
    </div>
  );
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #08111f 0%, #101a32 50%, #0b1020 100%)",
    color: "#e5edf7",
    padding: "32px",
    fontFamily: "Inter, Arial, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: "24px",
    alignItems: "flex-start",
    marginBottom: "28px",
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
    fontSize: "54px",
    margin: "8px 0",
    lineHeight: 1,
  },
  subtitle: {
    maxWidth: "780px",
    color: "#b8c7dc",
    fontSize: "16px",
    lineHeight: 1.6,
  },
  statusCard: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "999px",
    padding: "10px 16px",
    color: "#c7f9cc",
  },
  statusDot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    background: "#22c55e",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
    marginBottom: "20px",
  },
  metricCard: {
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "20px",
    padding: "20px",
  },
  metricLabel: {
    color: "#9fb1c9",
    fontSize: "13px",
    margin: 0,
  },
  metricValue: {
    fontSize: "30px",
    margin: "8px 0",
  },
  metricNote: {
    color: "#7e90a8",
    fontSize: "13px",
    margin: 0,
  },
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
    gap: "20px",
  },
  panel: {
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "24px",
    padding: "22px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
  },
  topCandidatesPanel: {
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "24px",
    padding: "22px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
    marginTop: "20px",
  },
  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "14px",
    flexWrap: "wrap",
  },
  panelTitle: {
    margin: 0,
    fontSize: "24px",
  },
  panelSubtitle: {
    color: "#a7b7cc",
    lineHeight: 1.5,
  },
  classGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
    gap: "10px",
    marginTop: "18px",
    marginBottom: "24px",
  },
  reportGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "10px",
    marginBottom: "22px",
  },
  classBox: {
    background: "rgba(0,0,0,0.22)",
    borderRadius: "16px",
    padding: "14px",
  },
  classLabel: {
    color: "#9fb1c9",
    fontSize: "12px",
    margin: 0,
  },
  classValue: {
    margin: "6px 0 0 0",
    fontSize: "24px",
  },
  smallHeading: {
    marginTop: "20px",
    marginBottom: "12px",
  },
  filterRow: {
    display: "flex",
    gap: "8px",
    marginBottom: "12px",
    flexWrap: "wrap",
  },
  filterButton: {
    background: "rgba(255,255,255,0.07)",
    color: "#dbeafe",
    border: "1px solid rgba(255,255,255,0.14)",
    borderRadius: "999px",
    padding: "8px 12px",
    cursor: "pointer",
    fontWeight: 600,
  },
  activeFilterButton: {
    background: "#38bdf8",
    color: "#06111f",
  },
  targetList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    maxHeight: "360px",
    overflowY: "auto",
  },
  targetButton: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
    background: "rgba(255,255,255,0.07)",
    color: "#e5edf7",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "12px",
    padding: "12px",
    cursor: "pointer",
  },
  badge: {
    background: "rgba(125, 211, 252, 0.15)",
    color: "#7dd3fc",
    borderRadius: "999px",
    padding: "4px 8px",
    fontSize: "12px",
  },
  inputRow: {
    display: "flex",
    gap: "10px",
    marginTop: "18px",
    marginBottom: "18px",
    flexWrap: "wrap",
  },
  input: {
    flex: 1,
    minWidth: "220px",
    padding: "13px 14px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(0,0,0,0.24)",
    color: "#ffffff",
    fontSize: "15px",
  },
  primaryButton: {
    padding: "13px 18px",
    borderRadius: "12px",
    border: "none",
    background: "#38bdf8",
    color: "#06111f",
    fontWeight: 700,
    cursor: "pointer",
  },
  predictionCard: {
    background: "rgba(0,0,0,0.20)",
    borderRadius: "20px",
    padding: "18px",
    border: "1px solid rgba(255,255,255,0.10)",
  },
  predictionHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  predictedLabel: {
    margin: "8px 0",
    fontSize: "32px",
    textTransform: "capitalize",
  },
  decision: {
    color: "#bae6fd",
    margin: 0,
  },
  candidatePill: {
    display: "inline-block",
    marginTop: "12px",
    background: "rgba(56,189,248,0.14)",
    border: "1px solid rgba(56,189,248,0.35)",
    color: "#bae6fd",
    padding: "8px 12px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: 700,
  },
  probCircle: {
    width: "118px",
    height: "118px",
    borderRadius: "50%",
    border: "8px solid rgba(56,189,248,0.65)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    background: "rgba(56,189,248,0.10)",
    textAlign: "center",
    gap: "2px",
  },
  resultGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "12px",
    marginTop: "20px",
  },
  resultBox: {
    background: "rgba(255,255,255,0.06)",
    borderRadius: "14px",
    padding: "12px",
  },
  resultLabel: {
    color: "#9fb1c9",
    fontSize: "12px",
    margin: 0,
  },
  resultValue: {
    margin: "5px 0 0 0",
    fontWeight: 700,
  },
  featureGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "10px",
  },
  featureBox: {
    background: "rgba(255,255,255,0.07)",
    borderRadius: "14px",
    padding: "12px",
  },
  probabilityList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  probabilityRow: {
    display: "grid",
    gridTemplateColumns: "140px 1fr 64px",
    alignItems: "center",
    gap: "12px",
  },
  probabilityTrack: {
    height: "10px",
    background: "rgba(255,255,255,0.12)",
    borderRadius: "999px",
    overflow: "hidden",
  },
  probabilityFill: {
    height: "100%",
    background: "#38bdf8",
    borderRadius: "999px",
  },
  emptyState: {
    padding: "30px",
    border: "1px dashed rgba(255,255,255,0.25)",
    borderRadius: "16px",
    color: "#9fb1c9",
    textAlign: "center",
  },
  errorBox: {
    background: "rgba(239,68,68,0.12)",
    border: "1px solid rgba(239,68,68,0.45)",
    color: "#fecaca",
    padding: "14px",
    borderRadius: "14px",
    marginBottom: "18px",
  },
  tableWrapper: {
    overflowX: "auto",
    marginTop: "18px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "900px",
  },
  th: {
    textAlign: "left",
    color: "#bae6fd",
    fontSize: "13px",
    padding: "12px",
    borderBottom: "1px solid rgba(255,255,255,0.15)",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "12px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    color: "#e5edf7",
    fontSize: "13px",
    whiteSpace: "nowrap",
  },
  priorityBadge: {
    display: "inline-block",
    background: "rgba(56,189,248,0.14)",
    color: "#7dd3fc",
    border: "1px solid rgba(56,189,248,0.30)",
    borderRadius: "999px",
    padding: "4px 8px",
    fontWeight: 700,
  },
};