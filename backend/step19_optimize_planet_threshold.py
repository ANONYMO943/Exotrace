from pathlib import Path
import json

import joblib
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

from sklearn.metrics import (
    precision_score,
    recall_score,
    f1_score,
    fbeta_score,
    confusion_matrix,
)
from sklearn.model_selection import train_test_split


BASE_DIR = Path(__file__).resolve().parent

FEATURES_FILE = BASE_DIR / "data" / "features.csv"
MODEL_FILE = BASE_DIR / "models" / "best_exotrace_classifier.joblib"

MODEL_DIR = BASE_DIR / "models"
METRICS_DIR = BASE_DIR / "outputs" / "metrics"

THRESHOLD_FILE = MODEL_DIR / "planet_threshold.json"
THRESHOLD_CSV = METRICS_DIR / "planet_threshold_optimization.csv"
THRESHOLD_PLOT = METRICS_DIR / "planet_threshold_curve.png"

MODEL_DIR.mkdir(parents=True, exist_ok=True)
METRICS_DIR.mkdir(parents=True, exist_ok=True)


def load_data_and_model():
    if not FEATURES_FILE.exists():
        raise FileNotFoundError(f"features.csv not found: {FEATURES_FILE}")

    if not MODEL_FILE.exists():
        raise FileNotFoundError(f"Best model not found: {MODEL_FILE}")

    df = pd.read_csv(FEATURES_FILE)

    model_bundle = joblib.load(MODEL_FILE)

    model = model_bundle["model"]
    feature_columns = model_bundle["feature_columns"]
    labels = model_bundle["labels"]
    model_name = model_bundle.get("model_name", "unknown")

    X = df[feature_columns].copy()
    y = df["label"].copy()

    for col in X.columns:
        X[col] = pd.to_numeric(X[col], errors="coerce")

    print("Loaded data and model")
    print("---------------------")
    print(f"Rows: {len(df)}")
    print(f"Model: {model_name}")
    print(f"Labels: {labels}")
    print("\nClass counts:")
    print(y.value_counts())

    return df, X, y, model, feature_columns, labels, model_name


def optimize_threshold(X, y, model):
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.33,
        random_state=42,
        stratify=y,
    )

    print("\nUsing same train/test split as model evaluation")
    print(f"Train size: {len(X_train)}")
    print(f"Test size: {len(X_test)}")

    if not hasattr(model, "predict_proba"):
        raise ValueError("Model does not support predict_proba.")

    probabilities = model.predict_proba(X_test)
    class_order = list(model.classes_)

    if "planet" not in class_order:
        raise ValueError(f"'planet' class not found in model classes: {class_order}")

    planet_index = class_order.index("planet")
    planet_probabilities = probabilities[:, planet_index]

    y_true_binary = (y_test == "planet").astype(int)

    records = []

    thresholds = np.arange(0.10, 0.91, 0.05)

    for threshold in thresholds:
        y_pred_binary = (planet_probabilities >= threshold).astype(int)

        precision = precision_score(y_true_binary, y_pred_binary, zero_division=0)
        recall = recall_score(y_true_binary, y_pred_binary, zero_division=0)
        f1 = f1_score(y_true_binary, y_pred_binary, zero_division=0)

        # F2 gives more importance to recall than precision.
        f2 = fbeta_score(y_true_binary, y_pred_binary, beta=2, zero_division=0)

        tn, fp, fn, tp = confusion_matrix(
            y_true_binary,
            y_pred_binary,
            labels=[0, 1],
        ).ravel()

        records.append({
            "threshold": round(float(threshold), 2),
            "precision": precision,
            "recall": recall,
            "f1": f1,
            "f2": f2,
            "true_positive_planets": int(tp),
            "missed_planets": int(fn),
            "false_planet_alerts": int(fp),
            "true_non_planets": int(tn),
        })

    result_df = pd.DataFrame(records)

    # Choose threshold based on F2 score.
    # This favors catching planets, which is important for candidate detection.
    best_row = result_df.sort_values(
        by=["f2", "recall", "precision"],
        ascending=False,
    ).iloc[0]

    return result_df, best_row


def save_results(result_df, best_row, model_name):
    result_df.to_csv(THRESHOLD_CSV, index=False)

    threshold_data = {
        "model_name": model_name,
        "selected_threshold": float(best_row["threshold"]),
        "precision": float(best_row["precision"]),
        "recall": float(best_row["recall"]),
        "f1": float(best_row["f1"]),
        "f2": float(best_row["f2"]),
        "true_positive_planets": int(best_row["true_positive_planets"]),
        "missed_planets": int(best_row["missed_planets"]),
        "false_planet_alerts": int(best_row["false_planet_alerts"]),
        "selection_rule": "Best F2 score to prioritize planet recall",
    }

    with open(THRESHOLD_FILE, "w") as f:
        json.dump(threshold_data, f, indent=4)

    plt.figure(figsize=(10, 5))
    plt.plot(result_df["threshold"], result_df["precision"], marker="o", label="Precision")
    plt.plot(result_df["threshold"], result_df["recall"], marker="o", label="Recall")
    plt.plot(result_df["threshold"], result_df["f1"], marker="o", label="F1")
    plt.plot(result_df["threshold"], result_df["f2"], marker="o", label="F2")

    plt.axvline(float(best_row["threshold"]), linestyle="--", label="Selected threshold")

    plt.xlabel("Planet Probability Threshold")
    plt.ylabel("Score")
    plt.title("Planet Candidate Threshold Optimization")
    plt.legend()
    plt.tight_layout()
    plt.savefig(THRESHOLD_PLOT, dpi=200)
    plt.close()

    print("\nThreshold optimization saved")
    print("----------------------------")
    print(f"CSV: {THRESHOLD_CSV}")
    print(f"JSON: {THRESHOLD_FILE}")
    print(f"Plot: {THRESHOLD_PLOT}")

    return threshold_data


def main():
    df, X, y, model, feature_columns, labels, model_name = load_data_and_model()

    result_df, best_row = optimize_threshold(X, y, model)

    print("\nThreshold results:")
    print(result_df)

    print("\nBest threshold:")
    print(best_row)

    threshold_data = save_results(result_df, best_row, model_name)

    print("\nSelected planet-candidate threshold:")
    print(f"Threshold: {threshold_data['selected_threshold']}")
    print(f"Precision: {threshold_data['precision']:.3f}")
    print(f"Recall: {threshold_data['recall']:.3f}")
    print(f"F1: {threshold_data['f1']:.3f}")
    print(f"F2: {threshold_data['f2']:.3f}")
    print(f"True positive planets: {threshold_data['true_positive_planets']}")
    print(f"Missed planets: {threshold_data['missed_planets']}")
    print(f"False planet alerts: {threshold_data['false_planet_alerts']}")

    print("\nStep 19 completed successfully.")


if __name__ == "__main__":
    main()