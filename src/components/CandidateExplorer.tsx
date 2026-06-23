import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { getFullPredictions } from "../lib/api";

type PredictionRow = Record<string, unknown>;

type SortMode =
  | "planet_probability_desc"
  | "planet_probability_asc"
  | "confidence_desc"
  | "tic_id_asc";

function getText(row: PredictionRow, keys: string[], fallback = "-") {
  for (const key of keys) {
    const value = row[key];

    if (value !== undefined && value !== null && value !== "") {
      return String(value);
    }
  }

  return fallback;
}

function getNumber(row: PredictionRow, keys: string[], fallback = 0) {
  for (const key of keys) {
    const value = row[key];

    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string") {
      const parsed = Number(value);

      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return fallback;
}

function getBoolean(row: PredictionRow, keys: string[]) {
  for (const key of keys) {
    const value = row[key];

    if (typeof value === "boolean") {
      return value;
    }

    if (typeof value === "string") {
      return ["true", "1", "yes"].includes(value.toLowerCase());
    }

    if (typeof value === "number") {
      return value === 1;
    }
  }

  return false;
}

function formatPercent(value: number) {
  if (!Number.isFinite(value)) {
    return "-";
  }

  return `${(value * 100).toFixed(1)}%`;
}

function csvEscape(value: string) {
  const safe = value.replaceAll('"', '""');
  return `"${safe}"`;
}

export function CandidateExplorer() {
  const [rows, setRows] = useState<PredictionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchText, setSearchText] = useState("");
  const [labelFilter, setLabelFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [candidatesOnly, setCandidatesOnly] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>("planet_probability_desc");

  useEffect(() => {
    async function loadPredictions() {
      try {
        setLoading(true);
        setError("");

        const response = (await getFullPredictions(150, undefined, false)) as any;

        const predictionRows =
          response?.predictions ??
          response?.records ??
          response?.items ??
          response?.data ??
          [];

        if (!Array.isArray(predictionRows)) {
          throw new Error("Invalid prediction response format.");
        }

        setRows(predictionRows);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Unable to load full prediction records.";

        setError(message);
      } finally {
        setLoading(false);
      }
    }

    loadPredictions();
  }, []);

  const filteredRows = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    const filtered = rows.filter((row) => {
      const ticId = getText(row, ["tic_id", "ticId", "TIC_ID", "TIC"]);
      const trueLabel = getText(row, ["true_label", "label", "actual_label"]);
      const predictedLabel = getText(row, ["predicted_label", "prediction"]);
      const priority = getText(row, ["candidate_priority", "priority"]).toLowerCase();
      const isCandidate = getBoolean(row, [
        "is_planet_candidate",
        "candidate",
        "planet_candidate",
      ]);

      const matchesSearch =
        search.length === 0 ||
        ticId.toLowerCase().includes(search) ||
        trueLabel.toLowerCase().includes(search) ||
        predictedLabel.toLowerCase().includes(search);

      const matchesLabel =
        labelFilter === "all" ||
        trueLabel.toLowerCase() === labelFilter ||
        predictedLabel.toLowerCase() === labelFilter;

      const matchesPriority =
        priorityFilter === "all" || priority === priorityFilter;

      const matchesCandidate = !candidatesOnly || isCandidate;

      return matchesSearch && matchesLabel && matchesPriority && matchesCandidate;
    });

    filtered.sort((a, b) => {
      const aPlanet = getNumber(a, ["planet_probability", "planet_prob"]);
      const bPlanet = getNumber(b, ["planet_probability", "planet_prob"]);

      const aConfidence = getNumber(a, ["confidence", "model_confidence"]);
      const bConfidence = getNumber(b, ["confidence", "model_confidence"]);

      const aTic = Number(getText(a, ["tic_id", "ticId", "TIC_ID", "TIC"], "0"));
      const bTic = Number(getText(b, ["tic_id", "ticId", "TIC_ID", "TIC"], "0"));

      if (sortMode === "planet_probability_desc") {
        return bPlanet - aPlanet;
      }

      if (sortMode === "planet_probability_asc") {
        return aPlanet - bPlanet;
      }

      if (sortMode === "confidence_desc") {
        return bConfidence - aConfidence;
      }

      return aTic - bTic;
    });

    return filtered;
  }, [rows, searchText, labelFilter, priorityFilter, candidatesOnly, sortMode]);

  function exportVisibleRows() {
    const headers = [
      "tic_id",
      "true_label",
      "predicted_label",
      "decision",
      "candidate_priority",
      "is_planet_candidate",
      "planet_probability",
      "confidence",
    ];

    const lines = filteredRows.map((row) => {
      const values = [
        getText(row, ["tic_id", "ticId", "TIC_ID", "TIC"]),
        getText(row, ["true_label", "label", "actual_label"]),
        getText(row, ["predicted_label", "prediction"]),
        getText(row, ["decision"]),
        getText(row, ["candidate_priority", "priority"]),
        String(
          getBoolean(row, ["is_planet_candidate", "candidate", "planet_candidate"])
        ),
        String(getNumber(row, ["planet_probability", "planet_prob"])),
        String(getNumber(row, ["confidence", "model_confidence"])),
      ];

      return values.map(csvEscape).join(",");
    });

    const csv = [headers.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "exotrace_candidate_explorer_export.csv";
    link.click();

    URL.revokeObjectURL(url);
  }

  const candidateCount = filteredRows.filter((row) =>
    getBoolean(row, ["is_planet_candidate", "candidate", "planet_candidate"])
  ).length;

  return (
    <section id="candidate-explorer" style={styles.panel}>
      <div style={styles.headerRow}>
        <div>
          <p style={styles.eyebrow}>Full Batch Explorer</p>
          <h2 style={styles.title}>Candidate Explorer</h2>
          <p style={styles.subtitle}>
            Search, filter, sort, and export full prediction records from the ExoTrace report.
          </p>
        </div>

        <div style={styles.summaryBox}>
          <span>Visible Rows</span>
          <strong>{filteredRows.length}</strong>
          <span>Visible Candidates</span>
          <strong>{candidateCount}</strong>
        </div>
      </div>

      <div style={styles.controls}>
        <input
          style={styles.input}
          placeholder="Search TIC, true label, or predicted label..."
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
        />

        <select
          style={styles.select}
          value={labelFilter}
          onChange={(event) => setLabelFilter(event.target.value)}
        >
          <option value="all">All classes</option>
          <option value="planet">Planet</option>
          <option value="false_positive">False Positive</option>
          <option value="eclipsing_binary">Eclipsing Binary</option>
        </select>

        <select
          style={styles.select}
          value={priorityFilter}
          onChange={(event) => setPriorityFilter(event.target.value)}
        >
          <option value="all">All priorities</option>
          <option value="high">High priority</option>
          <option value="medium">Medium priority</option>
          <option value="low">Low priority</option>
        </select>

        <select
          style={styles.select}
          value={sortMode}
          onChange={(event) => setSortMode(event.target.value as SortMode)}
        >
          <option value="planet_probability_desc">Planet probability ↓</option>
          <option value="planet_probability_asc">Planet probability ↑</option>
          <option value="confidence_desc">Confidence ↓</option>
          <option value="tic_id_asc">TIC ID ↑</option>
        </select>

        <label style={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={candidatesOnly}
            onChange={(event) => setCandidatesOnly(event.target.checked)}
          />
          Candidates only
        </label>

        <button style={styles.exportButton} onClick={exportVisibleRows}>
          Export CSV
        </button>
      </div>

      {loading && <p style={styles.message}>Loading prediction records...</p>}

      {error && <p style={styles.error}>{error}</p>}

      {!loading && !error && (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>TIC ID</th>
                <th style={styles.th}>True Label</th>
                <th style={styles.th}>Predicted</th>
                <th style={styles.th}>Decision</th>
                <th style={styles.th}>Priority</th>
                <th style={styles.th}>Candidate</th>
                <th style={styles.th}>Planet Prob.</th>
                <th style={styles.th}>Confidence</th>
              </tr>
            </thead>

            <tbody>
              {filteredRows.slice(0, 50).map((row, index) => {
                const ticId = getText(row, ["tic_id", "ticId", "TIC_ID", "TIC"]);
                const trueLabel = getText(row, ["true_label", "label", "actual_label"]);
                const predictedLabel = getText(row, [
                  "predicted_label",
                  "prediction",
                ]);
                const decision = getText(row, ["decision"]);
                const priority = getText(row, ["candidate_priority", "priority"]);
                const isCandidate = getBoolean(row, [
                  "is_planet_candidate",
                  "candidate",
                  "planet_candidate",
                ]);
                const planetProbability = getNumber(row, [
                  "planet_probability",
                  "planet_prob",
                ]);
                const confidence = getNumber(row, [
                  "confidence",
                  "model_confidence",
                ]);

                return (
                  <tr key={`${ticId}-${index}`}>
                    <td style={styles.td}>
                      <strong>{ticId}</strong>
                    </td>
                    <td style={styles.td}>{trueLabel}</td>
                    <td style={styles.td}>{predictedLabel}</td>
                    <td style={styles.td}>{decision}</td>
                    <td style={styles.td}>
                      <span style={getPriorityStyle(priority)}>{priority}</span>
                    </td>
                    <td style={styles.td}>
                      <span
                        style={
                          isCandidate
                            ? styles.candidateYes
                            : styles.candidateNo
                        }
                      >
                        {isCandidate ? "Yes" : "No"}
                      </span>
                    </td>
                    <td style={styles.td}>{formatPercent(planetProbability)}</td>
                    <td style={styles.td}>{formatPercent(confidence)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredRows.length > 50 && (
            <p style={styles.footerNote}>
              Showing first 50 rows. Use filters or CSV export for the full visible set.
            </p>
          )}
        </div>
      )}
    </section>
  );
}

function getPriorityStyle(priority: string): CSSProperties {
  const normalized = priority.toLowerCase();

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
  summaryBox: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: "6px 12px",
    background: "rgba(0,0,0,0.22)",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: "16px",
    padding: "14px",
    minWidth: "230px",
    color: "#cbd5e1",
  },
  controls: {
    display: "grid",
    gridTemplateColumns: "2fr repeat(3, 1fr) auto auto",
    gap: "10px",
    alignItems: "center",
    marginBottom: "16px",
  },
  input: {
    background: "rgba(15,23,42,0.86)",
    color: "#e5edf7",
    border: "1px solid rgba(255,255,255,0.14)",
    borderRadius: "12px",
    padding: "11px 12px",
    outline: "none",
  },
  select: {
    background: "rgba(15,23,42,0.86)",
    color: "#e5edf7",
    border: "1px solid rgba(255,255,255,0.14)",
    borderRadius: "12px",
    padding: "11px 12px",
    outline: "none",
  },
  checkboxLabel: {
    color: "#cbd5e1",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    whiteSpace: "nowrap",
  },
  exportButton: {
    background: "#38bdf8",
    color: "#06111f",
    border: "none",
    borderRadius: "12px",
    padding: "11px 14px",
    fontWeight: 800,
    cursor: "pointer",
    whiteSpace: "nowrap",
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
  tableWrapper: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "940px",
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
  footerNote: {
    color: "#94a3b8",
    fontSize: "13px",
    marginTop: "12px",
  },
};