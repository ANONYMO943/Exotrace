from pathlib import Path
import json
import time

import numpy as np
import pandas as pd

from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    precision_score,
    recall_score,
    f1_score,
)

from step13_predict_one_lightcurve import (
    load_model,
    predict_lightcurve,
    convert_to_builtin_types,
)


BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent

DATASET_INDEX = BASE_DIR / "data" / "dataset_index.csv"

RESULTS_DIR = BASE_DIR / "outputs" / "results"
RESULTS_DIR.mkdir(parents=True, exist_ok=True)

FULL_JSON = RESULTS_DIR / "full_predictions.json"
FULL_CSV = RESULTS_DIR / "full_predictions.csv"
SUMMARY_JSON = RESULTS_DIR / "full_prediction_summary.json"
TOP_CANDIDATES_CSV = RESULTS_DIR / "top_planet_candidates.csv"


def safe_float(value):
    if value is None:
        return None

    try:
        if np.isnan(value):
            return None
    except TypeError:
        pass

    return float(value)


def make_flat_row(result):
    features = result.get("features", {})
    probabilities = result.get("class_probabilities", {})

    return {
        "tic_id": result.get("tic_id"),
        "true_label": result.get("true_label"),
        "predicted_label": result.get("predicted_label"),
        "decision": result.get("decision"),
        "is_correct_class": result.get("true_label") == result.get("predicted_label"),

        "is_planet_candidate": result.get("is_planet_candidate"),
        "candidate_priority": result.get("candidate_priority"),
        "planet_threshold": result.get("planet_threshold"),
        "threshold_source": result.get("threshold_source"),

        "confidence": safe_float(result.get("confidence")),
        "planet_probability": safe_float(result.get("planet_probability")),
        "prob_eclipsing_binary": safe_float(probabilities.get("eclipsing_binary")),
        "prob_false_positive": safe_float(probabilities.get("false_positive")),
        "prob_planet": safe_float(probabilities.get("planet")),

        "period_days": safe_float(features.get("period_days")),
        "duration_hours": safe_float(features.get("duration_hours")),
        "depth_percent": safe_float(features.get("depth_percent")),
        "snr": safe_float(features.get("snr")),
        "bls_power": safe_float(features.get("bls_power")),
        "n_points_used": features.get("n_points_used"),
        "n_in_transit_points": features.get("n_in_transit_points"),
        "n_detected_transits": features.get("n_detected_transits"),
        "odd_even_depth_difference": safe_float(features.get("odd_even_depth_difference")),
        "secondary_eclipse_depth": safe_float(features.get("secondary_eclipse_depth")),
        "v_shape_score": safe_float(features.get("v_shape_score")),
        "baseline_days": safe_float(features.get("baseline_days")),
    }


def calculate_summary(report_df):
    y_true = report_df["true_label"]
    y_pred = report_df["predicted_label"]

    labels = ["planet", "false_positive", "eclipsing_binary"]

    accuracy = accuracy_score(y_true, y_pred)

    class_report = classification_report(
        y_true,
        y_pred,
        labels=labels,
        output_dict=True,
        zero_division=0,
    )

    cm = confusion_matrix(
        y_true,
        y_pred,
        labels=labels,
    )

    confusion_matrix_data = {
        "labels": labels,
        "matrix": cm.tolist(),
    }

    true_planet = (report_df["true_label"] == "planet").astype(int)
    predicted_candidate = report_df["is_planet_candidate"].astype(bool).astype(int)

    candidate_precision = precision_score(
        true_planet,
        predicted_candidate,
        zero_division=0,
    )

    candidate_recall = recall_score(
        true_planet,
        predicted_candidate,
        zero_division=0,
    )

    candidate_f1 = f1_score(
        true_planet,
        predicted_candidate,
        zero_division=0,
    )

    candidate_cm = confusion_matrix(
        true_planet,
        predicted_candidate,
        labels=[0, 1],
    )

    tn, fp, fn, tp = candidate_cm.ravel()

    candidate_screening = {
        "meaning": "Binary screening where true planet is positive class and predicted candidate is positive class.",
        "precision": float(candidate_precision),
        "recall": float(candidate_recall),
        "f1": float(candidate_f1),
        "true_positive_planets": int(tp),
        "missed_planets": int(fn),
        "false_planet_alerts": int(fp),
        "true_non_planets": int(tn),
        "candidate_confusion_matrix": {
            "labels": ["not_planet", "planet"],
            "matrix": candidate_cm.tolist(),
        },
    }

    class_counts = report_df["true_label"].value_counts().to_dict()
    predicted_counts = report_df["predicted_label"].value_counts().to_dict()
    candidate_counts = report_df["is_planet_candidate"].value_counts().to_dict()
    priority_counts = report_df["candidate_priority"].value_counts().to_dict()
    decision_counts = report_df["decision"].value_counts().to_dict()

    candidate_df = report_df[report_df["is_planet_candidate"] == True].copy()

    if len(candidate_df) > 0:
        high_priority_candidates = int(
            (candidate_df["candidate_priority"] == "high").sum()
        )
    else:
        high_priority_candidates = 0

    summary = {
        "project": "ExoTrace",
        "purpose": "Full batch prediction report for all dataset light curves",
        "total_predictions": int(len(report_df)),
        "class_counts": class_counts,
        "predicted_label_counts": predicted_counts,
        "candidate_counts": {
            str(key): int(value)
            for key, value in candidate_counts.items()
        },
        "candidate_priority_counts": priority_counts,
        "decision_counts": decision_counts,
        "high_priority_candidate_count": high_priority_candidates,
        "classification_metrics": {
            "accuracy": float(accuracy),
            "classification_report": class_report,
            "confusion_matrix": confusion_matrix_data,
        },
        "candidate_screening_metrics": candidate_screening,
    }

    return summary


def main():
    start_time = time.time()

    if not DATASET_INDEX.exists():
        raise FileNotFoundError(f"dataset_index.csv not found: {DATASET_INDEX}")

    dataset_df = pd.read_csv(DATASET_INDEX)

    print("Loaded dataset index")
    print("--------------------")
    print(f"Total rows: {len(dataset_df)}")
    print("\nClass counts:")
    print(dataset_df["label"].value_counts())

    model, feature_columns, labels, model_name = load_model()

    full_results = []
    flat_rows = []

    print("\nRunning full batch prediction")
    print("-----------------------------")

    for index, row in dataset_df.iterrows():
        tic_id = str(row["tic_id"])
        true_label = str(row["label"])
        file_path = PROJECT_ROOT / row["file_path"]

        print(f"\n[{index + 1}/{len(dataset_df)}] Predicting TIC {tic_id} ({true_label})")

        try:
            result = predict_lightcurve(
                file_path=file_path,
                tic_id=tic_id,
                true_label=true_label,
                model=model,
                feature_columns=feature_columns,
                labels=labels,
                model_name=model_name,
            )

            result = convert_to_builtin_types(result)
            result["batch_status"] = "success"
            result["batch_error"] = None

        except Exception as error:
            print(f"Error for TIC {tic_id}: {error}")

            result = {
                "tic_id": tic_id,
                "true_label": true_label,
                "predicted_label": "error",
                "decision": "Prediction failed",
                "confidence": None,
                "planet_probability": None,
                "class_probabilities": {},
                "model_name": model_name,
                "planet_threshold": None,
                "threshold_source": None,
                "is_planet_candidate": False,
                "candidate_priority": "error",
                "features": {},
                "batch_status": "failed",
                "batch_error": str(error),
            }

        full_results.append(result)
        flat_rows.append(make_flat_row(result))

    report_df = pd.DataFrame(flat_rows)

    report_df.to_csv(FULL_CSV, index=False)

    full_json_data = {
        "project": "ExoTrace",
        "model_name": model_name,
        "total_predictions": len(full_results),
        "results": full_results,
    }

    with open(FULL_JSON, "w") as f:
        json.dump(full_json_data, f, indent=4)

    successful_report_df = report_df[report_df["predicted_label"] != "error"].copy()

    summary = calculate_summary(successful_report_df)
    summary["model_name"] = model_name
    summary["runtime_seconds"] = round(time.time() - start_time, 2)

    with open(SUMMARY_JSON, "w") as f:
        json.dump(summary, f, indent=4)

    top_candidates = successful_report_df[
        successful_report_df["is_planet_candidate"] == True
    ].copy()

    top_candidates = top_candidates.sort_values(
        by=["planet_probability", "confidence", "snr"],
        ascending=False,
    )

    top_candidates.to_csv(TOP_CANDIDATES_CSV, index=False)

    print("\nFull batch prediction files saved")
    print("---------------------------------")
    print(f"CSV: {FULL_CSV}")
    print(f"JSON: {FULL_JSON}")
    print(f"Summary JSON: {SUMMARY_JSON}")
    print(f"Top candidates CSV: {TOP_CANDIDATES_CSV}")

    print("\nFull prediction summary")
    print("-----------------------")
    print(f"Total predictions: {summary['total_predictions']}")
    print(f"Accuracy: {summary['classification_metrics']['accuracy']:.3f}")

    candidate_metrics = summary["candidate_screening_metrics"]

    print("\nCandidate screening metrics")
    print("---------------------------")
    print(f"Precision: {candidate_metrics['precision']:.3f}")
    print(f"Recall: {candidate_metrics['recall']:.3f}")
    print(f"F1: {candidate_metrics['f1']:.3f}")
    print(f"True positive planets: {candidate_metrics['true_positive_planets']}")
    print(f"Missed planets: {candidate_metrics['missed_planets']}")
    print(f"False planet alerts: {candidate_metrics['false_planet_alerts']}")
    print(f"True non-planets: {candidate_metrics['true_non_planets']}")

    print("\nCandidate priority counts")
    print("-------------------------")
    print(summary["candidate_priority_counts"])

    print("\nTop 10 planet candidates")
    print("------------------------")

    display_columns = [
        "tic_id",
        "true_label",
        "predicted_label",
        "decision",
        "candidate_priority",
        "planet_probability",
        "confidence",
        "period_days",
        "depth_percent",
        "snr",
    ]

    print(top_candidates[display_columns].head(10).to_string(index=False))

    print("\nStep 23 completed successfully.")


if __name__ == "__main__":
    main()