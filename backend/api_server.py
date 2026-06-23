from pathlib import Path
import sys
import json
import math

import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles


BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent
sys.path.append(str(BASE_DIR))

from step13_predict_one_lightcurve import (
    load_model,
    get_lightcurve_from_dataset,
    predict_lightcurve,
    convert_to_builtin_types,
)

from step18_plot_utils import generate_prediction_plots


DATASET_INDEX = BASE_DIR / "data" / "dataset_index.csv"

OUTPUTS_DIR = BASE_DIR / "outputs"
RESULTS_DIR = OUTPUTS_DIR / "results"
PLOTS_DIR = OUTPUTS_DIR / "plots"

FULL_PREDICTIONS_CSV = RESULTS_DIR / "full_predictions.csv"
FULL_SUMMARY_JSON = RESULTS_DIR / "full_prediction_summary.json"
TOP_CANDIDATES_CSV = RESULTS_DIR / "top_planet_candidates.csv"

OUTPUTS_DIR.mkdir(parents=True, exist_ok=True)
RESULTS_DIR.mkdir(parents=True, exist_ok=True)
PLOTS_DIR.mkdir(parents=True, exist_ok=True)


app = FastAPI(
    title="ExoTrace API",
    description="AI-enabled exoplanet transit detection API",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.mount("/static", StaticFiles(directory=str(OUTPUTS_DIR)), name="static")


MODEL_CACHE = None


def get_cached_model():
    global MODEL_CACHE

    if MODEL_CACHE is None:
        MODEL_CACHE = load_model()

    return MODEL_CACHE


def make_json_safe(value):
    """
    Converts pandas/numpy values into JSON-safe Python values.
    This prevents FastAPI Internal Server Error caused by NaN or Infinity.
    """

    if value is None:
        return None

    try:
        if pd.isna(value):
            return None
    except Exception:
        pass

    if hasattr(value, "item"):
        try:
            value = value.item()
        except Exception:
            pass

    if isinstance(value, float):
        if math.isnan(value) or math.isinf(value):
            return None

    return value


def dataframe_to_records(df):
    """
    Converts pandas DataFrame into JSON-safe records.
    """

    records = df.to_dict(orient="records")
    safe_records = []

    for record in records:
        safe_record = {}

        for key, value in record.items():
            safe_record[key] = make_json_safe(value)

        safe_records.append(safe_record)

    return safe_records


@app.get("/")
def root():
    return {
        "project": "ExoTrace",
        "status": "running",
        "message": "ExoTrace backend API is active",
        "available_endpoints": [
            "/api/health",
            "/api/summary",
            "/api/targets",
            "/api/targets/{label}",
            "/api/predict/{tic_id}",
            "/api/report/summary",
            "/api/report/top-candidates",
            "/api/report/full-predictions",
        ],
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "backend": "FastAPI",
        "model_available": (
            BASE_DIR / "models" / "best_exotrace_classifier.joblib"
        ).exists(),
        "planet_threshold_available": (
            BASE_DIR / "models" / "planet_threshold.json"
        ).exists(),
        "dataset_index_available": DATASET_INDEX.exists(),
        "full_report_available": FULL_SUMMARY_JSON.exists(),
        "top_candidates_available": TOP_CANDIDATES_CSV.exists(),
    }


@app.get("/api/targets")
def list_targets(limit: int = 20):
    if not DATASET_INDEX.exists():
        raise HTTPException(status_code=404, detail="dataset_index.csv not found")

    df = pd.read_csv(DATASET_INDEX)

    records = df[["tic_id", "label", "file_path"]].head(limit).to_dict(
        orient="records"
    )

    class_counts = df["label"].value_counts().to_dict()

    return {
        "total_targets": len(df),
        "class_counts": class_counts,
        "limit": limit,
        "targets": records,
    }


@app.get("/api/targets/{label}")
def list_targets_by_label(label: str, limit: int = 20):
    if not DATASET_INDEX.exists():
        raise HTTPException(status_code=404, detail="dataset_index.csv not found")

    df = pd.read_csv(DATASET_INDEX)

    valid_labels = sorted(df["label"].unique())

    if label not in valid_labels:
        raise HTTPException(
            status_code=400,
            detail={
                "message": "Invalid label",
                "valid_labels": valid_labels,
            },
        )

    filtered = df[df["label"] == label]

    records = filtered[["tic_id", "label", "file_path"]].head(limit).to_dict(
        orient="records"
    )

    return {
        "label": label,
        "total": len(filtered),
        "limit": limit,
        "targets": records,
    }


@app.get("/api/predict/{tic_id}")
def predict_by_tic(tic_id: str):
    try:
        model, feature_columns, labels, model_name = get_cached_model()

        file_path, selected_tic_id, true_label = get_lightcurve_from_dataset(tic_id)

        result = predict_lightcurve(
            file_path=file_path,
            tic_id=selected_tic_id,
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

        output_file = RESULTS_DIR / f"TIC_{result['tic_id']}_prediction.json"

        with open(output_file, "w") as f:
            json.dump(result, f, indent=4)

        return {
            "status": "success",
            "result_file": str(output_file),
            "result": result,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/summary")
def project_summary():
    if not DATASET_INDEX.exists():
        raise HTTPException(status_code=404, detail="dataset_index.csv not found")

    df = pd.read_csv(DATASET_INDEX)

    return {
        "project": "ExoTrace",
        "description": "AI-enabled detection of exoplanets from noisy astronomical light curves",
        "dataset": {
            "total_lightcurves": len(df),
            "class_counts": df["label"].value_counts().to_dict(),
        },
        "pipeline": [
            "TESS light curve download",
            "Light curve cleaning",
            "Flux normalization",
            "Detrending",
            "BLS transit search",
            "Feature extraction",
            "ML classification",
            "Optimized planet-candidate thresholding",
            "Prediction JSON generation",
            "Dashboard plot generation",
            "Full batch report generation",
        ],
        "model": {
            "name": "ExtraTrees",
            "accuracy": 0.78,
            "macro_f1": 0.77,
            "planet_recall": 0.53,
            "false_positive_recall": 0.82,
            "eclipsing_binary_recall": 1.00,
        },
        "candidate_screening": {
            "optimized_threshold": 0.20,
            "purpose": "Improve planet candidate recall for screening.",
        },
    }


@app.get("/api/report/summary")
def full_report_summary():
    """
    Returns full batch prediction summary generated by Step 23.
    """

    if not FULL_SUMMARY_JSON.exists():
        raise HTTPException(
            status_code=404,
            detail=(
                "full_prediction_summary.json not found. "
                "Run: python backend\\step23_create_full_prediction_report.py"
            ),
        )

    with open(FULL_SUMMARY_JSON, "r") as f:
        summary = json.load(f)

    return {
        "status": "success",
        "source_file": str(FULL_SUMMARY_JSON),
        "summary": summary,
    }


@app.get("/api/report/top-candidates")
def top_planet_candidates(limit: int = 10):
    """
    Returns top planet candidates generated by Step 23.
    """

    if not TOP_CANDIDATES_CSV.exists():
        raise HTTPException(
            status_code=404,
            detail=(
                "top_planet_candidates.csv not found. "
                "Run: python backend\\step23_create_full_prediction_report.py"
            ),
        )

    df = pd.read_csv(TOP_CANDIDATES_CSV)

    sort_columns = [
        col for col in ["planet_probability", "confidence", "snr"] if col in df.columns
    ]

    if sort_columns:
        df = df.sort_values(
            by=sort_columns,
            ascending=False,
        )

    selected_columns = [
        "tic_id",
        "true_label",
        "predicted_label",
        "decision",
        "is_planet_candidate",
        "candidate_priority",
        "planet_probability",
        "planet_threshold",
        "confidence",
        "period_days",
        "duration_hours",
        "depth_percent",
        "snr",
        "bls_power",
        "n_detected_transits",
    ]

    available_columns = [col for col in selected_columns if col in df.columns]

    records = dataframe_to_records(df[available_columns].head(limit))

    return {
        "status": "success",
        "source_file": str(TOP_CANDIDATES_CSV),
        "limit": limit,
        "total_candidates": len(df),
        "candidates": records,
    }


@app.get("/api/report/full-predictions")
def full_predictions(
    limit: int = 50,
    label: str | None = None,
    candidates_only: bool = False,
):
    """
    Returns full prediction report generated by Step 23.

    Optional filters:
    - label=planet
    - label=false_positive
    - label=eclipsing_binary
    - candidates_only=true
    """

    if not FULL_PREDICTIONS_CSV.exists():
        raise HTTPException(
            status_code=404,
            detail=(
                "full_predictions.csv not found. "
                "Run: python backend\\step23_create_full_prediction_report.py"
            ),
        )

    df = pd.read_csv(FULL_PREDICTIONS_CSV)

    if label is not None:
        valid_labels = sorted(df["true_label"].dropna().unique())

        if label not in valid_labels:
            raise HTTPException(
                status_code=400,
                detail={
                    "message": "Invalid label",
                    "valid_labels": valid_labels,
                },
            )

        df = df[df["true_label"] == label]

    if candidates_only:
        candidate_mask = (
            df["is_planet_candidate"]
            .astype(str)
            .str.lower()
            .isin(["true", "1", "yes"])
        )

        df = df[candidate_mask]

    sort_columns = [
        col for col in ["planet_probability", "confidence", "snr"] if col in df.columns
    ]

    if sort_columns:
        df = df.sort_values(
            by=sort_columns,
            ascending=False,
        )

    records = dataframe_to_records(df.head(limit))

    return {
        "status": "success",
        "source_file": str(FULL_PREDICTIONS_CSV),
        "limit": limit,
        "label_filter": label,
        "candidates_only": candidates_only,
        "total_matching": len(df),
        "predictions": records,
    }