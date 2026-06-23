# ExoTrace Final Verification Commands

## Purpose

This file contains the final commands to verify that the ExoTrace project is clean, committed, pushed, and ready for hackathon submission.

---

## 1. Go to Project Folder

```cmd
cd /d M:\Project\ExoTrace\Main
```

---

## 2. Check Git Status

```cmd
git status
```

Expected:

```text
nothing to commit, working tree clean
```

If Git shows modified or untracked files, review them before submission.

---

## 3. Check Ignored Files

```cmd
git status --ignored
```

Expected ignored files may include:

```text
backend/outputs/
backend/__pycache__/
backend/data/lightcurves/
backend/data/processed/
```

These should remain ignored.

Do not commit generated files or large astronomy data files.

---

## 4. Check Recent Commits

```cmd
git log --oneline -15
```

You should see commits related to:

```text
README
hackathon pitch
submission checklist
demo recording plan
deployment strategy
dashboard full report
backend report API
prediction report scripts
```

---

## 5. Check Remote Repository

```cmd
git remote -v
```

Expected GitHub remote should point to your ExoTrace repository.

Example:

```text
origin  https://github.com/Spandan-Shah/ExoTrace.git
```

---

## 6. Push Final Changes

```cmd
git push
```

Expected:

```text
Everything up-to-date
```

---

## 7. Start Backend

```cmd
python -m uvicorn backend.api_server:app --reload --host 127.0.0.1 --port 8000
```

Backend URL:

```text
http://127.0.0.1:8000
```

---

## 8. Verify Backend Health

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

---

## 9. Verify Full Report API

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

## 10. Verify Top Candidates API

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

## 11. Verify Single Prediction API

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

## 12. Start Frontend

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

## 13. Verify Dashboard

Open:

```text
http://localhost:5173
```

Expected dashboard metrics:

```text
Light Curves: 150
Full Batch Accuracy: 90.0%
Candidate Recall: 98.0%
Missed Planets: 1
Best Model: ExtraTrees
False Alerts: 40
High Priority: 24
```

---

## 14. Verify Single Prediction on Dashboard

Use TIC ID:

```text
146172354
```

Click:

```text
Predict
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

---

## 15. Verify Light Curve Plots

After prediction, confirm the dashboard shows:

```text
Normalized Light Curve
Detrended Light Curve
Phase-Folded Transit Curve
```

---

## 16. Verify Top Planet Candidates Table

At the bottom of the dashboard, confirm the table shows:

```text
TIC 388104525
TIC 360742636
TIC 120247528
TIC 355703913
TIC 201604954
```

---

## 17. Final Files That Should Exist

Repository documentation files:

```text
README.md
HACKATHON_PITCH.md
PROJECT_SUBMISSION.md
SUBMISSION_CHECKLIST.md
DEMO_RECORDING_PLAN.md
DEPLOYMENT_STRATEGY.md
GITHUB_REPO_POLISH.md
FINAL_VERIFICATION.md
```

Backend important files:

```text
backend/api_server.py
backend/step13_predict_one_lightcurve.py
backend/step18_plot_utils.py
backend/step19_optimize_planet_threshold.py
backend/step22_create_demo_predictions.py
backend/step23_create_full_prediction_report.py
backend/models/best_exotrace_classifier.joblib
backend/models/planet_threshold.json
```

Frontend important files:

```text
src/components/ExoTraceDashboard.tsx
src/components/LightCurvePlots.tsx
src/lib/api.ts
src/routes/index.tsx
```

---

## 18. Files That Should Not Be Committed

Do not commit:

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

These are generated or large files.

---

## 19. Final Submission Ready Checklist

Before submission, confirm:

* GitHub repository is pushed.
* README is visible.
* About description is added.
* Topics are added.
* Backend starts successfully.
* Frontend starts successfully.
* Health API returns all true.
* Dashboard loads.
* Single prediction works.
* Plots show.
* Top candidates table shows.
* Demo video or screenshots are ready.

---

## Final Confirmation Line

If all checks pass, ExoTrace is ready for hackathon submission.
