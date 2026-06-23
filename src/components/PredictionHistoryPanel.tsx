import type { CSSProperties } from "react";

export type PredictionHistoryItem = {
  ticId: string;
  trueLabel?: string;
  predictedLabel?: string;
  decision?: string;
  planetProbability?: number;
  confidence?: number;
  isPlanetCandidate?: boolean;
  candidatePriority?: string;
  timestamp: string;
};

type PredictionHistoryPanelProps = {
  history: PredictionHistoryItem[];
  onRunAgain: (ticId: string) => void;
  onClear: () => void;
};

function formatPercent(value?: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "-";
  }

  return `${(value * 100).toFixed(1)}%`;
}

function priorityStyle(priority?: string): CSSProperties {
  const normalized = priority?.toLowerCase();

  if (normalized === "high") {
    return {
      ...styles.badge,
      background: "rgba(248,113,113,0.18)",
      color: "#fecaca",
      border: "1px solid rgba(248,113,113,0.35)",
    };
  }

  if (normalized === "medium") {
    return {
      ...styles.badge,
      background: "rgba(251,191,36,0.16)",
      color: "#fde68a",
      border: "1px solid rgba(251,191,36,0.30)",
    };
  }

  return {
    ...styles.badge,
    background: "rgba(148,163,184,0.16)",
    color: "#cbd5e1",
    border: "1px solid rgba(148,163,184,0.25)",
  };
}

export function PredictionHistoryPanel({
  history,
  onRunAgain,
  onClear,
}: PredictionHistoryPanelProps) {
  return (
    <section id="prediction-history" style={styles.panel}>
      <div style={styles.headerRow}>
        <div>
          <p style={styles.eyebrow}>Demo Tracking</p>
          <h2 style={styles.title}>Prediction History</h2>
          <p style={styles.subtitle}>
            Recent TIC predictions tested during the demo session.
          </p>
        </div>

        <button
          style={{
            ...styles.clearButton,
            opacity: history.length === 0 ? 0.45 : 1,
            cursor: history.length === 0 ? "not-allowed" : "pointer",
          }}
          onClick={onClear}
          disabled={history.length === 0}
        >
          Clear History
        </button>
      </div>

      {history.length === 0 ? (
        <div style={styles.emptyBox}>
          <strong>No predictions yet.</strong>
          <span>
            Run a prediction from the demo panel or prediction form to start tracking history.
          </span>
        </div>
      ) : (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Time</th>
                <th style={styles.th}>TIC ID</th>
                <th style={styles.th}>True Label</th>
                <th style={styles.th}>Predicted</th>
                <th style={styles.th}>Decision</th>
                <th style={styles.th}>Priority</th>
                <th style={styles.th}>Candidate</th>
                <th style={styles.th}>Planet Prob.</th>
                <th style={styles.th}>Confidence</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>

            <tbody>
              {history.map((item, index) => (
                <tr key={`${item.ticId}-${item.timestamp}-${index}`}>
                  <td style={styles.td}>{item.timestamp}</td>

                  <td style={styles.td}>
                    <strong>{item.ticId}</strong>
                  </td>

                  <td style={styles.td}>{item.trueLabel ?? "-"}</td>

                  <td style={styles.td}>{item.predictedLabel ?? "-"}</td>

                  <td style={styles.td}>{item.decision ?? "-"}</td>

                  <td style={styles.td}>
                    <span style={priorityStyle(item.candidatePriority)}>
                      {item.candidatePriority ?? "low"}
                    </span>
                  </td>

                  <td style={styles.td}>
                    <span
                      style={
                        item.isPlanetCandidate
                          ? styles.candidateYes
                          : styles.candidateNo
                      }
                    >
                      {item.isPlanetCandidate ? "Yes" : "No"}
                    </span>
                  </td>

                  <td style={styles.td}>
                    {formatPercent(item.planetProbability)}
                  </td>

                  <td style={styles.td}>{formatPercent(item.confidence)}</td>

                  <td style={styles.td}>
                    <button
                      style={styles.runButton}
                      onClick={() => onRunAgain(item.ticId)}
                    >
                      Run Again
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
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
  },
  clearButton: {
    background: "rgba(248,113,113,0.14)",
    color: "#fecaca",
    border: "1px solid rgba(248,113,113,0.32)",
    borderRadius: "12px",
    padding: "10px 13px",
    fontWeight: 800,
  },
  emptyBox: {
    background: "rgba(15,23,42,0.60)",
    border: "1px dashed rgba(255,255,255,0.18)",
    borderRadius: "16px",
    padding: "18px",
    color: "#cbd5e1",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  tableWrapper: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "1050px",
  },
  th: {
    textAlign: "left",
    color: "#93c5fd",
    borderBottom: "1px solid rgba(255,255,255,0.14)",
    padding: "12px 10px",
    fontSize: "13px",
    whiteSpace: "nowrap",
  },
  td: {
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    padding: "12px 10px",
    color: "#dbeafe",
    fontSize: "14px",
    verticalAlign: "top",
  },
  badge: {
    borderRadius: "999px",
    padding: "4px 9px",
    fontSize: "12px",
    fontWeight: 700,
    textTransform: "capitalize",
  },
  candidateYes: {
    borderRadius: "999px",
    padding: "4px 9px",
    background: "rgba(34,197,94,0.16)",
    color: "#bbf7d0",
    border: "1px solid rgba(34,197,94,0.30)",
    fontSize: "12px",
    fontWeight: 800,
  },
  candidateNo: {
    borderRadius: "999px",
    padding: "4px 9px",
    background: "rgba(148,163,184,0.16)",
    color: "#cbd5e1",
    border: "1px solid rgba(148,163,184,0.25)",
    fontSize: "12px",
    fontWeight: 800,
  },
  runButton: {
    background: "rgba(56,189,248,0.14)",
    color: "#bae6fd",
    border: "1px solid rgba(56,189,248,0.32)",
    borderRadius: "10px",
    padding: "7px 10px",
    fontWeight: 800,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
};