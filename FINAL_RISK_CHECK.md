# ExoTrace Final Risk Check Before Submission

## Purpose

This file checks possible risks before final hackathon submission.

The goal is to avoid last-minute problems such as missing model files, accidentally committed generated files, broken API endpoints, or unclear documentation.

---

## 1. Check Git Status

Run:

```cmd
cd /d M:\Project\ExoTrace\Main
git status
```

Expected:

```text
nothing to commit, working tree clean
```

If Git shows modified files, review them before submission.

---

## 2. Check Remote Push Status

Run:

```cmd
git push
```

Expected:

```text
Everything up-to-date
```

---

## 3. Check Ignored Files

Run:

```cmd
git status --ignored
```

Generated files should be ignored:

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

These should not be pushed to GitHub.

---

## 4. Check Required Model Files

Make sure these files exist:

```text
backend/models/best_exotrace_classifier.joblib
backend/models/planet_threshold.json
```

These are important because the backend prediction system depends on them.

---

## 5. Check Required Data Index Files

Make sure these files exist:

```text
backend/data/dataset_index.csv
backend/data/features.csv
```

These are important for target listing and model/report generation.

---

## 6. Check Required Backend Scripts

Make sure these files exist:

```text
backend/api_server.py
backend/step13_predict_one_lightcurve.py
backend/step18_plot_utils.py
backend/step19_optimize_planet_threshold.py
backend/step22_create_demo_predictions.py
backend/step23_create_full_prediction_report.py
```

---

## 7. Check Required Frontend Files

Make sure these files exist:

```text
src/components/ExoTraceDashboard.tsx
src/components/LightCurvePlots.tsx
src/lib/api.ts
src/routes/index.tsx
```

---

## 8. Check Required Documentation Files

Make sure these files exist in repository root:

```text
README.md
HACKATHON_PITCH.md
PROJECT_SUBMISSION.md
SUBMISSION_CHECKLIST.md
DEMO_RECORDING_PLAN.md
DEPLOYMENT_STRATEGY.md
GITHUB_REPO_POLISH.md
FINAL_VERIFICATION.md
JUDGE_SPEAKING_SCRIPT.md
WHAT_TO_SUBMIT.md
FINAL_RISK_CHECK.md
```

---

## 9. Backend Health Risk Check

Start backend:

```cmd
python -m uvicorn backend.api_server:app --reload --host 127.0.0.1 --port 8000
```

Open:

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

If any value is false, fix that before submission.

---

## 10. Report API Risk Check

Open:

```text
http://127.0.0.1:8000/api/report/summary
```

Expected values:

```text
total_predictions = 150
accuracy = 0.9
candidate recall = 0.98
missed planets = 1
false planet alerts = 40
```

---

## 11. Prediction API Risk Check

Open:

```text
http://127.0.0.1:8000/api/predict/146172354
```

Expected values:

```text
predicted_label = planet
decision = Possible planet candidate
planet_probability ≈ 0.493
planet_threshold = 0.2
is_planet_candidate = true
candidate_priority = medium
```

---

## 12. Frontend Risk Check

Start frontend:

```cmd
npm run dev
```

Open:

```text
http://localhost:5173
```

Expected dashboard values:

```text
Light Curves: 150
Full Batch Accuracy: 90.0%
Candidate Recall: 98.0%
Missed Planets: 1
False Alerts: 40
High Priority: 24
Top Planet Candidates table visible
```

---

## 13. Demo Prediction Risk Check

In dashboard, predict:

```text
146172354
```

Expected:

```text
Prediction Result: planet
Decision: Possible planet candidate
Candidate: Yes
Priority: medium
Planet Probability: 49%
Threshold: 20%
```

Also confirm these plots are visible:

```text
Normalized Light Curve
Detrended Light Curve
Phase-Folded Transit Curve
```

---

## 14. GitHub Risk Check

On GitHub, confirm:

```text
README is visible
Repository About description is added
Topics are added
Recent commits are visible
Repository is public or accessible to judges
```

---

## 15. Result Reporting Risk

When explaining results, say clearly:

```text
Held-out test accuracy: 78.0%
Full batch accuracy: 90.0%
Candidate recall: 98.0%
```

Do not say only 90% accuracy without explaining that it is from the full batch report.

This avoids overclaiming.

---

## 16. Scientific Honesty Risk

Say clearly:

```text
ExoTrace is a prototype candidate screening system, not a final astronomical validation tool.
```

Final validation would need:

```text
larger dataset
stellar metadata
centroid shift analysis
contamination checks
expert astrophysical review
```

---

## 17. Final Safe Submission Strategy

Recommended submission:

```text
GitHub repository
Local demo video
Screenshots
README
Project abstract
Pitch script
```

Do not rely on last-minute cloud deployment unless already tested.

---

## Final Risk Status

If all checks pass, ExoTrace is ready for final hackathon submission.
