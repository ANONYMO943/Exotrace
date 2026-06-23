# ExoTrace Deployment and Submission Strategy

## Current Recommended Submission Strategy

For this hackathon version, the recommended strategy is:

```text
GitHub Repository + Local Demo Video + Screenshots
```

This is the safest option because ExoTrace currently depends on:

* Local trained model files
* Local generated report files
* Local light curve data
* FastAPI backend
* React frontend
* Generated plots

So instead of rushing cloud deployment, the best approach is to submit a clean GitHub repository, README, pitch document, screenshots, and a demo recording.

---

## Recommended Final Submission Package

Submit these:

1. GitHub repository link
2. README.md
3. HACKATHON_PITCH.md
4. PROJECT_SUBMISSION.md
5. SUBMISSION_CHECKLIST.md
6. DEMO_RECORDING_PLAN.md
7. Demo video
8. Dashboard screenshots

---

## Local Demo Setup

### Start Backend

```cmd
cd /d M:\Project\ExoTrace\Main
python -m uvicorn backend.api_server:app --reload --host 127.0.0.1 --port 8000
```

Backend URL:

```text
http://127.0.0.1:8000
```

---

### Start Frontend

Open a second terminal.

```cmd
cd /d M:\Project\ExoTrace\Main
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

---

## Required Backend Checks

Before recording or presenting, check:

```text
http://127.0.0.1:8000/api/health
```

Expected:

```json
{
  "status": "ok",
  "backend": "FastAPI",
  "model_available": true,
  "planet_threshold_available": true,
  "dataset_index_available": true,
  "full_report_available": true,
  "top_candidates_available": true
}
```

Then check:

```text
http://127.0.0.1:8000/api/report/summary
```

Expected important values:

```text
total_predictions = 150
accuracy = 0.9
candidate recall = 0.98
missed planets = 1
false planet alerts = 40
```

---

## Why Local Demo is Better for Current Version

Cloud deployment is possible, but not recommended for the current hackathon version because:

* Astronomy data files can be large.
* Generated plots and CSV reports are local.
* Model and threshold files must be included correctly.
* Backend and frontend need environment configuration.
* Deployment may take extra time and create last-minute errors.
* A local demo is stable and already working.

So for final submission, a local recorded demo is safer.

---

## Optional Deployment Path Later

If deployment is needed later, use this plan:

### Frontend Deployment

Frontend can be deployed on:

* Vercel
* Netlify
* GitHub Pages

But the API base URL must be changed from:

```text
http://127.0.0.1:8000
```

to the deployed backend URL.

File to update:

```text
src/lib/api.ts
```

---

### Backend Deployment

Backend can be deployed on:

* Render
* Railway
* Hugging Face Spaces
* Google Cloud Run
* AWS EC2

Backend must include:

```text
backend/api_server.py
backend/models/best_exotrace_classifier.joblib
backend/models/planet_threshold.json
backend/data/dataset_index.csv
backend/data/features.csv
```

If the light curve files are ignored by Git, they must be uploaded separately or regenerated.

---

## Recommended Deployment Warning

Do not deploy at the last minute unless everything is already tested.

For this submission, use:

```text
Local working demo + GitHub repo + screenshots + video
```

This is reliable and judge-friendly.

---

## Final Local Demo Flow

1. Start backend.
2. Open `/api/health`.
3. Open `/api/report/summary`.
4. Start frontend.
5. Open dashboard.
6. Show full metrics.
7. Run prediction for TIC 146172354.
8. Show plots.
9. Show top candidates table.
10. Explain that ExoTrace is an AI-assisted screening tool.

---

## Final Statement for Submission

ExoTrace is submitted as a locally runnable full-stack AI prototype.

It includes:

* FastAPI backend
* React frontend
* Trained ExtraTrees model
* Optimized candidate threshold
* Full batch report
* Top candidates ranking
* Light curve visualization
* Complete documentation

The system is ready for local demonstration and further expansion into cloud deployment.
