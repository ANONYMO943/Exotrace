from pathlib import Path
import argparse
import json

import joblib
import numpy as np
import pandas as pd

from step8_extract_features_batch import (
    clean_and_detrend_lightcurve,
    run_bls_and_extract_features,
)


BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent

DATASET_INDEX = BASE_DIR / "data" / "dataset_index.csv"
MODEL_FILE = BASE_DIR / "models" / "best_exotrace_classifier.joblib"
THRESHOLD_FILE = BASE_DIR / "models" / "planet_threshold.json"
RESULTS_DIR = BASE_DIR / "outputs" / "results"

RESULTS_DIR.mkdir(parents=True, exist_ok=True)


def convert_to_builtin_types(obj):
    """
    Converts numpy types into normal Python types for JSON saving.
    """
    if isinstance(obj, dict):
        return {key: convert_to_builtin_types(value) for key, value in obj.items()}

    if isinstance(obj, list):
        return [convert_to_builtin_types(value) for value in obj]

    if isinstance(obj, np.integer):
        return int(obj)

    if isinstance(obj, np.floating):
        return float(obj)

    if isinstance(obj, np.ndarray):
        return obj.tolist()

    return obj


def load_model():
    if not MODEL_FILE.exists():
        raise FileNotFoundError(
            f"Best model not found: {MODEL_FILE}. Run Step 12 first."
        )

    model_bundle = joblib.load(MODEL_FILE)

    model = model_bundle["model"]
    feature_columns = model_bundle["feature_columns"]
    labels = model_bundle["labels"]
    model_name = model_bundle.get("model_name", "unknown")

    print("Loaded model:")
    print(f"Model name: {model_name}")
    print(f"Labels: {labels}")

    return model, feature_columns, labels, model_name


def load_planet_threshold():
    """
    Loads optimized planet probability threshold.
    If file does not exist, fallback threshold is 0.40.
    """
    if not THRESHOLD_FILE.exists():
        return {
            "selected_threshold": 0.40,
            "source": "fallback",
            "note": "planet_threshold.json not found. Using fallback threshold.",
        }

    with open(THRESHOLD_FILE, "r") as f:
        threshold_data = json.load(f)

    threshold_data["source"] = "optimized"

    return threshold_data


def get_lightcurve_from_dataset(tic_id=None):
    """
    Loads one light curve path from dataset_index.csv.
    If tic_id is given, it selects that TIC.
    Otherwise, it selects the first row.
    """
    if not DATASET_INDEX.exists():
        raise FileNotFoundError(f"dataset_index.csv not found: {DATASET_INDEX}")

    df = pd.read_csv(DATASET_INDEX)

    if len(df) == 0:
        raise ValueError("dataset_index.csv is empty.")

    if tic_id is not None:
        tic_id = str(tic_id)
        selected = df[df["tic_id"].astype(str) == tic_id]

        if len(selected) == 0:
            raise ValueError(f"TIC {tic_id} not found in dataset_index.csv.")

        row = selected.iloc[0]
    else:
        row = df.iloc[0]

    file_path = PROJECT_ROOT / row["file_path"]

    tic_id = str(row["tic_id"])
    true_label = str(row["label"])

    return file_path, tic_id, true_label


def get_lightcurve_from_file(file_arg):
    """
    Loads one custom file path.
    """
    file_path = Path(file_arg)

    if not file_path.is_absolute():
        file_path = PROJECT_ROOT / file_path

    if not file_path.exists():
        raise FileNotFoundError(f"Light curve file not found: {file_path}")

    tic_id = file_path.stem.replace("TIC_", "").replace("_clean_detrended", "")
    true_label = "unknown"

    return file_path, tic_id, true_label


def make_candidate_decision(predicted_label, planet_probability, confidence, threshold):
    """
    Converts ML output into a science-friendly candidate decision.
    """

    is_planet_candidate = planet_probability >= threshold

    if planet_probability >= 0.60:
        decision = "Strong planet candidate"
        candidate_priority = "high"
    elif is_planet_candidate:
        decision = "Possible planet candidate"
        candidate_priority = "medium"
    elif predicted_label == "eclipsing_binary":
        decision = "Likely eclipsing binary"
        candidate_priority = "low"
    elif predicted_label == "false_positive":
        decision = "Likely false positive"
        candidate_priority = "low"
    else:
        decision = "Uncertain"
        candidate_priority = "review"

    return decision, is_planet_candidate, candidate_priority


def predict_lightcurve(file_path, tic_id, true_label, model, feature_columns, labels, model_name):
    """
    Runs full inference:
    clean -> detrend -> BLS features -> ML prediction -> threshold decision.
    """
    print("\nInput light curve:")
    print(f"TIC ID: {tic_id}")
    print(f"True label: {true_label}")
    print(f"File: {file_path}")

    print("\nExtracting features...")
    lc = clean_and_detrend_lightcurve(file_path)
    features = run_bls_and_extract_features(lc)

    X = pd.DataFrame([{col: features.get(col, np.nan) for col in feature_columns}])

    predicted_label = model.predict(X)[0]

    probabilities = {}

    if hasattr(model, "predict_proba"):
        proba = model.predict_proba(X)[0]
        class_order = list(model.classes_)

        for label, prob in zip(class_order, proba):
            probabilities[label] = float(prob)

    confidence = float(max(probabilities.values())) if probabilities else None
    planet_probability = float(probabilities.get("planet", 0.0))

    threshold_data = load_planet_threshold()
    planet_threshold = float(threshold_data.get("selected_threshold", 0.40))

    decision, is_planet_candidate, candidate_priority = make_candidate_decision(
        predicted_label=predicted_label,
        planet_probability=planet_probability,
        confidence=confidence,
        threshold=planet_threshold,
    )

    result = {
        "tic_id": tic_id,
        "true_label": true_label,
        "predicted_label": str(predicted_label),
        "decision": decision,
        "confidence": confidence,
        "planet_probability": planet_probability,
        "class_probabilities": probabilities,
        "model_name": model_name,

        "planet_threshold": planet_threshold,
        "threshold_source": threshold_data.get("source", "unknown"),
        "is_planet_candidate": is_planet_candidate,
        "candidate_priority": candidate_priority,

        "features": features,
    }

    return result


def print_prediction_summary(result):
    print("\nPrediction Result")
    print("-----------------")
    print(f"TIC ID: {result['tic_id']}")
    print(f"True label: {result['true_label']}")
    print(f"Predicted label: {result['predicted_label']}")
    print(f"Decision: {result['decision']}")
    print(f"Candidate priority: {result['candidate_priority']}")
    print(f"Is planet candidate: {result['is_planet_candidate']}")
    print(f"Planet threshold: {result['planet_threshold']}")

    if result["confidence"] is not None:
        print(f"Confidence: {result['confidence']:.3f}")

    print(f"Planet probability: {result['planet_probability']:.3f}")

    print("\nClass probabilities:")
    for label, prob in result["class_probabilities"].items():
        print(f"- {label}: {prob:.3f}")

    features = result["features"]

    print("\nDetected transit/BLS features:")
    print(f"Period: {features['period_days']:.6f} days")
    print(f"Duration: {features['duration_hours']:.3f} hours")
    print(f"Depth: {features['depth_percent']:.4f}%")
    print(f"SNR: {features['snr']:.3f}")
    print(f"BLS power: {features['bls_power']:.3f}")


def main():
    parser = argparse.ArgumentParser(
        description="Predict one TESS light curve using the trained ExoTrace classifier."
    )

    parser.add_argument(
        "--tic",
        type=str,
        default=None,
        help="TIC ID from dataset_index.csv"
    )

    parser.add_argument(
        "--file",
        type=str,
        default=None,
        help="Custom light curve CSV file path"
    )

    args = parser.parse_args()

    model, feature_columns, labels, model_name = load_model()

    if args.file is not None:
        file_path, tic_id, true_label = get_lightcurve_from_file(args.file)
    else:
        file_path, tic_id, true_label = get_lightcurve_from_dataset(args.tic)

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

    print_prediction_summary(result)

    output_file = RESULTS_DIR / f"TIC_{result['tic_id']}_prediction.json"

    with open(output_file, "w") as f:
        json.dump(result, f, indent=4)

    print("\nPrediction JSON saved to:")
    print(output_file)

    print("\nStep 20 completed successfully.")


if __name__ == "__main__":
    main()