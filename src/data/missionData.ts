// Dummy mission data for ExoTrace Transit Detection Dashboard.
// All values are illustrative sample data.

export type ClassProbability = { label: string; value: number };

export const classification = {
  predictedClass: "Exoplanet Transit",
  confidence: 91.4,
  probabilities: [
    { label: "Exoplanet Transit", value: 91.4 },
    { label: "Eclipsing Binary", value: 4.2 },
    { label: "Blend", value: 2.1 },
    { label: "Systematic Artifact", value: 1.8 },
    { label: "Other", value: 0.5 },
  ] as ClassProbability[],
  explanation: [
    "Periodic dip detected at 3.42 days.",
    "Phase-folded curve shows a U-shaped transit.",
    "No strong secondary eclipse detected.",
    "Odd-even transit depths are similar.",
    "SNR is above the high-confidence threshold.",
  ],
};

export const parameters = {
  orbitalPeriod: { label: "Orbital Period", value: "3.42", unit: "days", confidence: 96 },
  transitDuration: { label: "Transit Duration", value: "2.1", unit: "hours", confidence: 92 },
  transitDepth: { label: "Transit Depth", value: "0.45", unit: "%", confidence: 90 },
  snr: { label: "Signal-to-Noise (SNR)", value: "12.8", unit: "σ", confidence: 94 },
  blsPower: { label: "BLS Power", value: "0.83", unit: "", confidence: 89 },
};

export const targetMeta = {
  ticId: "TIC 307210830",
  sector: "Sector 42",
  magnitude: "10.4 Tmag",
  cadence: "120 s",
  status: "Detection Complete",
};

// ---- Synthetic light curve generators (deterministic) ----

function seededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const PERIOD = 3.42;
const DEPTH = 0.0045;
const DURATION_FRAC = 0.026;

function transitFlux(time: number) {
  const phase = ((time % PERIOD) + PERIOD) % PERIOD;
  const center = PERIOD / 2;
  const half = (DURATION_FRAC * PERIOD) / 2;
  const dist = Math.abs(phase - center);
  if (dist > half) return 1;
  // U-shaped (rounded) bottom
  const x = dist / half;
  return 1 - DEPTH * (1 - x * x * 0.55);
}

export type CurvePoint = { time: number; raw: number; cleaned: number; detrended: number };

export function generateLightCurve(points = 240): CurvePoint[] {
  const rand = seededRandom(42);
  const data: CurvePoint[] = [];
  for (let i = 0; i < points; i++) {
    const time = (i / points) * 13.7;
    const noise = (rand() - 0.5) * 0.004;
    const trend = 0.006 * Math.sin(time * 0.45) + 0.003 * Math.cos(time * 0.2);
    const base = transitFlux(time);
    const raw = base + noise + trend + 0.002 * (rand() - 0.5);
    const cleaned = base + noise * 0.45 + trend;
    const detrended = base + noise * 0.4;
    data.push({
      time: Number(time.toFixed(3)),
      raw: Number((raw * 100).toFixed(4)),
      cleaned: Number((cleaned * 100).toFixed(4)),
      detrended: Number((detrended * 100).toFixed(4)),
    });
  }
  return data;
}

export type PeriodogramPoint = { period: number; power: number };

export function generatePeriodogram(points = 200): PeriodogramPoint[] {
  const rand = seededRandom(7);
  const data: PeriodogramPoint[] = [];
  for (let i = 0; i < points; i++) {
    const period = 0.5 + (i / points) * 9.5;
    const peak = 0.83 * Math.exp(-Math.pow((period - PERIOD) / 0.12, 2));
    const harmonic = 0.32 * Math.exp(-Math.pow((period - PERIOD * 2) / 0.18, 2));
    const sub = 0.28 * Math.exp(-Math.pow((period - PERIOD / 2) / 0.1, 2));
    const floorNoise = 0.04 + rand() * 0.06;
    data.push({
      period: Number(period.toFixed(3)),
      power: Number(Math.min(0.9, peak + harmonic + sub + floorNoise).toFixed(4)),
    });
  }
  return data;
}

export type PhasePoint = { phase: number; flux: number; model: number };

export function generatePhaseFold(points = 220): PhasePoint[] {
  const rand = seededRandom(99);
  const data: PhasePoint[] = [];
  for (let i = 0; i < points; i++) {
    const phase = -0.5 + (i / points);
    const half = DURATION_FRAC * 3;
    const dist = Math.abs(phase);
    let model = 100;
    if (dist <= half) {
      const x = dist / half;
      model = 100 - DEPTH * 100 * (1 - x * x * 0.55);
    }
    const flux = model + (rand() - 0.5) * 0.18;
    data.push({
      phase: Number(phase.toFixed(4)),
      flux: Number(flux.toFixed(4)),
      model: Number(model.toFixed(4)),
    });
  }
  return data;
}

export const pipelineSteps = [
  { id: "upload", title: "Data Ingestion", desc: "Light curve loaded & validated", status: "complete" as const },
  { id: "preprocessing", title: "Preprocessing", desc: "Outliers removed, flux detrended", status: "complete" as const },
  { id: "detection", title: "Transit Search", desc: "BLS periodogram computed", status: "complete" as const },
  { id: "phase-folding", title: "Phase Folding", desc: "Folded on best period", status: "complete" as const },
  { id: "classification", title: "AI Classification", desc: "Neural vetting model", status: "complete" as const },
  { id: "parameters", title: "Parameter Estimation", desc: "Orbital solution fit", status: "complete" as const },
  { id: "report", title: "Report Export", desc: "Mission report ready", status: "ready" as const },
];
