import { useEffect, useState } from "react";
import { getSummary, getTargets, predictByTic, SummaryResponse, Target, PredictionResult } from "../lib/api";

export function ApiConnectionTest() {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [targets, setTargets] = useState<Target[]>([]);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [selectedTic, setSelectedTic] = useState("146172354");
  const [error, setError] = useState<string | null>(null);

  async function loadDashboardData() {
    try {
      setLoading(true);
      setError(null);

      const summaryData = await getSummary();
      const targetsData = await getTargets(10);

      setSummary(summaryData);
      setTargets(targetsData.targets);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown API error");
    } finally {
      setLoading(false);
    }
  }

  async function runPrediction() {
    try {
      setLoading(true);
      setError(null);

      const predictionData = await predictByTic(selectedTic);

      setPrediction(predictionData.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown prediction error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboardData();
  }, []);

  return (
    <div style={{ padding: "24px", fontFamily: "Arial, sans-serif" }}>
      <h1>ExoTrace API Connection Test</h1>

      {loading && <p>Loading from backend...</p>}

      {error && (
        <div style={{ padding: "12px", border: "1px solid red", color: "red", marginBottom: "16px" }}>
          {error}
        </div>
      )}

      {summary && (
        <section style={{ marginBottom: "24px" }}>
          <h2>Project Summary</h2>
          <p><strong>Project:</strong> {summary.project}</p>
          <p><strong>Total light curves:</strong> {summary.dataset.total_lightcurves}</p>
          <p><strong>Model:</strong> {summary.model.name}</p>
          <p><strong>Accuracy:</strong> {(summary.model.accuracy * 100).toFixed(1)}%</p>
          <p><strong>Macro F1:</strong> {(summary.model.macro_f1 * 100).toFixed(1)}%</p>

          <h3>Class Counts</h3>
          <ul>
            <li>Planet: {summary.dataset.class_counts.planet}</li>
            <li>False Positive: {summary.dataset.class_counts.false_positive}</li>
            <li>Eclipsing Binary: {summary.dataset.class_counts.eclipsing_binary}</li>
          </ul>
        </section>
      )}

      <section style={{ marginBottom: "24px" }}>
        <h2>Available Targets</h2>

        {targets.length === 0 ? (
          <p>No targets loaded.</p>
        ) : (
          <table border={1} cellPadding={8}>
            <thead>
              <tr>
                <th>TIC ID</th>
                <th>Label</th>
              </tr>
            </thead>
            <tbody>
              {targets.map((target) => (
                <tr key={`${target.tic_id}-${target.label}`}>
                  <td>{target.tic_id}</td>
                  <td>{target.label}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section style={{ marginBottom: "24px" }}>
        <h2>Run Prediction</h2>

        <input
          value={selectedTic}
          onChange={(event) => setSelectedTic(event.target.value)}
          placeholder="Enter TIC ID"
          style={{ padding: "8px", marginRight: "8px" }}
        />

        <button onClick={runPrediction} disabled={loading} style={{ padding: "8px 12px" }}>
          Predict
        </button>
      </section>

      {prediction && (
        <section style={{ padding: "16px", border: "1px solid #ccc", borderRadius: "8px" }}>
          <h2>Prediction Result</h2>

          <p><strong>TIC ID:</strong> {prediction.tic_id}</p>
          <p><strong>True Label:</strong> {prediction.true_label}</p>
          <p><strong>Predicted Label:</strong> {prediction.predicted_label}</p>
          <p><strong>Decision:</strong> {prediction.decision}</p>
          <p><strong>Confidence:</strong> {(prediction.confidence * 100).toFixed(1)}%</p>
          <p><strong>Planet Probability:</strong> {(prediction.planet_probability * 100).toFixed(1)}%</p>

          <h3>Transit Features</h3>
          <ul>
            <li>Period: {prediction.features.period_days.toFixed(4)} days</li>
            <li>Duration: {prediction.features.duration_hours.toFixed(2)} hours</li>
            <li>Depth: {prediction.features.depth_percent.toFixed(4)}%</li>
            <li>SNR: {prediction.features.snr.toFixed(2)}</li>
            <li>BLS Power: {prediction.features.bls_power.toFixed(4)}</li>
          </ul>

          <h3>Class Probabilities</h3>
          <ul>
            {Object.entries(prediction.class_probabilities).map(([label, probability]) => (
              <li key={label}>
                {label}: {(probability * 100).toFixed(1)}%
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}