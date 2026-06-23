# ExoTrace Hackathon Pitch Script

## Project Title

ExoTrace: AI-enabled Detection of Exoplanets from Noisy Astronomical Light Curves

---

## 1-Minute Pitch

Good morning everyone.

Our project is ExoTrace, an AI-based pipeline for detecting possible exoplanet transits from noisy astronomical light curve data.

Exoplanets are often detected using transit photometry.

When a planet passes in front of its host star, the star brightness slightly drops.

But in real astronomical data, these dips are very small and noisy.

Similar brightness dips can also come from eclipsing binary stars, false positives, stellar noise, or instrument effects.

So the main challenge is not only finding dips, but also separating real planet-like candidates from confusing signals.

ExoTrace solves this by building an end-to-end pipeline.

It cleans and detrends TESS light curves, applies Box Least Squares transit search, extracts scientific transit features, classifies the signal using a machine learning model, and then applies an optimized planet-candidate threshold.

Our dashboard shows the prediction, planet probability, candidate priority, transit features, and light curve visualizations.

On our pilot dataset of 150 light curves, ExoTrace achieved 90% full batch accuracy and 98% candidate recall.

It detected 49 out of 50 planet examples, missing only 1 planet.

This makes ExoTrace useful as an AI-assisted screening tool for identifying possible exoplanet candidates for further expert review.

---

## 3-Minute Detailed Pitch

Good morning everyone.

We are presenting ExoTrace, an AI-enabled exoplanet transit detection system.

The problem we are solving is exoplanet detection from noisy astronomical light curves.

A light curve shows the brightness of a star over time.

When an exoplanet crosses in front of its host star, the brightness drops slightly for a short duration.

This is called a transit.

But real light curve data is noisy.

A dip in brightness does not always mean a planet.

It can also be caused by eclipsing binary stars, false positives, background contamination, detector noise, or stellar activity.

So our goal is to build a pipeline that can automatically detect periodic transit-like signals and classify them properly.

Our system follows a complete machine learning workflow.

First, we collect TESS light curve data.

Then we clean invalid flux values and normalize the flux.

After that, we detrend the light curve to remove long-term brightness variations.

Then we apply the Box Least Squares algorithm to search for periodic transit-like dips.

From this, we extract important features such as period, duration, depth, signal-to-noise ratio, BLS power, number of detected transits, odd-even depth difference, secondary eclipse depth, and V-shape score.

These features are then passed to a machine learning classifier.

The best model selected in our pipeline is an ExtraTrees classifier.

Our system classifies each light curve into three classes:

planet, false positive, and eclipsing binary.

But for exoplanet discovery, we do not only want classification.

We also want candidate screening.

Missing a real planet candidate is more serious than sending some extra candidates for review.

So we optimized a planet probability threshold.

Our selected threshold is 20%.

If the planet probability is greater than or equal to 20%, ExoTrace marks it as a possible planet candidate.

This improved our candidate recall to 98%.

In our full batch report of 150 light curves, ExoTrace achieved 90% accuracy.

For candidate screening, it detected 49 out of 50 planet examples and missed only 1 planet.

The frontend dashboard shows the complete result.

It displays dataset summary, model metrics, candidate recall, missed planets, false alerts, available TIC targets, single prediction, class probabilities, transit features, normalized light curve, detrended light curve, phase-folded curve, and top planet candidates.

For example, for TIC 146172354, ExoTrace predicts it as a planet with 49.3% planet probability.

Since this is above the optimized threshold of 20%, it marks it as a possible planet candidate with medium priority.

In conclusion, ExoTrace is an end-to-end prototype that combines astronomical signal processing, BLS feature extraction, machine learning, threshold-based candidate screening, FastAPI backend, and React dashboard visualization.

It can act as an AI-assisted screening tool for prioritizing exoplanet candidates for further scientific review.

---

## Demo Flow

### Step 1: Open Dashboard

Open the frontend dashboard.

Show the title:

ExoTrace: AI-enabled Exoplanet Transit Detection.

Explain that the dashboard is connected to the FastAPI backend.

---

### Step 2: Show Overall Metrics

Point to these metrics:

* Light Curves: 150
* Full Batch Accuracy: 90.0%
* Candidate Recall: 98.0%
* Missed Planets: 1
* False Alerts: 40
* High Priority Candidates: 24

Say:

These metrics come from the full batch report generated on all 150 light curves.

---

### Step 3: Explain Dataset

Show the class counts:

* Planet: 50
* False Positive: 50
* Eclipsing Binary: 50

Say:

We used a balanced pilot dataset with three classes.

---

### Step 4: Explain Candidate Screening

Show:

* True Positive Planets: 49
* True Non-planets: 60
* Candidate Precision: 55.1%
* Candidate F1: 70.5%

Say:

For discovery-style screening, recall is very important.

Our model catches 49 out of 50 planet examples.

---

### Step 5: Run Single Prediction

Use this TIC ID:

```text
146172354
```

Click Predict.

Show:

* Predicted label: planet
* Decision: Possible planet candidate
* Planet probability: 49.3%
* Threshold: 20%
* Candidate: Yes
* Priority: Medium

Say:

The model probability is above the optimized threshold, so the system marks it as a planet candidate.

---

### Step 6: Explain Transit Features

Show:

* Period
* Duration
* Depth
* SNR
* BLS Power
* Number of transits

Say:

These features are extracted using the BLS transit search and are used for classification.

---

### Step 7: Show Light Curve Plots

Show:

* Normalized Light Curve
* Detrended Light Curve
* Phase-Folded Transit Curve

Say:

These plots help visually verify the detected transit pattern.

---

### Step 8: Show Top Planet Candidates

Scroll to the Top Planet Candidates table.

Show the top TIC IDs:

* 388104525
* 360742636
* 120247528
* 355703913
* 201604954

Say:

These are the highest ranked candidates based on planet probability, confidence, and transit features.

---

## Important Results to Say

```text
Full batch accuracy: 90.0%
Candidate recall: 98.0%
Missed planets: 1 out of 50
True positive planets: 49
High priority candidates: 24
```

Also say:

The held-out test split accuracy was 78%, while the 90% result is the full batch report on all 150 light curves.

This distinction is important for honest reporting.

---

## Strong Closing Line

ExoTrace does not claim final scientific validation.

Instead, it acts as an AI-assisted candidate screening system.

It helps reduce manual search effort by ranking possible planet candidates and providing explainable transit features and plots for further expert review.

---

## Possible Questions and Answers

### Q1. Why did you use BLS?

BLS means Box Least Squares.

It is commonly used for detecting box-shaped periodic dips in light curves.

Planet transits usually look like small periodic dips, so BLS is suitable for this task.

---

### Q2. Why did you use thresholding?

Only using the highest predicted class may miss planet candidates.

In astronomy, missing a real candidate is risky.

So we optimized a planet probability threshold to improve candidate recall.

---

### Q3. Why is precision only 55.1%?

Because we prioritized recall.

The system is designed as a screening tool.

It is better to flag some extra candidates for review than to miss real planet-like signals.

---

### Q4. What does candidate recall 98% mean?

It means the system detected 49 out of 50 true planet examples as candidates.

Only 1 planet was missed.

---

### Q5. Is this production ready?

No.

This is a prototype.

For production, we need a larger dataset, stellar metadata, centroid checks, contamination analysis, and more astrophysical validation.

---

### Q6. What is the role of the dashboard?

The dashboard makes the ML output understandable.

It shows prediction, confidence, candidate decision, threshold, features, plots, and top candidates.

---

### Q7. What is the main innovation?

The main strength is the complete end-to-end pipeline.

It combines light curve preprocessing, BLS feature extraction, ML classification, optimized candidate thresholding, API backend, and frontend visualization.

---

## Final One-Line Summary

ExoTrace is an end-to-end AI pipeline that detects, ranks, and explains possible exoplanet candidates from noisy TESS light curves.
