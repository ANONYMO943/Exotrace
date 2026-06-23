# ExoTrace Judge Speaking Script

## 30-Second Pitch

ExoTrace is an AI-enabled exoplanet candidate detection system.

It analyzes noisy TESS light curves and detects possible planet-like transit signals.

The pipeline cleans and detrends the light curve, applies Box Least Squares transit search, extracts scientific features like period, depth, duration, SNR, and number of transits, and then classifies the signal using an ExtraTrees machine learning model.

The system also uses an optimized planet-candidate threshold of 20% to improve recall.

On our balanced pilot dataset of 150 light curves, ExoTrace achieved 90% full batch accuracy and 98% candidate recall.

It detected 49 out of 50 planet examples.

The dashboard shows predictions, candidate priority, transit features, plots, and top ranked planet candidates.

---

## 2-Minute Pitch

Good morning everyone.

Our project is ExoTrace, an AI-enabled system for detecting possible exoplanet candidates from noisy astronomical light curves.

In transit photometry, when a planet passes in front of its host star, the brightness of the star slightly drops.

This small periodic dip can indicate an exoplanet.

But real astronomical light curve data is noisy.

Similar dips can also be caused by false positives, eclipsing binary stars, stellar variability, instrument noise, or contamination from nearby stars.

So the challenge is not only finding a dip, but also deciding whether that dip is planet-like or not.

ExoTrace solves this using an end-to-end AI pipeline.

First, we load TESS light curve data.

Then we clean the data, normalize the flux, and detrend the light curve.

After that, we apply the Box Least Squares algorithm to detect periodic transit-like dips.

From this, we extract important scientific features such as period, transit duration, depth, signal-to-noise ratio, BLS power, number of detected transits, odd-even depth difference, secondary eclipse depth, and V-shape score.

These features are passed into a trained ExtraTrees classifier.

The model classifies each light curve into three classes: planet, false positive, or eclipsing binary.

But for exoplanet discovery, we also need candidate screening.

Missing a real planet candidate is more serious than sending extra candidates for review.

So we optimized a planet probability threshold.

Our selected threshold is 20%.

If a light curve has planet probability greater than or equal to 20%, ExoTrace marks it as a possible planet candidate.

This helps improve recall.

On our balanced pilot dataset of 150 light curves, ExoTrace achieved 90% full batch accuracy and 98% candidate recall.

It detected 49 out of 50 planet examples and missed only one.

Our React dashboard shows the full workflow clearly.

It displays dataset metrics, candidate recall, missed planets, false alerts, single TIC prediction, planet probability, candidate decision, priority, transit features, normalized light curve, detrended light curve, phase-folded curve, and top ranked planet candidates.

ExoTrace is not claiming final astronomical validation.

It is an AI-assisted screening tool that helps reduce manual review effort and prioritize promising exoplanet candidates for further scientific validation.

---

## 5-Minute Demo Flow Script

### 1. Start with the Problem

Exoplanet transits create small dips in star brightness.

But real light curves are noisy.

A dip can come from an exoplanet, an eclipsing binary, a false positive, or noise.

So we need an automated way to detect and rank possible candidates.

---

### 2. Explain the Pipeline

Our pipeline has these steps:

1. Load TESS light curves.
2. Clean invalid flux values.
3. Normalize brightness.
4. Detrend long-term variations.
5. Run Box Least Squares transit search.
6. Extract features.
7. Classify using machine learning.
8. Apply optimized candidate threshold.
9. Show result with plots and dashboard.

---

### 3. Explain Dataset

We used a balanced pilot dataset of 150 light curves.

There are 50 planet examples, 50 false positive examples, and 50 eclipsing binary examples.

This lets us test the model on three important classes.

---

### 4. Explain Metrics

Our held-out test split accuracy is 78%.

Our full batch report accuracy on all 150 light curves is 90%.

Candidate recall is 98%.

This means the screening system detected 49 out of 50 planet examples.

Only one planet was missed.

---

### 5. Explain Why Recall Matters

For exoplanet discovery, recall is very important.

If we miss a real planet candidate, it may never be reviewed.

So we use a lower optimized threshold of 20%.

This catches more possible candidates.

The trade-off is that some false alerts are also sent for review.

That is acceptable for a screening system.

---

### 6. Show Dashboard

The dashboard shows:

* Light curves: 150
* Full batch accuracy: 90%
* Candidate recall: 98%
* Missed planets: 1
* False alerts: 40
* High priority candidates: 24

This gives a quick overview of the system performance.

---

### 7. Run Single Prediction

Now I will run prediction for TIC 146172354.

The system predicts it as planet.

Its planet probability is around 49%.

The optimized threshold is 20%.

So it is marked as a possible planet candidate with medium priority.

---

### 8. Explain Features

The dashboard shows period, duration, depth, SNR, BLS power, and number of detected transits.

These are the scientific features extracted from the light curve.

The model uses these features to classify the signal.

---

### 9. Explain Plots

The dashboard also shows three plots.

The normalized light curve shows brightness over time.

The detrended light curve removes long-term variations.

The phase-folded plot shows the periodic transit pattern more clearly.

These plots make the prediction explainable.

---

### 10. Show Top Candidates

The bottom table shows top planet candidates.

These are ranked by planet probability, confidence, and transit features.

Astronomers can review these high-priority candidates first.

---

## Final Closing Statement

ExoTrace turns noisy starlight into ranked and explainable exoplanet candidate predictions.

It combines astronomical signal processing, BLS feature extraction, machine learning, optimized thresholding, FastAPI backend, and React dashboard visualization.

The current version is a prototype, but it demonstrates a complete AI-assisted candidate screening workflow.

---

## Very Short Answer for Judges

If a judge asks what ExoTrace does, say:

ExoTrace analyzes noisy TESS light curves and ranks possible exoplanet candidates using BLS transit features, machine learning classification, and optimized candidate thresholding.

---

## Answer: Why BLS?

BLS stands for Box Least Squares.

It is useful because exoplanet transits usually look like box-shaped periodic dips in light curves.

So BLS helps estimate period, duration, depth, and transit timing.

---

## Answer: Why ExtraTrees?

ExtraTrees works well for tabular scientific features.

It can handle non-linear relationships between features like period, depth, SNR, and BLS power.

It also trains fast and gives stable results for a prototype dataset.

---

## Answer: Why Candidate Threshold?

The direct model prediction may miss planet candidates.

So we use an optimized planet probability threshold.

If planet probability is above 20%, the system marks it as a candidate.

This improves candidate recall to 98%.

---

## Answer: Why Precision is Lower?

Candidate precision is 55.1% because we prioritized recall.

This means the model sends more objects for review.

For discovery screening, this is acceptable because missing real planets is worse than reviewing extra candidates.

---

## Answer: Is This Final Scientific Validation?

No.

ExoTrace is not final scientific validation.

It is a candidate screening tool.

Final validation would need more checks such as stellar metadata, centroid shift analysis, contamination analysis, and expert review.

---

## Answer: What Is the Best Result?

The most important result is candidate recall of 98%.

The system detected 49 out of 50 planet examples and missed only one.

---

## Answer: What Is the Dashboard Showing?

The dashboard shows:

* Dataset metrics
* Model metrics
* Candidate screening performance
* Single prediction
* Transit features
* Class probabilities
* Light curve plots
* Top planet candidates

---

## Answer: What Is Future Scope?

Future improvements include:

* Larger TESS dataset
* CNN or Transformer time-series model
* Gaia metadata
* Centroid shift validation
* Stellar contamination check
* Automated PDF reports
* Cloud deployment

---

## Final One-Line Tagline

From noisy starlight to ranked exoplanet candidates.
