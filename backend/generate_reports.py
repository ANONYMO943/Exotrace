"""
generate_reports.py
Generates the report files needed by the ExoTrace API backend.
Runs the trained model on the precomputed features.csv (no light curve files needed).
"""
from pathlib import Path
import json
import time
import sys
import math

import numpy as np
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent

FEATURES_FILE = BASE_DIR / "data" / "features.csv"
MODEL_FILE = BASE_DIR / "models" / "best_exotrace_classifier.joblib"
THRESHOLD_FILE = BASE_DIR / "models" / "planet_threshold.json"

RESULTS_DIR = BASE_DIR / "outputs" / "results"
RESULTS_DIR.mkdir(parents=True, exist_ok=True)

FULL_CSV = RESULTS_DIR / "full_predictions.csv"
SUMMARY_JSON = RESULTS_DIR / "full_prediction_summary.json"
TOP_CANDIDATES_CSV = RESULTS_DIR / "top_planet_candidates.csv"

sys.path.insert(0, str(BASE_DIR))


def safe_float(v):
    if v is None:
        return None
    try:
        f = float(v)
        if math.isnan(f) or math.isinf(f):
            return None
        return f
    except (TypeError, ValueError):
        return None


def make_candidate_decision(predicted_label, planet_probability, threshold):
    is_planet_candidate = planet_probability >= threshold

    if planet_probability >= 0.60:
        decision = "Strong planet candidate"
        priority = "high"
    elif is_planet_candidate:
        decision = "Possible planet candidate"
        priority = "medium"
    elif predicted_label == "eclipsing_binary":
        decision = "Likely eclipsing binary"
        priority = "low"
    elif predicted_label == "false_positive":
        decision = "Likely false positive"
        priority = "low"
    else:
        decision = "Uncertain"
        priority = "review"

    return decision, is_planet_candidate, priority


def main():
    import joblib
    from sklearn.metrics import (
        accuracy_score, confusion_matrix,
        precision_score, recall_score, f1_score,
    )

    print("Loading features...")
    features_df = pd.read_csv(FEATURES_FILE)
    print(f"Loaded {len(features_df)} rows from features.csv")

    print("Loading model...")
    bundle = joblib.load(MODEL_FILE)
    model = bundle["model"]
    feature_columns = bundle["feature_columns"]
    model_name = bundle.get("model_name", "ExtraTrees")

    print("Loading planet threshold...")
    with open(THRESHOLD_FILE) as f:
        threshold_data = json.load(f)
    planet_threshold = float(threshold_data.get("selected_threshold", 0.20))
    print(f"Planet threshold: {planet_threshold}")

    print("Running predictions on feature data...")
    X = features_df[[col for col in feature_columns if col in features_df.columns]].copy()

    # Fill missing feature columns with 0
    for col in feature_columns:
        if col not in X.columns:
            X[col] = 0.0
    X = X[feature_columns]
    X = X.fillna(0.0)

    predicted_labels = model.predict(X)
    probabilities_array = model.predict_proba(X)
    class_order = list(model.classes_)

    rows = []
    for i, (_, feat_row) in enumerate(features_df.iterrows()):
        tic_id = str(feat_row["tic_id"])
        true_label = str(feat_row["label"])
        predicted_label = str(predicted_labels[i])

        proba = {cls: float(probabilities_array[i][j]) for j, cls in enumerate(class_order)}
        planet_prob = float(proba.get("planet", 0.0))
        confidence = float(max(proba.values()))

        decision, is_candidate, priority = make_candidate_decision(
            predicted_label, planet_prob, planet_threshold
        )

        rows.append({
            "tic_id": tic_id,
            "true_label": true_label,
            "predicted_label": predicted_label,
            "decision": decision,
            "is_correct_class": true_label == predicted_label,
            "is_planet_candidate": is_candidate,
            "candidate_priority": priority,
            "planet_threshold": planet_threshold,
            "threshold_source": "optimized",
            "confidence": confidence,
            "planet_probability": planet_prob,
            "prob_eclipsing_binary": safe_float(proba.get("eclipsing_binary")),
            "prob_false_positive": safe_float(proba.get("false_positive")),
            "prob_planet": safe_float(proba.get("planet")),
            "period_days": safe_float(feat_row.get("period_days")),
            "duration_hours": safe_float(feat_row.get("duration_hours")),
            "depth_percent": safe_float(feat_row.get("depth_percent")),
            "snr": safe_float(feat_row.get("snr")),
            "bls_power": safe_float(feat_row.get("bls_power")),
            "n_points_used": feat_row.get("n_points_used"),
            "n_in_transit_points": feat_row.get("n_in_transit_points"),
            "n_detected_transits": feat_row.get("n_detected_transits"),
            "odd_even_depth_difference": safe_float(feat_row.get("odd_even_depth_difference")),
            "secondary_eclipse_depth": safe_float(feat_row.get("secondary_eclipse_depth")),
            "v_shape_score": safe_float(feat_row.get("v_shape_score")),
            "baseline_days": safe_float(feat_row.get("baseline_days")),
        })

    report_df = pd.DataFrame(rows)
    report_df.to_csv(FULL_CSV, index=False)
    print(f"Saved full predictions CSV: {FULL_CSV}")

    # Compute summary metrics
    y_true = report_df["true_label"]
    y_pred = report_df["predicted_label"]
    labels = ["planet", "false_positive", "eclipsing_binary"]

    accuracy = accuracy_score(y_true, y_pred)
    cm = confusion_matrix(y_true, y_pred, labels=labels)

    true_planet = (report_df["true_label"] == "planet").astype(int)
    predicted_candidate = report_df["is_planet_candidate"].astype(bool).astype(int)

    cand_precision = precision_score(true_planet, predicted_candidate, zero_division=0)
    cand_recall = recall_score(true_planet, predicted_candidate, zero_division=0)
    cand_f1 = f1_score(true_planet, predicted_candidate, zero_division=0)
    cand_cm = confusion_matrix(true_planet, predicted_candidate, labels=[0, 1])
    tn, fp, fn, tp = cand_cm.ravel()

    candidate_df = report_df[report_df["is_planet_candidate"] == True]
    high_priority_count = int((candidate_df["candidate_priority"] == "high").sum())

    summary = {
        "project": "ExoTrace",
        "purpose": "Full batch prediction report for all dataset light curves",
        "total_predictions": int(len(report_df)),
        "class_counts": {k: int(v) for k, v in report_df["true_label"].value_counts().to_dict().items()},
        "predicted_label_counts": {k: int(v) for k, v in report_df["predicted_label"].value_counts().to_dict().items()},
        "candidate_counts": {str(k): int(v) for k, v in report_df["is_planet_candidate"].value_counts().to_dict().items()},
        "candidate_priority_counts": {k: int(v) for k, v in report_df["candidate_priority"].value_counts().to_dict().items()},
        "decision_counts": {k: int(v) for k, v in report_df["decision"].value_counts().to_dict().items()},
        "high_priority_candidate_count": high_priority_count,
        "classification_metrics": {
            "accuracy": float(accuracy),
            "classification_report": {},
            "confusion_matrix": {
                "labels": labels,
                "matrix": cm.tolist(),
            },
        },
        "candidate_screening_metrics": {
            "meaning": "Binary screening: true planet is positive class, predicted candidate is positive.",
            "precision": float(cand_precision),
            "recall": float(cand_recall),
            "f1": float(cand_f1),
            "true_positive_planets": int(tp),
            "missed_planets": int(fn),
            "false_planet_alerts": int(fp),
            "true_non_planets": int(tn),
            "candidate_confusion_matrix": {
                "labels": ["not_planet", "planet"],
                "matrix": cand_cm.tolist(),
            },
        },
        "model_name": model_name,
        "runtime_seconds": 0.0,
    }

    with open(SUMMARY_JSON, "w") as f:
        json.dump(summary, f, indent=4)
    print(f"Saved summary JSON: {SUMMARY_JSON}")

    top_candidates = report_df[report_df["is_planet_candidate"] == True].copy()
    top_candidates = top_candidates.sort_values(
        by=["planet_probability", "confidence", "snr"],
        ascending=False,
    )
    top_candidates.to_csv(TOP_CANDIDATES_CSV, index=False)
    print(f"Saved top candidates CSV: {TOP_CANDIDATES_CSV}")

    print("\n=== RESULTS ===")
    print(f"Total predictions: {len(report_df)}")
    print(f"Accuracy: {accuracy:.3f}")
    print(f"Candidate recall: {cand_recall:.3f}")
    print(f"Candidate precision: {cand_precision:.3f}")
    print(f"True positive planets: {tp}")
    print(f"Missed planets: {fn}")
    print(f"False planet alerts: {fp}")
    print(f"High priority candidates: {high_priority_count}")
    print("\nDone! All report files generated.")


if __name__ == "__main__":
    main()
