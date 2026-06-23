import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { API_BASE_URL } from "../lib/api";

type HealthResponse = {
  status?: string;
  backend?: string;
  model_available?: boolean;
  planet_threshold_available?: boolean;
  dataset_index_available?: boolean;
  full_report_available?: boolean;
  top_candidates_available?: boolean;
};

export function BackendHealthPanel() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function checkHealth() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE_URL}/api/health`);

      if (!response.ok) {
        throw new Error(`Backend returned ${response.status}`);
      }

      const data = (await response.json()) as HealthResponse;
      setHealth(data);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to connect to backend.";

      setHealth(null);
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    checkHealth();
  }, []);

  const isOnline = health?.status === "ok";

  return (
    <section id="backend-health" style={styles.panel}>
      <div style={styles.headerRow}>
        <div>
          <p style={styles.eyebrow}>System Status</p>
          <h2 style={styles.title}>Backend Health Check</h2>
          <p style={styles.subtitle}>
            Confirms that the API, model, threshold, dataset, and reports are ready.
          </p>
        </div>

        <button style={styles.refreshButton} onClick={checkHealth}>
          {loading ? "Checking..." : "Retry Check"}
        </button>
      </div>

      <div
        style={{
          ...styles.statusBanner,
          ...(isOnline ? styles.statusOnline : styles.statusOffline),
        }}
      >
        <span style={styles.statusDot}></span>

        <div>
          <strong>
            {loading
              ? "Checking backend..."
              : isOnline
              ? "Backend connected"
              : "Backend not connected"}
          </strong>

          <p style={styles.statusText}>
            {error
              ? `Error: ${error}`
              : isOnline
              ? `FastAPI backend is running at ${API_BASE_URL}`
              : "Start the backend server and retry."}
          </p>
        </div>
      </div>

      <div style={styles.checkGrid}>
        <CheckItem
          label="FastAPI Status"
          value={health?.status === "ok"}
          loading={loading}
        />
        <CheckItem
          label="Model File"
          value={health?.model_available}
          loading={loading}
        />
        <CheckItem
          label="Planet Threshold"
          value={health?.planet_threshold_available}
          loading={loading}
        />
        <CheckItem
          label="Dataset Index"
          value={health?.dataset_index_available}
          loading={loading}
        />
        <CheckItem
          label="Full Report"
          value={health?.full_report_available}
          loading={loading}
        />
        <CheckItem
          label="Top Candidates"
          value={health?.top_candidates_available}
          loading={loading}
        />
      </div>

      {!isOnline && !loading && (
        <div style={styles.helpBox}>
          <strong>Start backend with:</strong>

          <code style={styles.codeBlock}>
            python -m uvicorn backend.api_server:app --reload --host 127.0.0.1 --port 8000
          </code>
        </div>
      )}
    </section>
  );
}

function CheckItem({
  label,
  value,
  loading,
}: {
  label: string;
  value?: boolean;
  loading: boolean;
}) {
  const ready = Boolean(value);

  return (
    <div style={styles.checkItem}>
      <span
        style={{
          ...styles.checkIcon,
          ...(loading
            ? styles.checkLoading
            : ready
            ? styles.checkOk
            : styles.checkBad),
        }}
      >
        {loading ? "…" : ready ? "✓" : "!"}
      </span>

      <div>
        <strong>{label}</strong>
        <p>
          {loading ? "Checking" : ready ? "Ready" : "Missing or unavailable"}
        </p>
      </div>
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
  refreshButton: {
    background: "#38bdf8",
    color: "#06111f",
    border: "none",
    borderRadius: "12px",
    padding: "11px 14px",
    fontWeight: 800,
    cursor: "pointer",
  },
  statusBanner: {
    display: "flex",
    gap: "12px",
    alignItems: "flex-start",
    borderRadius: "16px",
    padding: "14px",
    marginBottom: "14px",
    border: "1px solid rgba(255,255,255,0.12)",
  },
  statusOnline: {
    background: "rgba(34,197,94,0.12)",
    color: "#bbf7d0",
    borderColor: "rgba(34,197,94,0.28)",
  },
  statusOffline: {
    background: "rgba(248,113,113,0.12)",
    color: "#fecaca",
    borderColor: "rgba(248,113,113,0.28)",
  },
  statusDot: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    background: "currentColor",
    marginTop: "4px",
  },
  statusText: {
    margin: "4px 0 0 0",
    lineHeight: 1.5,
  },
  checkGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
    gap: "10px",
  },
  checkItem: {
    display: "flex",
    gap: "10px",
    alignItems: "flex-start",
    background: "rgba(15,23,42,0.62)",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: "14px",
    padding: "12px",
  },
  checkIcon: {
    width: "26px",
    height: "26px",
    borderRadius: "50%",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 900,
    flexShrink: 0,
  },
  checkOk: {
    background: "rgba(34,197,94,0.18)",
    color: "#bbf7d0",
    border: "1px solid rgba(34,197,94,0.30)",
  },
  checkBad: {
    background: "rgba(248,113,113,0.18)",
    color: "#fecaca",
    border: "1px solid rgba(248,113,113,0.35)",
  },
  checkLoading: {
    background: "rgba(148,163,184,0.18)",
    color: "#cbd5e1",
    border: "1px solid rgba(148,163,184,0.25)",
  },
  helpBox: {
    marginTop: "14px",
    background: "rgba(251,191,36,0.10)",
    border: "1px solid rgba(251,191,36,0.25)",
    color: "#fde68a",
    borderRadius: "14px",
    padding: "13px",
    lineHeight: 1.5,
  },
  codeBlock: {
    display: "block",
    marginTop: "8px",
    background: "rgba(0,0,0,0.30)",
    borderRadius: "10px",
    padding: "10px",
    color: "#fef3c7",
    overflowX: "auto",
  },
};