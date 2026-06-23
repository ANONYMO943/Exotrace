from pathlib import Path
import json

import pandas as pd

from step13_predict_one_lightcurve import (
    load_model,
    predict_lightcurve,
    convert_to_builtin_types,
)

from step18_plot_utils import generate_prediction_plots


BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent

DATASET_INDEX = BASE_DIR / "data" / "dataset_index.csv"

RESULTS_DIR = BASE_DIR / "outputs" / "results"
RESULTS_DIR.mkdir(parents=True, exist_ok=True)

DEMO_JSON = RESULTS_DIR / "demo_predictions.json"
DEMO_CSV = RESULTS_DIR / "demo_predictions.csv"

DEMO_CLASSES = [
    "planet",
    "false_positive",
    "eclipsing_binary",
]


def score_demo_result(result, expected_label):
    """
    Selects a strong example for demo display.
    This is only for demo sample selection, not final evaluation.
    """

    probabilities = result.get("class_probabilities", {})

    planet_probability = result.get("planet_probability", 0.0)
    confidence = result.get("confidence", 0.0) or 0.0
    predicted_label = result.get("predicted_label")
    is_planet_candidate = result.get("is_planet_candidate", False)

    if expected_label == "planet":
        score = planet_probability

        if is_planet_candidate:
            score += 0.50

        if predicted_label == "planet":
            score += 0.30

        return score

    if expected_label == "false_positive":
        score = probabilities.get("false_positive", 0.0)

        if predicted_label == "false_positive":
            score += 0.40

        if not is_planet_candidate:
            score += 0.20

        score += confidence * 0.10

        return score

    if expected_label == "eclipsing_binary":
        score = probabilities.get("eclipsing_binary", 0.0)

        if predicted_label == "eclipsing_binary":
            score += 0.40

        if not is_planet_candidate:
            score += 0.20

        score += confidence * 0.10

        return score

    return confidence


def run_prediction_for_row(row, model, feature_columns, labels, model_name):
    tic_id = str(row["tic_id"])
    true_label = str(row["label"])
    file_path = PROJECT_ROOT / row["file_path"]

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

    plot_files = generate_prediction_plots(
        file_path=file_path,
        tic_id=result["tic_id"],
        true_label=result["true_label"],
        features=result["features"],
    )

    result["plot_urls"] = {
        name: f"/static/plots/{path.name}"
        for name, path in plot_files.items()
    }

    return result


def select_best_demo_for_class(df, expected_label, model, feature_columns, labels, model_name):
    class_df = df[df["label"] == expected_label].copy()

    if len(class_df) == 0:
        raise ValueError(f"No examples found for class: {expected_label}")

    print("\nSearching demo example for class:")
    print(expected_label)
    print("--------------------------------")

    candidates = []

    # Scan first 20 examples from each class to find a strong demo example.
    for _, row in class_df.head(20).iterrows():
        result = run_prediction_for_row(
            row=row,
            model=model,
            feature_columns=feature_columns,
            labels=labels,
            model_name=model_name,
        )

        demo_score = score_demo_result(result, expected_label)
        result["demo_score"] = float(demo_score)

        candidates.append(result)

        print(
            f"TIC {result['tic_id']} | "
            f"true={result['true_label']} | "
            f"pred={result['predicted_label']} | "
            f"planet_prob={result['planet_probability']:.3f} | "
            f"candidate={result.get('is_planet_candidate')} | "
            f"score={demo_score:.3f}"
        )

    candidates = sorted(
        candidates,
        key=lambda item: item["demo_score"],
        reverse=True,
    )

    best = candidates[0]

    print("\nSelected demo example:")
    print(
        f"TIC {best['tic_id']} | "
        f"true={best['true_label']} | "
        f"pred={best['predicted_label']} | "
        f"decision={best['decision']} | "
        f"score={best['demo_score']:.3f}"
    )

    return best


def make_demo_csv_rows(results):
    rows = []

    for result in results:
        features = result["features"]

        row = {
            "tic_id": result["tic_id"],
            "true_label": result["true_label"],
            "predicted_label": result["predicted_label"],
            "decision": result["decision"],
            "is_planet_candidate": result.get("is_planet_candidate"),
            "candidate_priority": result.get("candidate_priority"),
            "planet_probability": result.get("planet_probability"),
            "planet_threshold": result.get("planet_threshold"),
            "confidence": result.get("confidence"),
            "period_days": features.get("period_days"),
            "duration_hours": features.get("duration_hours"),
            "depth_percent": features.get("depth_percent"),
            "snr": features.get("snr"),
            "bls_power": features.get("bls_power"),
            "n_detected_transits": features.get("n_detected_transits"),
            "normalized_plot": result.get("plot_urls", {}).get("normalized"),
            "detrended_plot": result.get("plot_urls", {}).get("detrended"),
            "phase_folded_plot": result.get("plot_urls", {}).get("phase_folded"),
        }

        rows.append(row)

    return rows


def main():
    if not DATASET_INDEX.exists():
        raise FileNotFoundError(f"dataset_index.csv not found: {DATASET_INDEX}")

    df = pd.read_csv(DATASET_INDEX)

    print("Loaded dataset index")
    print("--------------------")
    print(f"Total rows: {len(df)}")
    print("\nClass counts:")
    print(df["label"].value_counts())

    model, feature_columns, labels, model_name = load_model()

    demo_results = []

    for expected_label in DEMO_CLASSES:
        best_result = select_best_demo_for_class(
            df=df,
            expected_label=expected_label,
            model=model,
            feature_columns=feature_columns,
            labels=labels,
            model_name=model_name,
        )

        demo_results.append(best_result)

    demo_data = {
        "project": "ExoTrace",
        "purpose": "Representative demo predictions from each class",
        "model_name": model_name,
        "demo_count": len(demo_results),
        "results": demo_results,
    }

    with open(DEMO_JSON, "w") as f:
        json.dump(demo_data, f, indent=4)

    csv_rows = make_demo_csv_rows(demo_results)
    pd.DataFrame(csv_rows).to_csv(DEMO_CSV, index=False)

    print("\nDemo prediction files saved")
    print("---------------------------")
    print(f"JSON: {DEMO_JSON}")
    print(f"CSV: {DEMO_CSV}")

    print("\nFinal selected demo targets:")
    print("----------------------------")

    for result in demo_results:
        print(
            f"TIC {result['tic_id']} | "
            f"true={result['true_label']} | "
            f"pred={result['predicted_label']} | "
            f"decision={result['decision']} | "
            f"planet_prob={result['planet_probability']:.3f} | "
            f"candidate={result.get('is_planet_candidate')} | "
            f"priority={result.get('candidate_priority')}"
        )

    print("\nStep 22 completed successfully.")


if __name__ == "__main__":
    main()