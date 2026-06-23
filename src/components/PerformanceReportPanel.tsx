import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { getFullReportSummary } from "../lib/api";

type ReportSummary = Record<string, any>;

function percent(value: number | undefined | null) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "-";
  }

  return `${(value * 100).toFixed(1)}%`;
}

function numberText(value: number | undefined | null) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "-";
  }

  return String(value);
}

function labelText(label: string) {
  return label.replaceAll("_", " ");
}

export function PerformanceReportPanel() {
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSummary() {
      try {
        setLoading(true);
        setError("");

        const response = (await getFullReportSummary()) as any;
        const reportSummary = response?.summary ?? response;

        setSummary(reportSummary);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Unable to load performance report.";

        setError(message);
      } finally {
        setLoading(false);
      }
    }

    loadSummary();
  }, []);

  const classificationMetrics = summary?.classification_metrics;
  const candidateMetrics = summary?.candidate_screening_metrics;

  const accuracy = classificationMetrics?.accuracy;
  const macroF1 =
    classificationMetrics?.classification_report?.["macro avg"]?.["f1-score"];

  const confusionLabels =
    classificationMetrics?.confusion_matrix?.labels ?? [
      "planet",
      "false_positive",
      "eclipsing_binary",
    ];

  const confusionMatrix =
    classificationMetrics?.confusion_matrix?.matrix ?? [
      [40, 8, 2],
      [3, 45, 2],
      [0, 0, 50],
    ];

  const candidateLabels =
    candidateMetrics?.candidate_confusion_matrix?.labels ?? ["not_planet", "planet"];

  const candidateMatrix =
    candidateMetrics?.candidate_confusion_matrix?.matrix ?? [
      [60, 40],
      [1, 49],
    ];

  const classReport = classificationMetrics?.classification_report ?? {};

  const classRows = ["planet", "false_positive", "eclipsing_binary"].map((label) => ({
    label,
    precision: classReport?.[label]?.precision,
    recall: classReport?.[label]?.recall,
    f1: classReport?.[label]?.["f1-score"],
    support: classReport?.[label]?.support,
  }));

  return (
    <section id="performance-report" style={styles.panel}>
      <div style={styles.header}>
        <p style={styles.eyebrow}>Evaluation</p>
        <h2 style={styles.title}>Performance Report</h2>
        <p style={styles.subtitle}>
          This section summarizes model accuracy, class-wise performance, and candidate screening behavior.
        </p>
      </div>

      {loading && <p style={styles.message}>Loading performance report...</p>}

      {error && <p style={styles.error}>{error}</p>}

      {!loading && !error && summary && (
        <>
          <div style={styles.metricGrid}>
            <MetricCard
              label="Full Batch Accuracy"
              value={percent(accuracy)}
              note="Calculated on all 150 pilot light curves"
            />
            <MetricCard
              label="Macro F1"
              value={percent(macroF1)}
              note="Average F1 across all classes"
            />
            <MetricCard
              label="Candidate Recall"
              value={percent(candidateMetrics?.recall)}
              note="Planet examples successfully flagged"
            />
            <MetricCard
              label="Candidate Precision"
              value={percent(candidateMetrics?.precision)}
              note="How many flagged candidates were true planets"
            />
            <MetricCard
              label="True Positive Planets"
              value={numberText(candidateMetrics?.true_positive_planets)}
              note="Detected planet examples"
            />
            <MetricCard
              label="Missed Planets"
              value={numberText(candidateMetrics?.missed_planets)}
              note="Planet examples not flagged"
            />
            <MetricCard
              label="False Planet Alerts"
              value={numberText(candidateMetrics?.false_planet_alerts)}
              note="Non-planets sent for review"
            />
            <MetricCard
              label="High Priority"
              value={numberText(summary?.high_priority_candidate_count)}
              note="Strong planet candidates"
            />
          </div>

          <div style={styles.gridTwo}>
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Class-wise Classification Metrics</h3>

              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Class</th>
                      <th style={styles.th}>Precision</th>
                      <th style={styles.th}>Recall</th>
                      <th style={styles.th}>F1</th>
                      <th style={styles.th}>Support</th>
                    </tr>
                  </thead>

                  <tbody>
                    {classRows.map((row) => (
                      <tr key={row.label}>
                        <td style={styles.td}>
                          <strong>{labelText(row.label)}</strong>
                        </td>
                        <td style={styles.td}>{percent(row.precision)}</td>
                        <td style={styles.td}>{percent(row.recall)}</td>
                        <td style={styles.td}>{percent(row.f1)}</td>
                        <td style={styles.td}>{numberText(row.support)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p style={styles.note}>
                Eclipsing binary recall is 100%, meaning all eclipsing binary examples were correctly identified in the full batch report.
              </p>
            </div>

            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Candidate Screening Summary</h3>

              <div style={styles.screeningGrid}>
                <ScreeningBox
                  label="Recall"
                  value={percent(candidateMetrics?.recall)}
                  description="Useful for catching real planet candidates."
                />
                <ScreeningBox
                  label="Precision"
                  value={percent(candidateMetrics?.precision)}
                  description="Lower because recall is prioritized."
                />
                <ScreeningBox
                  label="F1 Score"
                  value={percent(candidateMetrics?.f1)}
                  description="Balance between precision and recall."
                />
                <ScreeningBox
                  label="Threshold"
                  value="20.0%"
                  description="Optimized planet probability threshold."
                />
              </div>

              <p style={styles.warning}>
                For exoplanet discovery, missing a real candidate is more serious than reviewing extra candidates.
                That is why ExoTrace prioritizes recall.
              </p>
            </div>
          </div>

          <div style={styles.gridTwo}>
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>3-Class Confusion Matrix</h3>
              <p style={styles.smallText}>
                Rows are true labels. Columns are predicted labels.
              </p>

              <ConfusionMatrix labels={confusionLabels} matrix={confusionMatrix} />
            </div>

            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Candidate Confusion Matrix</h3>
              <p style={styles.smallText}>
                Binary screening view where planet is the positive class.
              </p>

              <ConfusionMatrix labels={candidateLabels} matrix={candidateMatrix} />

              <div style={styles.matrixLegend}>
                <LegendItem label="True planets detected" value="49" />
                <LegendItem label="Missed planets" value="1" />
                <LegendItem label="False alerts" value="40" />
                <LegendItem label="True non-planets" value="60" />
              </div>
            </div>
          </div>

          <div style={styles.honestyBox}>
            <strong>Honesty note:</strong>{" "}
            Held-out test accuracy is 78.0%. Full batch accuracy is 90.0% on all 150 pilot examples.
            During presentation, mention both clearly.
          </div>
        </>
      )}
    </section>
  );
}

function MetricCard({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <article style={styles.metricCard}>
      <span style={styles.metricLabel}>{label}</span>
      <strong style={styles.metricValue}>{value}</strong>
      <p style={styles.metricNote}>{note}</p>
    </article>
  );
}

function ScreeningBox({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div style={styles.screeningBox}>
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{description}</p>
    </div>
  );
}

function ConfusionMatrix({
  labels,
  matrix,
}: {
  labels: string[];
  matrix: number[][];
}) {
  return (
    <div style={styles.matrixWrapper}>
      <table style={styles.matrixTable}>
        <thead>
          <tr>
            <th style={styles.matrixCorner}>True \\ Pred</th>
            {labels.map((label) => (
              <th key={label} style={styles.matrixTh}>
                {labelText(label)}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {matrix.map((row, rowIndex) => (
            <tr key={labels[rowIndex] ?? rowIndex}>
              <th style={styles.matrixRowHeader}>
                {labelText(labels[rowIndex] ?? `row ${rowIndex + 1}`)}
              </th>

              {row.map((value, colIndex) => {
                const isDiagonal = rowIndex === colIndex;

                return (
                  <td
                    key={`${rowIndex}-${colIndex}`}
                    style={{
                      ...styles.matrixCell,
                      ...(isDiagonal ? styles.matrixCellCorrect : {}),
                    }}
                  >
                    {value}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LegendItem({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.legendItem}>
      <span>{label}</span>
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
  message: {
    color: "#bae6fd",
  },
  error: {
    color: "#fecaca",
    background: "rgba(248,113,113,0.10)",
    border: "1px solid rgba(248,113,113,0.25)",
    borderRadius: "12px",
    padding: "12px",
  },
  metricGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "12px",
    marginBottom: "16px",
  },
  metricCard: {
    background: "rgba(15,23,42,0.70)",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: "18px",
    padding: "16px",
  },
  metricLabel: {
    color: "#93c5fd",
    fontSize: "13px",
  },
  metricValue: {
    display: "block",
    fontSize: "28px",
    margin: "8px 0",
    color: "#f8fafc",
  },
  metricNote: {
    color: "#94a3b8",
    fontSize: "13px",
    lineHeight: 1.4,
    margin: 0,
  },
  gridTwo: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
    marginBottom: "16px",
  },
  card: {
    background: "rgba(0,0,0,0.20)",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: "18px",
    padding: "16px",
  },
  cardTitle: {
    margin: "0 0 12px 0",
    fontSize: "18px",
  },
  tableWrapper: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    color: "#93c5fd",
    borderBottom: "1px solid rgba(255,255,255,0.14)",
    padding: "10px",
    fontSize: "13px",
  },
  td: {
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    padding: "10px",
    color: "#dbeafe",
    fontSize: "14px",
    textTransform: "capitalize",
  },
  note: {
    color: "#94a3b8",
    lineHeight: 1.5,
    margin: "12px 0 0 0",
    fontSize: "13px",
  },
  screeningGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
  },
  screeningBox: {
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
  smallText: {
    color: "#94a3b8",
    margin: "0 0 12px 0",
    lineHeight: 1.5,
    fontSize: "13px",
  },
  matrixWrapper: {
    overflowX: "auto",
  },
  matrixTable: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: "6px",
    minWidth: "420px",
  },
  matrixCorner: {
    color: "#93c5fd",
    fontSize: "12px",
    textAlign: "center",
    padding: "8px",
  },
  matrixTh: {
    color: "#93c5fd",
    fontSize: "12px",
    textAlign: "center",
    padding: "8px",
    textTransform: "capitalize",
  },
  matrixRowHeader: {
    color: "#93c5fd",
    fontSize: "12px",
    textAlign: "right",
    padding: "8px",
    textTransform: "capitalize",
  },
  matrixCell: {
    background: "rgba(148,163,184,0.16)",
    border: "1px solid rgba(148,163,184,0.24)",
    borderRadius: "12px",
    color: "#e2e8f0",
    textAlign: "center",
    fontWeight: 800,
    fontSize: "20px",
    padding: "16px 10px",
  },
  matrixCellCorrect: {
    background: "rgba(34,197,94,0.16)",
    border: "1px solid rgba(34,197,94,0.30)",
    color: "#bbf7d0",
  },
  matrixLegend: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
    marginTop: "12px",
  },
  legendItem: {
    background: "rgba(255,255,255,0.07)",
    borderRadius: "12px",
    padding: "10px",
    display: "flex",
    justifyContent: "space-between",
    gap: "8px",
    color: "#cbd5e1",
  },
  honestyBox: {
    background: "rgba(251,191,36,0.10)",
    border: "1px solid rgba(251,191,36,0.25)",
    borderRadius: "16px",
    padding: "14px",
    color: "#fde68a",
    lineHeight: 1.5,
  },
};