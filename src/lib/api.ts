const rawBaseUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
export const API_BASE_URL = rawBaseUrl.endsWith("/") ? rawBaseUrl.slice(0, -1) : rawBaseUrl;

export type ClassCounts = {
  planet: number;
  false_positive: number;
  eclipsing_binary: number;
};

export type SummaryResponse = {
  project: string;
  description: string;
  dataset: {
    total_lightcurves: number;
    class_counts: ClassCounts;
  };
  pipeline: string[];
  model: {
    name: string;
    accuracy: number;
    macro_f1: number;
    planet_recall: number;
    false_positive_recall: number;
    eclipsing_binary_recall: number;
  };
  candidate_screening?: {
    optimized_threshold: number;
    purpose: string;
  };
};

export type Target = {
  tic_id: string | number;
  label: string;
  file_path: string;
};

export type TargetsResponse = {
  total_targets?: number;
  total?: number;
  class_counts?: Record<string, number>;
  limit: number;
  targets: Target[];
};

export type PredictionFeatures = {
  period_days: number;
  duration_days: number;
  duration_hours: number;
  transit_time: number;
  depth: number;
  depth_percent: number;
  snr: number;
  bls_power: number;
  n_points_used: number;
  n_in_transit_points: number;
  n_detected_transits: number;
  odd_even_depth_difference: number;
  secondary_eclipse_depth: number;
  v_shape_score: number | null;
  baseline_days: number;
  period_search_min_days: number;
  period_search_max_days: number;
};

export type PlotUrls = {
  normalized?: string;
  detrended?: string;
  phase_folded?: string;
};

export type PredictionResult = {
  tic_id: string;
  true_label: string;
  predicted_label: string;
  decision: string;
  confidence: number;
  planet_probability: number;

  planet_threshold?: number;
  threshold_source?: string;
  is_planet_candidate?: boolean;
  candidate_priority?: string;

  class_probabilities: Record<string, number>;
  model_name: string;
  features: PredictionFeatures;
  plot_urls?: PlotUrls;
};

export type PredictionResponse = {
  status: string;
  result_file: string;
  result: PredictionResult;
};

export type FullReportSummary = {
  project: string;
  purpose: string;
  total_predictions: number;
  class_counts: Record<string, number>;
  predicted_label_counts: Record<string, number>;
  candidate_counts: Record<string, number>;
  candidate_priority_counts: Record<string, number>;
  decision_counts: Record<string, number>;
  high_priority_candidate_count: number;
  classification_metrics: {
    accuracy: number;
    classification_report: Record<string, unknown>;
    confusion_matrix: {
      labels: string[];
      matrix: number[][];
    };
  };
  candidate_screening_metrics: {
    meaning: string;
    precision: number;
    recall: number;
    f1: number;
    true_positive_planets: number;
    missed_planets: number;
    false_planet_alerts: number;
    true_non_planets: number;
    candidate_confusion_matrix: {
      labels: string[];
      matrix: number[][];
    };
  };
  model_name: string;
  runtime_seconds: number;
};

export type FullReportSummaryResponse = {
  status: string;
  source_file: string;
  summary: FullReportSummary;
};

export type CandidateRecord = {
  tic_id: string | number;
  true_label: string;
  predicted_label: string;
  decision: string;
  is_correct_class?: boolean;
  is_planet_candidate: boolean;
  candidate_priority: string;
  planet_threshold: number;
  threshold_source?: string;
  confidence: number;
  planet_probability: number;
  prob_eclipsing_binary?: number;
  prob_false_positive?: number;
  prob_planet?: number;
  period_days: number;
  duration_hours: number;
  depth_percent: number;
  snr: number;
  bls_power: number;
  n_detected_transits: number;
  n_points_used?: number;
  n_in_transit_points?: number;
  odd_even_depth_difference?: number;
  secondary_eclipse_depth?: number;
  v_shape_score?: number | null;
  baseline_days?: number;
};

export type TopCandidatesResponse = {
  status: string;
  source_file: string;
  limit: number;
  total_candidates: number;
  candidates: CandidateRecord[];
};

export type FullPredictionsResponse = {
  status: string;
  source_file: string;
  limit: number;
  label_filter: string | null;
  candidates_only: boolean;
  total_matching: number;
  predictions: CandidateRecord[];
};

async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error ${response.status}: ${errorText}`);
  }

  return response.json();
}

export function getSummary() {
  return apiGet<SummaryResponse>("/api/summary");
}

export function getTargets(limit = 20) {
  return apiGet<TargetsResponse>(`/api/targets?limit=${limit}`);
}

export function getTargetsByLabel(label: string, limit = 20) {
  return apiGet<TargetsResponse>(`/api/targets/${label}?limit=${limit}`);
}

export function predictByTic(ticId: string | number) {
  return apiGet<PredictionResponse>(`/api/predict/${ticId}`);
}

export function getFullReportSummary() {
  return apiGet<FullReportSummaryResponse>("/api/report/summary");
}

export function getTopCandidates(limit = 10) {
  return apiGet<TopCandidatesResponse>(
    `/api/report/top-candidates?limit=${limit}`
  );
}

export function getFullPredictions(
  limit = 50,
  label?: string,
  candidatesOnly = false
) {
  const params = new URLSearchParams();

  params.set("limit", String(limit));

  if (label) {
    params.set("label", label);
  }

  if (candidatesOnly) {
    params.set("candidates_only", "true");
  }

  return apiGet<FullPredictionsResponse>(
    `/api/report/full-predictions?${params.toString()}`
  );
}