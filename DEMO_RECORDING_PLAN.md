# ExoTrace Demo Recording Plan

## Goal

This file explains which screenshots and video steps should be captured for the final ExoTrace hackathon submission.

---

## Screenshots to Capture

### Screenshot 1: GitHub Repository Home

Capture the GitHub repository page showing:

* Repository name: ExoTrace
* README visible
* About description
* Topics/tags
* Recent commits

Purpose:

This proves that the project is properly documented and uploaded.

---

### Screenshot 2: Backend Health API

Open:

```text
http://127.0.0.1:8000/api/health
```

Capture output showing:

```text
status: ok
model_available: true
planet_threshold_available: true
dataset_index_available: true
full_report_available: true
top_candidates_available: true
```

Purpose:

This proves backend, model, threshold, dataset, and reports are available.

---

### Screenshot 3: Full Report Summary API

Open:

```text
http://127.0.0.1:8000/api/report/summary
```

Capture important values:

```text
total_predictions: 150
accuracy: 0.9
candidate recall: 0.98
missed planets: 1
false planet alerts: 40
```

Purpose:

This proves full batch prediction report is working.

---

### Screenshot 4: Top Candidates API

Open:

```text
http://127.0.0.1:8000/api/report/top-candidates?limit=10
```

Capture top TIC IDs:

```text
388104525
360742636
120247528
355703913
201604954
```

Purpose:

This proves top candidate ranking is generated.

---

### Screenshot 5: Dashboard Main Metrics

Open:

```text
http://localhost:5173
```

Capture dashboard metrics:

```text
Light Curves: 150
Full Batch Accuracy: 90.0%
Candidate Recall: 98.0%
Missed Planets: 1
Best Model: ExtraTrees
False Alerts: 40
High Priority: 24
```

Purpose:

This shows the final dashboard overview.

---

### Screenshot 6: Dataset and Candidate Screening Report

Capture this section:

```text
Planet: 50
False Positive: 50
Eclipsing Binary: 50
True Positive Planets: 49
True Non-planets: 60
Candidate Precision: 55.1%
Candidate F1: 70.5%
```

Purpose:

This shows class distribution and screening quality.

---

### Screenshot 7: Single Prediction Result

Use TIC ID:

```text
146172354
```

Click Predict.

Capture:

```text
Prediction Result: planet
Decision: Possible planet candidate
Candidate: Yes
Priority: medium
Planet probability: 49%
Threshold: 20%
```

Purpose:

This demonstrates single target prediction.

---

### Screenshot 8: Transit Features

Capture:

```text
Period: 3.7800 d
Duration: 3.10 h
Depth: 0.1898%
SNR: 16.11
BLS Power: 0.0011
Transits: 6
```

Purpose:

This proves explainable scientific features are shown.

---

### Screenshot 9: Light Curve Plots

Capture:

```text
Normalized Light Curve
Detrended Light Curve
Phase-Folded Transit Curve
```

Purpose:

This proves visual light curve analysis is integrated.

---

### Screenshot 10: Top Planet Candidates Table

Capture the table showing:

```text
TIC 388104525
TIC 360742636
TIC 120247528
TIC 355703913
TIC 201604954
```

Purpose:

This proves candidate ranking is visible in frontend.

---

## Demo Video Flow

### Step 1: Start Backend

Show terminal command:

```cmd
python -m uvicorn backend.api_server:app --reload --host 127.0.0.1 --port 8000
```

Say:

The backend is built using FastAPI and serves prediction and report APIs.

---

### Step 2: Start Frontend

Show terminal command:

```cmd
npm run dev
```

Say:

The frontend dashboard is built using React.

---

### Step 3: Open Dashboard

Open:

```text
http://localhost:5173
```

Say:

This is the ExoTrace dashboard for AI-enabled exoplanet transit detection.

---

### Step 4: Explain Main Metrics

Say:

The project uses 150 TESS light curves across three classes.

The full batch accuracy is 90%.

The candidate recall is 98%, meaning the system detected 49 out of 50 planet examples.

---

### Step 5: Explain Candidate Screening

Say:

For exoplanet discovery, recall is very important.

We optimized the planet threshold to 20%.

This helps catch more possible planet candidates for expert review.

---

### Step 6: Run Single Prediction

Enter:

```text
146172354
```

Click Predict.

Say:

The model predicts this TIC as a planet.

Its planet probability is 49.3%, which is above the optimized threshold of 20%.

So the system marks it as a possible planet candidate with medium priority.

---

### Step 7: Explain Features

Say:

The dashboard shows period, duration, depth, SNR, BLS power, and detected transits.

These features are extracted from the light curve and used by the model.

---

### Step 8: Show Plots

Say:

The normalized, detrended, and phase-folded plots help visually inspect the transit signal.

---

### Step 9: Show Top Candidates

Say:

The bottom table ranks the strongest planet candidates from the full batch report.

These can be reviewed first by astronomers.

---

### Step 10: Closing

Say:

ExoTrace is not a final scientific validation system.

It is an AI-assisted screening tool that detects, ranks, and explains possible exoplanet candidates from noisy TESS light curves.

---

## Video Length Target

Recommended demo video duration:

```text
3 to 5 minutes
```

---

## Final Things to Show in Video

Must show:

* Backend running
* Frontend running
* Dashboard metrics
* Single prediction
* Light curve plots
* Top planet candidates table

---

## Final One-Line Pitch

```text
ExoTrace turns noisy starlight into ranked and explainable exoplanet candidate predictions.
```
