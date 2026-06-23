# ExoTrace Final Submission Checklist

## Project Name

ExoTrace
AI-enabled Detection of Exoplanets from Noisy Astronomical Light Curves

---

## Final Demo Commands

### 1. Go to project folder

```cmd
cd /d M:\Project\ExoTrace\Main
```

---

### 2. Start Backend

```cmd
python -m uvicorn backend.api_server:app --reload --host 127.0.0.1 --port 8000
```

Backend URL:

```text
http://127.0.0.1:8000
```

---

### 3. Test Backend Health

Open:

```text
http://127.0.0.1:8000/api/health
```

Expected important values:

```json
"model_available": true
"planet_threshold_available": true
"dataset_index_available": true
"full_report_available": true
"top_candidates_available": true
```

---

### 4. Test Single Prediction API

Open:

```text
http://127.0.0.1:8000/api/predict/146172354
```

Expected:

```text
predicted_label = planet
decision = Possible planet candidate
planet_probability ≈ 0.493
planet_threshold = 0.2
is_planet_candidate = true
candidate_priority = medium
```

---

### 5. Test Full Report API

Open:

```text
http://127.0.0.1:8000/api/report/summary
```

Expected:

```text
total_predictions = 150
accuracy = 0.900
candidate recall = 0.980
missed planets = 1
false planet alerts = 40
```

---

### 6. Test Top Candidates API

Open:

```text
http://127.0.0.1:8000/api/report/top-candidates?limit=10
```

Expected top candidates include:

```text
TIC 388104525
TIC 360742636
TIC 120247528
TIC 355703913
TIC 201604954
```

---

### 7. Start Frontend

Open a second terminal.

Run:

```cmd
cd /d M:\Project\ExoTrace\Main
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

---

## Dashboard Demo Flow

### Step 1: Show Header

Say:

ExoTrace is an AI-based pipeline for detecting possible exoplanet transits from noisy TESS light curves.

---

### Step 2: Show Main Metrics

Point to:

```text
Light Curves: 150
Full Batch Accuracy: 90.0%
Candidate Recall: 98.0%
Missed Planets: 1
Best Model: ExtraTrees
False Alerts: 40
High Priority: 24
```

Say:

The system catches 49 out of 50 planet examples.

---

### Step 3: Show Dataset

Point to:

```text
Planet: 50
False Positive: 50
Eclipsing Binary: 50
```

Say:

We used a balanced pilot dataset with three classes.

---

### Step 4: Show Candidate Screening Report

Point to:

```text
True Positive Planets: 49
True Non-planets: 60
Candidate Precision: 55.1%
Candidate F1: 70.5%
```

Say:

The threshold was optimized to improve planet candidate recall.

---

### Step 5: Run Prediction

Use:

```text
146172354
```

Click:

```text
Predict
```

Expected dashboard result:

```text
Predicted Label: planet
Decision: Possible planet candidate
Candidate: Yes
Priority: medium
Planet Probability: 49%
Threshold: 20%
```

---

### Step 6: Explain Features

Point to:

```text
Period
Duration
Depth
SNR
BLS Power
Transits
```

Say:

These are transit features extracted from the light curve using BLS.

---

### Step 7: Show Plots

Show:

```text
Normalized Light Curve
Detrended Light Curve
Phase-Folded Transit Curve
```

Say:

These plots help visually understand the transit signal.

---

### Step 8: Show Top Candidates

Scroll to:

```text
Top Planet Candidates
```

Point to:

```text
TIC 388104525
TIC 360742636
TIC 120247528
```

Say:

These are the strongest planet candidates ranked by planet probability and transit features.

---

## Final Results to Remember

```text
Held-out test accuracy: 78.0%
Full batch accuracy: 90.0%
Candidate recall: 98.0%
True positive planets: 49
Missed planets: 1
False alerts: 40
High priority candidates: 24
```

Important explanation:

The 78% accuracy is from the held-out test split.

The 90% accuracy is from the full batch report on all 150 available light curves.

---

## Files to Mention

Important backend files:

```text
backend/api_server.py
backend/step13_predict_one_lightcurve.py
backend/step18_plot_utils.py
backend/step19_optimize_planet_threshold.py
backend/step22_create_demo_predictions.py
backend/step23_create_full_prediction_report.py
```

Important frontend files:

```text
src/components/ExoTraceDashboard.tsx
src/components/LightCurvePlots.tsx
src/lib/api.ts
src/routes/index.tsx
```

Documentation files:

```text
README.md
HACKATHON_PITCH.md
SUBMISSION_CHECKLIST.md
```

---

## GitHub Submission Checklist

Before final submission, run:

```cmd
git status
```

Good output:

```text
nothing to commit, working tree clean
```

Do not commit:

```text
backend/outputs/
backend/__pycache__/
backend/data/lightcurves/
backend/data/processed/
*.fits
*.fits.gz
*.csv.gz
```

These are generated files or large data files.

---

## Final Git Commands

```cmd
git status
git add ..\SUBMISSION_CHECKLIST.md
git commit -m "docs: add final submission checklist"
git push
```

---

## Final Presentation Closing Line

ExoTrace is not claiming final scientific validation.

It is an AI-assisted candidate screening system that detects, ranks, and explains possible exoplanet candidates from noisy TESS light curves.

It helps reduce manual review effort and provides interpretable transit features and plots for further expert validation.
