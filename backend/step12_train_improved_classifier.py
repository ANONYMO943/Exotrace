from pathlib import Path
import json

import joblib
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

from sklearn.ensemble import RandomForestClassifier, ExtraTreesClassifier, GradientBoostingClassifier
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
)
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC


BASE_DIR = Path(__file__).resolve().parent

FEATURES_FILE = BASE_DIR / "data" / "features.csv"

MODEL_DIR = BASE_DIR / "models"
METRICS_DIR = BASE_DIR / "outputs" / "metrics"

MODEL_DIR.mkdir(parents=True, exist_ok=True)
METRICS_DIR.mkdir(parents=True, exist_ok=True)

BEST_MODEL_FILE = MODEL_DIR / "best_exotrace_classifier.joblib"
COMPARISON_FILE = METRICS_DIR / "model_comparison.csv"
BEST_METRICS_FILE = METRICS_DIR / "best_model_metrics.json"
BEST_REPORT_FILE = METRICS_DIR / "best_model_classification_report.txt"
BEST_CONFUSION_MATRIX_PLOT = METRICS_DIR / "best_model_confusion_matrix.png"


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


def load_data():
    if not FEATURES_FILE.exists():
        raise FileNotFoundError(f"features.csv not found: {FEATURES_FILE}")

    df = pd.read_csv(FEATURES_FILE)

    available_features = [col for col in FEATURE_COLUMNS if col in df.columns]

    if "label" not in df.columns:
        raise ValueError("features.csv must contain label column.")

    if not available_features:
        raise ValueError("No valid feature columns found.")

    X = df[available_features].copy()
    y = df["label"].copy()

    for col in X.columns:
        X[col] = pd.to_numeric(X[col], errors="coerce")

    print("Loaded dataset")
    print("--------------")
    print(f"Rows: {len(df)}")
    print(f"Features: {len(available_features)}")

    print("\nClass counts:")
    print(y.value_counts())

    return df, X, y, available_features


def get_models():
    models = {
        "RandomForest": Pipeline(
            steps=[
                ("imputer", SimpleImputer(strategy="median")),
                (
                    "classifier",
                    RandomForestClassifier(
                        n_estimators=500,
                        max_depth=8,
                        min_samples_leaf=2,
                        random_state=42,
                        class_weight="balanced",
                    ),
                ),
            ]
        ),

        "ExtraTrees": Pipeline(
            steps=[
                ("imputer", SimpleImputer(strategy="median")),
                (
                    "classifier",
                    ExtraTreesClassifier(
                        n_estimators=500,
                        max_depth=8,
                        min_samples_leaf=2,
                        random_state=42,
                        class_weight="balanced",
                    ),
                ),
            ]
        ),

        "GradientBoosting": Pipeline(
            steps=[
                ("imputer", SimpleImputer(strategy="median")),
                (
                    "classifier",
                    GradientBoostingClassifier(
                        n_estimators=250,
                        learning_rate=0.05,
                        max_depth=3,
                        random_state=42,
                    ),
                ),
            ]
        ),

        "LogisticRegression": Pipeline(
            steps=[
                ("imputer", SimpleImputer(strategy="median")),
                ("scaler", StandardScaler()),
                (
                    "classifier",
                    LogisticRegression(
                        max_iter=3000,
                        random_state=42,
                        class_weight="balanced",
                    ),
                ),
            ]
        ),

        "SVM": Pipeline(
            steps=[
                ("imputer", SimpleImputer(strategy="median")),
                ("scaler", StandardScaler()),
                (
                    "classifier",
                    SVC(
                        kernel="rbf",
                        probability=True,
                        random_state=42,
                        class_weight="balanced",
                    ),
                ),
            ]
        ),
    }

    return models


def plot_confusion_matrix(cm, labels):
    plt.figure(figsize=(7, 6))
    plt.imshow(cm)
    plt.title("Best ExoTrace Classifier Confusion Matrix")
    plt.xlabel("Predicted Label")
    plt.ylabel("True Label")

    plt.xticks(ticks=np.arange(len(labels)), labels=labels, rotation=45, ha="right")
    plt.yticks(ticks=np.arange(len(labels)), labels=labels)

    for i in range(len(labels)):
        for j in range(len(labels)):
            plt.text(j, i, str(cm[i, j]), ha="center", va="center")

    plt.tight_layout()
    plt.savefig(BEST_CONFUSION_MATRIX_PLOT, dpi=200)
    plt.close()

    print(f"Confusion matrix saved to: {BEST_CONFUSION_MATRIX_PLOT}")


def main():
    df, X, y, feature_columns = load_data()

    labels = sorted(y.unique())

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.33,
        random_state=42,
        stratify=y,
    )

    print("\nTrain/Test split")
    print("----------------")
    print(f"Train size: {len(X_train)}")
    print(f"Test size: {len(X_test)}")

    models = get_models()

    cv = StratifiedKFold(
        n_splits=5,
        shuffle=True,
        random_state=42,
    )

    comparison_records = []

    print("\nTraining and comparing models...")
    print("--------------------------------")

    best_model_name = None
    best_model = None
    best_score = -1

    for model_name, model in models.items():
        print(f"\nModel: {model_name}")

        cv_scores = cross_val_score(
            model,
            X_train,
            y_train,
            cv=cv,
            scoring="f1_macro",
        )

        model.fit(X_train, y_train)

        y_pred = model.predict(X_test)

        accuracy = accuracy_score(y_test, y_pred)
        report_dict = classification_report(
            y_test,
            y_pred,
            labels=labels,
            output_dict=True,
            zero_division=0,
        )

        macro_f1 = report_dict["macro avg"]["f1-score"]
        planet_recall = report_dict.get("planet", {}).get("recall", 0)
        false_positive_recall = report_dict.get("false_positive", {}).get("recall", 0)
        eclipsing_binary_recall = report_dict.get("eclipsing_binary", {}).get("recall", 0)

        print(f"CV macro F1 mean: {cv_scores.mean():.4f}")
        print(f"Test accuracy: {accuracy:.4f}")
        print(f"Test macro F1: {macro_f1:.4f}")
        print(f"Planet recall: {planet_recall:.4f}")

        comparison_records.append({
            "model": model_name,
            "cv_macro_f1_mean": cv_scores.mean(),
            "cv_macro_f1_std": cv_scores.std(),
            "test_accuracy": accuracy,
            "test_macro_f1": macro_f1,
            "planet_recall": planet_recall,
            "false_positive_recall": false_positive_recall,
            "eclipsing_binary_recall": eclipsing_binary_recall,
        })

        # Selection rule:
        # Macro F1 is primary.
        # Planet recall is important as tie-breaker.
        score = macro_f1 + 0.20 * planet_recall

        if score > best_score:
            best_score = score
            best_model_name = model_name
            best_model = model

    comparison_df = pd.DataFrame(comparison_records)
    comparison_df = comparison_df.sort_values(
        by=["test_macro_f1", "planet_recall", "test_accuracy"],
        ascending=False,
    )

    comparison_df.to_csv(COMPARISON_FILE, index=False)

    print("\nModel comparison:")
    print(comparison_df)

    print("\nBest model selected:")
    print(best_model_name)

    # Final evaluation of best model
    y_pred_best = best_model.predict(X_test)

    accuracy = accuracy_score(y_test, y_pred_best)
    report = classification_report(
        y_test,
        y_pred_best,
        labels=labels,
        zero_division=0,
    )
    report_dict = classification_report(
        y_test,
        y_pred_best,
        labels=labels,
        output_dict=True,
        zero_division=0,
    )

    cm = confusion_matrix(y_test, y_pred_best, labels=labels)

    print("\nBest Model Results")
    print("------------------")
    print(f"Best model: {best_model_name}")
    print(f"Accuracy: {accuracy:.4f}")

    print("\nClassification Report:")
    print(report)

    print("\nConfusion Matrix:")
    print(pd.DataFrame(cm, index=labels, columns=labels))

    joblib.dump(
        {
            "model": best_model,
            "model_name": best_model_name,
            "feature_columns": feature_columns,
            "labels": labels,
        },
        BEST_MODEL_FILE,
    )

    metrics = {
        "best_model": best_model_name,
        "accuracy": accuracy,
        "macro_f1": report_dict["macro avg"]["f1-score"],
        "weighted_f1": report_dict["weighted avg"]["f1-score"],
        "planet_recall": report_dict.get("planet", {}).get("recall", 0),
        "false_positive_recall": report_dict.get("false_positive", {}).get("recall", 0),
        "eclipsing_binary_recall": report_dict.get("eclipsing_binary", {}).get("recall", 0),
        "labels": labels,
        "feature_columns": feature_columns,
        "train_size": len(X_train),
        "test_size": len(X_test),
        "class_counts": y.value_counts().to_dict(),
        "note": "Best model selected using macro F1 with planet recall as additional priority.",
    }

    with open(BEST_METRICS_FILE, "w") as f:
        json.dump(metrics, f, indent=4)

    with open(BEST_REPORT_FILE, "w") as f:
        f.write("Best ExoTrace Classifier Report\n")
        f.write("===============================\n\n")
        f.write(f"Best model: {best_model_name}\n")
        f.write(f"Accuracy: {accuracy:.4f}\n\n")
        f.write(report)

    plot_confusion_matrix(cm, labels)

    print("\nFiles saved:")
    print(BEST_MODEL_FILE)
    print(COMPARISON_FILE)
    print(BEST_METRICS_FILE)
    print(BEST_REPORT_FILE)
    print(BEST_CONFUSION_MATRIX_PLOT)

    print("\nStep 12 completed successfully.")


if __name__ == "__main__":
    main()