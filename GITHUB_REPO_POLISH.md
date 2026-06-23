# GitHub Repository Polish for ExoTrace

## Repository Name

```text
ExoTrace
```

---

## Short Repository Description

```text
AI-powered exoplanet transit detection pipeline using TESS light curves, BLS features, ML classification, FastAPI, and React dashboard.
```

---

## GitHub About Section

Use this in the GitHub repository **About** description:

```text
ExoTrace detects, ranks, and explains possible exoplanet candidates from noisy TESS light curves using BLS feature extraction, machine learning, optimized candidate thresholding, FastAPI backend, and React dashboard visualization.
```

---

## Suggested GitHub Topics

Add these topics in GitHub:

```text
exoplanet
machine-learning
astronomy
tess
lightcurve
fastapi
react
bls
data-science
space-tech
time-series
hackathon
```

---

## Website Field

Use this only if frontend is deployed.

If not deployed, keep website blank.

---

## Final README Highlights

Make sure README clearly shows:

```text
Full batch accuracy: 90.0%
Candidate recall: 98.0%
True positive planets: 49 out of 50
Missed planets: 1
Best model: ExtraTrees
Backend: FastAPI
Frontend: React
```

---

## Final Demo TIC ID

Use this TIC ID during demo:

```text
146172354
```

Expected output:

```text
Predicted label: planet
Decision: Possible planet candidate
Planet probability: 49.3%
Threshold: 20.0%
Candidate: Yes
Priority: medium
```

---

## Strong Demo Targets

Use these for explanation:

| Purpose                  | TIC ID    | Expected Result           |
| ------------------------ | --------- | ------------------------- |
| Medium planet candidate  | 146172354 | Possible planet candidate |
| Strong planet candidate  | 120247528 | Strong planet candidate   |
| False positive example   | 155044736 | Likely false positive     |
| Eclipsing binary example | 2020964   | Likely eclipsing binary   |

---

## Final Project Tagline

```text
From noisy starlight to ranked exoplanet candidates.
```

---

## Final Project Summary

ExoTrace is an end-to-end AI pipeline for exoplanet candidate screening.

It processes noisy TESS light curves, extracts transit features using Box Least Squares, classifies signals using a trained ExtraTrees model, applies an optimized planet-candidate threshold, and visualizes predictions through a React dashboard.

The system achieved 90.0% full batch accuracy and 98.0% candidate recall on a balanced pilot dataset of 150 light curves.

It detected 49 out of 50 planet examples, missing only one.

ExoTrace is designed as an AI-assisted screening tool that helps prioritize promising exoplanet candidates for further scientific review.

---

## GitHub README First Impression Checklist

Before submission, confirm:

* README is visible on GitHub repository homepage.
* Project title is clear.
* Problem statement is understandable.
* Run commands are included.
* Backend and frontend are explained.
* Results are shown honestly.
* Difference between held-out test accuracy and full batch accuracy is mentioned.
* Screenshots can be added later if available.
* Generated data and outputs are ignored.
* Repository has clean commit history.
* Repository is public or accessible to judges.

---

## Final Repository Quality Checklist

Run:

```cmd
git status
```

Expected:

```text
nothing to commit, working tree clean
```

Run:

```cmd
git log --oneline -10
```

Check that documentation commits are visible.

Run backend:

```cmd
python -m uvicorn backend.api_server:app --reload --host 127.0.0.1 --port 8000
```

Run frontend:

```cmd
npm run dev
```

Open:

```text
http://localhost:5173
```

Confirm dashboard loads successfully.

---

## Final Notes for Judges

ExoTrace is a prototype.

It is not claiming final astronomical validation.

It is designed to reduce manual review effort by detecting, ranking, and explaining likely exoplanet candidates.

Further validation should include stellar metadata, centroid analysis, contamination checks, and expert review.
