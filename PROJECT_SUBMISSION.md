# ExoTrace Project Submission

## Project Title

ExoTrace: AI-enabled Detection of Exoplanets from Noisy Astronomical Light Curves

---

## Short GitHub Description

AI-powered exoplanet transit detection pipeline using TESS light curves, BLS feature extraction, machine learning classification, optimized planet-candidate thresholding, FastAPI backend, and React dashboard visualization.

---

## Project Abstract

ExoTrace is an end-to-end AI-based pipeline for detecting possible exoplanet candidates from noisy astronomical light curve data.

Exoplanets can be detected using transit photometry, where a planet passing in front of its host star causes a small periodic dip in brightness.

However, real astronomical light curves are noisy, and similar dips may be caused by eclipsing binary stars, false positives, stellar variability, instrumental effects, or crowded field contamination.

ExoTrace addresses this problem by combining astronomical signal processing and machine learning.

The system cleans and normalizes TESS light curves, detrends flux variations, applies Box Least Squares transit search, extracts scientific transit features, and classifies each light curve into planet, false positive, or eclipsing binary.

To improve candidate discovery, ExoTrace also uses an optimized planet-candidate threshold.

This allows the system to prioritize recall and flag possible planet candidates for further expert review.

The project includes a FastAPI backend and a React dashboard that displays predictions, class probabilities, candidate priority, transit features, light curve visualizations, full batch report metrics, and top planet candidates.

On the current balanced pilot dataset of 150 light curves, ExoTrace achieved 90.0% full batch accuracy and 98.0% candidate recall, detecting 49 out of 50 planet examples while missing only one.

ExoTrace is designed as an AI-assisted candidate screening tool, not a final scientific validation system.

Its goal is to reduce manual review effort and help prioritize promising exoplanet candidates for further astrophysical analysis.

---

## Problem Statement Explanation

The challenge is to detect exoplanet transit signals from noisy astronomical light curves.

A light curve records the brightness of a star over time.

When an exoplanet crosses in front of the star, the brightness slightly decreases.

This transit signal is usually very small and can be difficult to detect in noisy data.

The difficulty is that not every brightness dip is caused by a planet.

Some dips are caused by eclipsing binary stars, false positives, detector noise, or other astrophysical effects.

Therefore, the system must identify periodic transit-like dips and also separate planet-like candidates from confusing signals.

---

## Proposed Solution

ExoTrace solves the problem using a complete AI pipeline:

1. Load TESS light curve data.
2. Clean invalid flux values.
3. Normalize brightness values.
4. Detrend long-term variations.
5. Detect periodic dips using Box Least Squares.
6. Extract transit features.
7. Classify light curves using a trained machine learning model.
8. Apply an optimized planet-candidate threshold.
9. Generate prediction reports and plots.
10. Display results in a React dashboard.

---

## Technical Approach

The pipeline uses Box Least Squares to identify periodic transit-like signals.

From the BLS search and processed light curve, ExoTrace extracts features such as:

* Period
* Duration
* Transit depth
* Signal-to-noise ratio
* BLS power
* Number of detected transits
* Odd-even depth difference
* Secondary eclipse depth
* V-shape score
* Observation baseline

These features are passed to an ExtraTrees classifier.

The model predicts one of three labels:

* planet
* false_positive
* eclipsing_binary

After classification, ExoTrace applies a planet probability threshold of 0.20.

If the planet probability is greater than or equal to 0.20, the object is marked as a possible planet candidate.

This threshold improves candidate recall and makes the system useful for screening.

---

## Dataset Summary

The current prototype uses a balanced pilot dataset of 150 TESS light curves.

| Class            | Count |
| ---------------- | ----: |
| Planet           |    50 |
| False Positive   |    50 |
| Eclipsing Binary |    50 |
| Total            |   150 |

---

## Results

### Held-out Test Split Results

| Metric                  |  Value |
| ----------------------- | -----: |
| Accuracy                |  78.0% |
| Macro F1                |  77.0% |
| Planet Recall           |  53.0% |
| False Positive Recall   |  82.0% |
| Eclipsing Binary Recall | 100.0% |

### Full Batch Report Results

| Metric                   | Value |
| ------------------------ | ----: |
| Total Predictions        |   150 |
| Full Batch Accuracy      | 90.0% |
| Candidate Recall         | 98.0% |
| Candidate Precision      | 55.1% |
| Candidate F1             | 70.5% |
| True Positive Planets    |    49 |
| Missed Planets           |     1 |
| False Planet Alerts      |    40 |
| High Priority Candidates |    24 |

Important note:

The held-out test split accuracy is the stricter model evaluation metric.

The full batch accuracy is calculated on all 150 available pilot dataset examples.

---

## Dashboard Features

The ExoTrace dashboard provides:

* Dataset overview
* Full batch accuracy
* Candidate recall
* Missed planets
* False alerts
* High priority candidate count
* Candidate screening report
* TIC target selection by class
* Single TIC prediction
* Candidate decision and priority
* Class probabilities
* Transit features
* Normalized light curve plot
* Detrended light curve plot
* Phase-folded transit plot
* Top planet candidates table

---

## Backend Features

The backend is built using FastAPI.

Main endpoints:

| Endpoint                       | Purpose                                                            |
| ------------------------------ | ------------------------------------------------------------------ |
| `/api/health`                  | Checks backend, model, threshold, dataset, and report availability |
| `/api/summary`                 | Returns project and dataset summary                                |
| `/api/targets`                 | Lists available TIC targets                                        |
| `/api/targets/{label}`         | Lists targets by class                                             |
| `/api/predict/{tic_id}`        | Predicts one light curve                                           |
| `/api/report/summary`          | Returns full batch report metrics                                  |
| `/api/report/top-candidates`   | Returns top ranked planet candidates                               |
| `/api/report/full-predictions` | Returns full prediction records                                    |

---

## Frontend Features

The frontend is built using React and TanStack Router.

It connects with the FastAPI backend and displays:

* ML predictions
* Candidate screening decisions
* Transit features
* Candidate ranking
* Full report metrics
* Scientific light curve plots

---

## How to Run

### Start Backend

```cmd
cd /d M:\Project\ExoTrace\Main
python -m uvicorn backend.api_server:app --reload --host 127.0.0.1 --port 8000
```

Backend:

```text
http://127.0.0.1:8000
```

### Start Frontend

```cmd
cd /d M:\Project\ExoTrace\Main
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

## Demo TIC ID

Use this TIC ID for demo:

```text
146172354
```

Expected result:

| Field              | Value                     |
| ------------------ | ------------------------- |
| True Label         | planet                    |
| Predicted Label    | planet                    |
| Decision           | Possible planet candidate |
| Planet Probability | 49.3%                     |
| Threshold          | 20.0%                     |
| Candidate          | Yes                       |
| Priority           | Medium                    |

---

## Top Candidate Examples

| TIC ID    | Decision                | Priority | Planet Probability |
| --------- | ----------------------- | -------- | -----------------: |
| 388104525 | Strong planet candidate | High     |              89.9% |
| 360742636 | Strong planet candidate | High     |              89.4% |
| 120247528 | Strong planet candidate | High     |              87.9% |
| 355703913 | Strong planet candidate | High     |              86.7% |
| 201604954 | Strong planet candidate | High     |              85.0% |

---

## Innovation

The key innovation of ExoTrace is that it combines:

* Astronomical signal processing
* BLS-based transit detection
* Machine learning classification
* Optimized candidate thresholding
* Explainable transit features
* API-based backend
* Interactive frontend dashboard

This creates a complete AI-assisted exoplanet candidate screening workflow.

---

## Limitations

ExoTrace is a prototype and not a final scientific validation system.

Current limitations:

* Small pilot dataset
* No stellar metadata integration yet
* No centroid shift validation
* No Gaia contamination analysis
* No manual astrophysical vetting
* Needs larger training data for production use

---

## Future Scope

Future improvements can include:

* Larger TESS dataset
* CNN/LSTM/Transformer time-series models
* Gaia stellar metadata
* Centroid shift analysis
* Contamination and blending checks
* Explainable AI feature importance
* Automated PDF reports
* Cloud deployment
* Candidate export for astronomers

---

## Final Summary

ExoTrace is an end-to-end AI pipeline that detects, ranks, and explains possible exoplanet candidates from noisy TESS light curves.

It achieved:

```text
Full batch accuracy: 90.0%
Candidate recall: 98.0%
True positive planets: 49 out of 50
Missed planets: 1
```

It is designed to support astronomers by reducing manual review effort and prioritizing promising candidates for further scientific validation.
