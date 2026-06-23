# ExoTrace: What to Submit in Hackathon Portal

## Project Title

ExoTrace: AI-enabled Detection of Exoplanets from Noisy Astronomical Light Curves

---

## 1. GitHub Repository Link

Submit your GitHub repository link.

Example:

```text
https://github.com/Spandan-Shah/ExoTrace
```

Make sure the repository is public or accessible to judges.

---

## 2. Short Project Description

Use this in the portal short description box:

```text
ExoTrace is an AI-powered exoplanet candidate screening pipeline that analyzes noisy TESS light curves, extracts BLS transit features, classifies signals using machine learning, applies optimized planet-candidate thresholding, and visualizes predictions through a FastAPI backend and React dashboard.
```

---

## 3. Full Project Abstract

Use this in the detailed description or abstract field:

```text
ExoTrace is an end-to-end AI-based system for detecting possible exoplanet candidates from noisy astronomical light curves.

The project focuses on transit photometry, where an exoplanet passing in front of its host star causes a small periodic dip in brightness. Real astronomical light curves are noisy, and similar dips can also be caused by eclipsing binary stars, false positives, stellar variability, instrumental noise, or contamination.

ExoTrace solves this problem by cleaning and normalizing TESS light curves, detrending long-term variations, applying Box Least Squares transit search, extracting scientific transit features, and classifying each light curve into planet, false positive, or eclipsing binary.

The system uses an ExtraTrees machine learning model and an optimized planet-candidate threshold of 20% to improve candidate recall. On a balanced pilot dataset of 150 light curves, ExoTrace achieved 90.0% full batch accuracy and 98.0% candidate recall, detecting 49 out of 50 planet examples.

The project includes a FastAPI backend and React dashboard that displays dataset metrics, single TIC prediction, candidate priority, class probabilities, transit features, normalized/detrended/phase-folded light curve plots, and top ranked planet candidates.

ExoTrace is designed as an AI-assisted candidate screening tool to help prioritize promising exoplanet candidates for further expert scientific validation.
```

---

## 4. Main Results to Mention

```text
Dataset size: 150 TESS light curves
Classes: planet, false_positive, eclipsing_binary
Best model: ExtraTrees
Held-out test accuracy: 78.0%
Full batch accuracy: 90.0%
Candidate recall: 98.0%
True positive planets: 49 out of 50
Missed planets: 1
False planet alerts: 40
High priority candidates: 24
```

---

## 5. Tech Stack

```text
Python
FastAPI
React
TanStack Router
TypeScript
Pandas
NumPy
Scikit-learn
Astropy / Lightkurve-style light curve processing
Box Least Squares
Matplotlib
Joblib
```

---

## 6. Demo Video Link

Upload your demo video to one of these:

```text
Google Drive
YouTube unlisted
Loom
GitHub release asset
```

Then paste the video link in the hackathon portal.

Recommended video length:

```text
3 to 5 minutes
```

---

## 7. Demo Video Must Show

The demo video should show:

```text
1. Backend running
2. Frontend running
3. Dashboard main metrics
4. Dataset overview
5. Candidate screening report
6. Single prediction for TIC 146172354
7. Transit features
8. Light curve plots
9. Top planet candidates table
10. GitHub repository and README
```

---

## 8. Screenshots to Submit

Submit these screenshots if the portal allows images:

```text
1. GitHub repository homepage
2. Backend health API
3. Full report summary API
4. Dashboard main metrics
5. Candidate screening report
6. Single prediction result
7. Light curve plots
8. Top planet candidates table
```

---

## 9. Main Demo TIC ID

Use:

```text
146172354
```

Expected result:

```text
Predicted label: planet
Decision: Possible planet candidate
Planet probability: 49.3%
Threshold: 20.0%
Candidate: Yes
Priority: medium
```

---

## 10. Strong Demo Examples

| Purpose                  | TIC ID    | Expected Result           |
| ------------------------ | --------- | ------------------------- |
| Medium planet candidate  | 146172354 | Possible planet candidate |
| Strong planet candidate  | 120247528 | Strong planet candidate   |
| False positive example   | 155044736 | Likely false positive     |
| Eclipsing binary example | 2020964   | Likely eclipsing binary   |

---

## 11. Repository Documentation Files

These files should be present in the repository root:

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
```

---

## 12. Important Backend Files

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

---

## 13. Important Frontend Files

```text
src/components/ExoTraceDashboard.tsx
src/components/LightCurvePlots.tsx
src/lib/api.ts
src/routes/index.tsx
```

---

## 14. Final Run Commands

### Start Backend

```cmd
cd /d M:\Project\ExoTrace\Main
python -m uvicorn backend.api_server:app --reload --host 127.0.0.1 --port 8000
```

### Start Frontend

```cmd
cd /d M:\Project\ExoTrace\Main
npm run dev
```

### Open Dashboard

```text
http://localhost:5173
```

---

## 15. Final Git Check

Before submitting, run:

```cmd
git status
git push
```

Expected:

```text
nothing to commit, working tree clean
Everything up-to-date
```

---

## 16. Final Submission Statement

Use this as the final line in the portal:

```text
ExoTrace is an AI-assisted exoplanet candidate screening system that turns noisy TESS light curves into ranked and explainable planet candidate predictions using BLS feature extraction, machine learning, optimized thresholding, and dashboard visualization.
```

---

## 17. Important Honesty Note

Say this clearly if asked:

```text
ExoTrace is a prototype candidate screening system, not a final astronomical validation tool. Final validation would require larger datasets, stellar metadata, centroid shift checks, contamination analysis, and expert review.
```

---

## Final Checklist Before Clicking Submit

```text
GitHub repository link added
Demo video link added
Short description added
Full abstract added
Screenshots uploaded
README visible
Dashboard tested
Backend tested
Frontend tested
Git status clean
```
