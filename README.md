# ExoTrace

## AI-enabled Detection of Exoplanets from Noisy Astronomical Light Curves

ExoTrace is an AI-based exoplanet transit detection pipeline built for identifying possible exoplanet candidates from noisy TESS astronomical light curve data.

The system processes light curves, extracts transit-related features using the Box Least Squares algorithm, classifies the source using a trained machine learning model, applies an optimized planet-candidate threshold, and displays the result through an interactive React dashboard.

---

## Problem Statement

Exoplanets can be detected using transit photometry.

When a planet passes in front of its host star, the star brightness slightly decreases for a short time.

This small dip is called a transit.

However, real astronomical light curves are noisy.

Brightness changes can also be caused by:

* Actual exoplanet transits
* Eclipsing binary stars
* False positives
* Stellar variability
* Instrument noise
* Crowded field contamination

The goal of ExoTrace is to automatically analyze noisy light curves and detect possible planet-like transit signals.

---

## Objective

The main objective of ExoTrace is to build an automated AI pipeline that can:

* Load TESS light curve data
* Clean and normalize flux values
* Detrend noisy brightness curves
* Search for periodic transit-like dips
* Extract scientific transit features
* Classify the source into three classes
* Rank possible planet candidates
* Display results with plots and explainable metrics

---

## Classes Used

ExoTrace classifies each light curve into one of these classes:

| Class            | Meaning                                                 |
| ---------------- | ------------------------------------------------------- |
| planet           | Possible exoplanet transit signal                       |
| false_positive   | Transit-like signal but not a reliable planet candidate |
| eclipsing_binary | Binary star system causing eclipse-like brightness dips |

---

## Dataset

The current pilot dataset contains 150 TESS light curves.

| Class            | Count |
| ---------------- | ----: |
| Planet           |    50 |
| False Positive   |    50 |
| Eclipsing Binary |    50 |
| Total            |   150 |

The dataset is balanced for prototype training and demonstration.

---

## Machine Learning Pipeline

ExoTrace follows this pipeline:

1. Download TESS light curves
2. Clean invalid flux values
3. Normalize flux
4. Detrend the light curve
5. Run Box Least Squares period search
6. Extract transit features
7. Train machine learning classifiers
8. Select the best model
9. Optimize planet-candidate threshold
10. Generate predictions
11. Generate light curve plots
12. Create full batch prediction report
13. Display results in frontend dashboard

---

## Feature Extraction

The system extracts important transit and light curve features such as:

* Period in days
* Transit duration
* Transit depth
* Signal-to-noise ratio
* BLS power
* Number of detected transits
* Odd-even depth difference
* Secondary eclipse depth
* V-shape score
* Observation baseline

These features help the model distinguish planet-like transits from eclipsing binaries and false positives.

---

## Model

The best selected model is:

```text
ExtraTrees Classifier
```

The model was selected based on balanced classification performance.

---

## Model Performance

### Held-out Test Split Performance

| Metric                  |  Value |
| ----------------------- | -----: |
| Accuracy                |  78.0% |
| Macro F1                |  77.0% |
| Planet Recall           |  53.0% |
| False Positive Recall   |  82.0% |
| Eclipsing Binary Recall | 100.0% |

This test split result shows the model performance on a held-out evaluation set.

---

### Full Batch Report Performance

The full batch report was generated on all 150 available light curves.

| Metric                    | Value |
| ------------------------- | ----: |
| Full Batch Accuracy       | 90.0% |
| Total Predictions         |   150 |
| Planet Examples           |    50 |
| False Positive Examples   |    50 |
| Eclipsing Binary Examples |    50 |

Important note:

The full batch accuracy is calculated on the complete pilot dataset.

The held-out test split accuracy is the stricter model evaluation metric.

---

## Optimized Planet Candidate Screening

For exoplanet detection, missing real planet candidates is a major problem.

So ExoTrace uses an optimized planet-candidate threshold.

The selected threshold is:

```text
Planet probability >= 0.20
```

If the planet probability is greater than or equal to this threshold, the system marks the object as a possible planet candidate.

### Candidate Screening Performance

| Metric                | Value |
| --------------------- | ----: |
| Candidate Recall      | 98.0% |
| Candidate Precision   | 55.1% |
| Candidate F1          | 70.5% |
| True Positive Planets |    49 |
| Missed Planets        |     1 |
| False Planet Alerts   |    40 |
| True Non-planets      |    60 |

This means ExoTrace catches 49 out of 50 planet examples.

The trade-off is that some non-planets are also flagged for review.

This is acceptable for a candidate screening system because it is better to send possible candidates for expert review than to miss real planet-like signals.

---

## Demo Prediction Example

Example TIC:

```text
TIC 146172354
```

Prediction result:

| Field               | Value                     |
| ------------------- | ------------------------- |
| True Label          | planet                    |
| Predicted Label     | planet                    |
| Decision            | Possible planet candidate |
| Planet Probability  | 49.3%                     |
| Candidate Threshold | 20.0%                     |
| Candidate           | Yes                       |
| Priority            | Medium                    |
| Model               | ExtraTrees                |

Extracted transit features:

| Feature           |       Value |
| ----------------- | ----------: |
| Period            | 3.7800 days |
| Duration          |  3.10 hours |
| Depth             |     0.1898% |
| SNR               |       16.11 |
| Detected Transits |           6 |

---

## Selected Demo Targets

The demo script selects one strong example from each class.

| TIC ID    | True Label       | Predicted Label  | Decision                | Planet Probability | Candidate | Priority |
| --------- | ---------------- | ---------------- | ----------------------- | -----------------: | --------- | -------- |
| 120247528 | planet           | planet           | Strong planet candidate |              87.9% | Yes       | High     |
| 155044736 | false_positive   | false_positive   | Likely false positive   |               9.5% | No        | Low      |
| 2020964   | eclipsing_binary | eclipsing_binary | Likely eclipsing binary |               3.0% | No        | Low      |

---

## Top Planet Candidates

Top candidates from the full batch report:

| TIC ID    | Decision                | Priority | Planet Probability |   Period |   Depth |    SNR |
| --------- | ----------------------- | -------- | -----------------: | -------: | ------: | -----: |
| 388104525 | Strong planet candidate | High     |              89.9% | 2.4997 d | 1.0274% | 115.63 |
| 360742636 | Strong planet candidate | High     |              89.4% | 2.5493 d | 1.1700% | 124.99 |
| 120247528 | Strong planet candidate | High     |              87.9% | 3.5541 d | 0.7562% |  52.09 |
| 355703913 | Strong planet candidate | High     |              86.7% | 2.1055 d | 1.0003% |  21.82 |
| 201604954 | Strong planet candidate | High     |              85.0% | 0.6340 d | 0.7677% |  99.01 |

---

## Dashboard Features

The ExoTrace dashboard shows:

* Dataset overview
* Full batch accuracy
* Candidate recall
* Missed planets
* False alerts
* High priority candidate count
* Candidate screening report
* Available TIC targets by class
* Single TIC prediction
* Class probabilities
* Transit features
* Candidate decision and priority
* Normalized light curve plot
* Detrended light curve plot
* Phase-folded transit curve
* Top planet candidates table

---

## Backend API

The backend is built using FastAPI.

### Start Backend

```bash
python -m uvicorn backend.api_server:app --reload --host 127.0.0.1 --port 8000
```

### Main API Endpoints

| Endpoint                       | Purpose                                                  |
| ------------------------------ | -------------------------------------------------------- |
| `/api/health`                  | Check backend, model, threshold, and report availability |
| `/api/summary`                 | Get project and dataset summary                          |
| `/api/targets`                 | List available TIC targets                               |
| `/api/targets/{label}`         | List targets by class                                    |
| `/api/predict/{tic_id}`        | Predict one TIC light curve                              |
| `/api/report/summary`          | Get full batch report summary                            |
| `/api/report/top-candidates`   | Get top ranked planet candidates                         |
| `/api/report/full-predictions` | Get full prediction records                              |

### Example Prediction API

```text
http://127.0.0.1:8000/api/predict/146172354
```

### Example Report API

```text
http://127.0.0.1:8000/api/report/summary
```

```text
http://127.0.0.1:8000/api/report/top-candidates?limit=10
```

```text
http://127.0.0.1:8000/api/report/full-predictions?limit=10&candidates_only=true
```

---

## Frontend

The frontend is built using React and TanStack Router.

### Start Frontend

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

---

## Important Scripts

| Script                                            | Purpose                                |
| ------------------------------------------------- | -------------------------------------- |
| `backend/step8_extract_features_batch.py`         | Extract BLS and transit features       |
| `backend/step12_train_improved_classifier.py`     | Train and compare improved classifiers |
| `backend/step13_predict_one_lightcurve.py`        | Predict one light curve                |
| `backend/step18_plot_utils.py`                    | Generate dashboard plots               |
| `backend/step19_optimize_planet_threshold.py`     | Optimize planet candidate threshold    |
| `backend/step22_create_demo_predictions.py`       | Create demo predictions                |
| `backend/step23_create_full_prediction_report.py` | Create full batch prediction report    |
| `backend/api_server.py`                           | FastAPI backend server                 |

---

## Generated Files

These files are generated during execution:

```text
backend/outputs/results/demo_predictions.csv
backend/outputs/results/demo_predictions.json
backend/outputs/results/full_predictions.csv
backend/outputs/results/full_predictions.json
backend/outputs/results/full_prediction_summary.json
backend/outputs/results/top_planet_candidates.csv
backend/outputs/plots/
```

These generated files should not be committed to GitHub.

---

## Git Ignore Policy

The project ignores generated outputs and cache files such as:

```text
backend/outputs/
backend/__pycache__/
backend/data/lightcurves/
backend/data/processed/
*.fits
*.fits.gz
*.csv.gz
*.pyc
```

This keeps the GitHub repository clean and avoids uploading large generated astronomy files.

---

## Project Structure

```text
ExoTrace/
├── backend/
│   ├── api_server.py
│   ├── data/
│   ├── models/
│   ├── outputs/
│   ├── step8_extract_features_batch.py
│   ├── step12_train_improved_classifier.py
│   ├── step13_predict_one_lightcurve.py
│   ├── step18_plot_utils.py
│   ├── step19_optimize_planet_threshold.py
│   ├── step22_create_demo_predictions.py
│   └── step23_create_full_prediction_report.py
│
├── src/
│   ├── components/
│   │   ├── ExoTraceDashboard.tsx
│   │   └── LightCurvePlots.tsx
│   ├── lib/
│   │   └── api.ts
│   └── routes/
│       └── index.tsx
│
├── README.md
└── package.json
```

---

## How to Run the Complete Project

### 1. Start backend

```bash
python -m uvicorn backend.api_server:app --reload --host 127.0.0.1 --port 8000
```

### 2. Start frontend

```bash
npm run dev
```

### 3. Open dashboard

```text
http://localhost:5173
```

### 4. Try prediction

Use:

```text
146172354
```

or select a TIC from the available target list.

---

## Result Interpretation

The dashboard gives two different kinds of output:

### 1. Model Prediction

This is the direct machine learning classification.

Example:

```text
predicted_label = planet
```

### 2. Candidate Screening Decision

This uses the optimized planet threshold.

Example:

```text
planet_probability = 49.3%
threshold = 20%
candidate = yes
priority = medium
```

This makes ExoTrace useful as a screening tool for finding possible planet candidates.

---

## Limitations

ExoTrace is a prototype and should not be treated as a final astronomical validation system.

Current limitations:

* The pilot dataset contains only 150 light curves
* Full scientific vetting is not included
* Stellar parameters are not yet used
* Centroid shift analysis is not included
* Real-world false positive validation needs deeper astrophysical checks
* The model should be trained on a larger dataset for production use

---

## Future Improvements

Future versions can include:

* Larger TESS dataset
* CNN or LSTM based light curve models
* Transformer based time-series classification
* Gaia stellar metadata integration
* Centroid shift analysis
* Stellar contamination analysis
* Automated report PDF generation
* Explainable AI feature importance
* Candidate export for astronomer review
* Cloud deployment

---

## Conclusion

ExoTrace demonstrates an end-to-end AI pipeline for exoplanet transit detection from noisy astronomical light curves.

It combines:

* Astronomical signal processing
* BLS transit feature extraction
* Machine learning classification
* Optimized candidate thresholding
* FastAPI backend
* React dashboard visualization

The current system achieves:

```text
Full batch accuracy: 90.0%
Candidate recall: 98.0%
Missed planets: 1 out of 50
```

This makes ExoTrace a strong prototype for AI-assisted exoplanet candidate screening.
