from pathlib import Path
import json

import joblib
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline


BASE_DIR = Path(__file__).resolve().parent

FEATURES_FILE = BASE_DIR / "data" / "features.csv"
MODEL_DIR = BASE_DIR / "models"
METRICS_DIR = BASE_DIR / "outputs" / "metrics"

MODEL_DIR.mkdir(parents=True, exist_ok=True)
METRICS_DIR.mkdir(parents=True, exist_ok=True)

MODEL_FILE = MODEL_DIR / "baseline_random_forest.joblib"
METRICS_FILE = METRICS_DIR / "baseline_metrics.json"
REPORT_FILE = METRICS_DIR / "baseline_classification_report.txt"
CONFUSION_MATRIX_PLOT = METRICS_DIR / "baseline_confusion_matrix.png"


FEATURE_COLUMNS = [
    "period_days",
    "duration_days",
    "duration_hours",
    "depth",
    "depth_percent",
    "snr",
    "bls_power",
    "n_points_used",
    "n_in_transit_points",
    "n_detected_transits",
    "odd_even_depth_difference",
    "secondary_eclipse_depth",
    "v_shape_score",
    "baseline_days",
    "period_search_min_days",
    "period_search_max_days",
]


def load_features():
    if not FEATURES_FILE.exists():
        raise FileNotFoundError(f"features.csv not found: {FEATURES_FILE}")

    df = pd.read_csv(FEATURES_FILE)

    print("Loaded features:")
    print(f"Rows: {len(df)}")
    print(f"Columns: {list(df.columns)}")

    if "label" not in df.columns:
        raise ValueError("features.csv must contain a label column.")

    available_features = [col for col in FEATURE_COLUMNS if col in df.columns]

    if not available_features:
        raise ValueError("No feature columns found.")

    print("\nUsing feature columns:")
    for col in available_features:
        print(f"- {col}")

    X = df[available_features].copy()
    y = df["label"].copy()

    # Convert all features to numeric
    for col in X.columns:
        X[col] = pd.to_numeric(X[col], errors="coerce")

    return df, X, y, available_features


def plot_confusion_matrix(cm, labels):
    plt.figure(figsize=(7, 6))
    plt.imshow(cm)
    plt.title("Baseline Classifier Confusion Matrix")
    plt.xlabel("Predicted Label")
    plt.ylabel("True Label")

    plt.xticks(ticks=np.arange(len(labels)), labels=labels, rotation=45, ha="right")
    plt.yticks(ticks=np.arange(len(labels)), labels=labels)

    for i in range(len(labels)):
        for j in range(len(labels)):
            plt.text(j, i, str(cm[i, j]), ha="center", va="center")

    plt.tight_layout()
    plt.savefig(CONFUSION_MATRIX_PLOT, dpi=200)
    plt.close()

    print(f"Confusion matrix plot saved to: {CONFUSION_MATRIX_PLOT}")


def main():
    df, X, y, available_features = load_features()

    print("\nClass counts:")
    print(y.value_counts())

    # 30 records is small, but enough for first baseline.
    # Stratify keeps class balance in train/test split.
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.33,
        random_state=42,
        stratify=y,
    )

    print("\nTrain/Test split:")
    print(f"Train size: {len(X_train)}")
    print(f"Test size: {len(X_test)}")

    model = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="median")),
            (
                "classifier",
                RandomForestClassifier(
                    n_estimators=300,
                    max_depth=5,
                    random_state=42,
                    class_weight="balanced",
                ),
            ),
        ]
    )

    print("\nTraining Random Forest baseline classifier...")
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)

    accuracy = accuracy_score(y_test, y_pred)
    report = classification_report(y_test, y_pred, zero_division=0)

    labels = sorted(y.unique())
    cm = confusion_matrix(y_test, y_pred, labels=labels)

    print("\nBaseline Model Results")
    print("----------------------")
    print(f"Accuracy: {accuracy:.4f}")

    print("\nClassification Report:")
    print(report)

    print("\nConfusion Matrix:")
    print(pd.DataFrame(cm, index=labels, columns=labels))

    # Save model
    joblib.dump(
        {
            "model": model,
            "feature_columns": available_features,
            "labels": labels,
        },
        MODEL_FILE,
    )

    print(f"\nModel saved to: {MODEL_FILE}")

    # Save metrics
    metrics = {
        "accuracy": accuracy,
        "labels": labels,
        "feature_columns": available_features,
        "train_size": len(X_train),
        "test_size": len(X_test),
        "class_counts": y.value_counts().to_dict(),
        "note": "This is a first baseline model trained on a small 30-sample dataset. Increase data size for final evaluation.",
    }

    with open(METRICS_FILE, "w") as f:
        json.dump(metrics, f, indent=4)

    with open(REPORT_FILE, "w") as f:
        f.write("Baseline Random Forest Classification Report\n")
        f.write("===========================================\n\n")
        f.write(f"Accuracy: {accuracy:.4f}\n\n")
        f.write(report)

    print(f"Metrics saved to: {METRICS_FILE}")
    print(f"Classification report saved to: {REPORT_FILE}")

    plot_confusion_matrix(cm, labels)

    print("\nStep 9 completed successfully.")


if __name__ == "__main__":
    main()