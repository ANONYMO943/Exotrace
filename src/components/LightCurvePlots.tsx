import type { CSSProperties } from "react";
import { API_BASE_URL } from "../lib/api";

type PlotUrls = {
  normalized?: string;
  detrended?: string;
  phase_folded?: string;
};

export function LightCurvePlots({ plotUrls }: { plotUrls?: PlotUrls }) {
  if (!plotUrls) {
    return null;
  }

  const plots = [
    {
      title: "Normalized Light Curve",
      url: plotUrls.normalized,
    },
    {
      title: "Detrended Light Curve",
      url: plotUrls.detrended,
    },
    {
      title: "Phase-Folded Transit Curve",
      url: plotUrls.phase_folded,
    },
  ].filter((plot) => plot.url);

  if (plots.length === 0) {
    return null;
  }

  return (
    <div style={styles.wrapper}>
      <h3 style={styles.heading}>Light Curve Visualization</h3>

      <div style={styles.grid}>
        {plots.map((plot) => (
          <div key={plot.title} style={styles.card}>
           

            <img
              src={`${API_BASE_URL}${plot.url}`}
              alt={plot.title}
              style={styles.image}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  wrapper: {
    marginTop: "24px",
  },
  heading: {
    marginBottom: "14px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "16px",
  },
  card: {
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "18px",
    padding: "14px",
  },
  title: {
    marginTop: 0,
    marginBottom: "12px",
    color: "#dbeafe",
  },
  image: {
    width: "100%",
    borderRadius: "12px",
    background: "#ffffff",
  },
};