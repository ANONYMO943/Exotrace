from pathlib import Path
import json

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from astropy.timeseries import BoxLeastSquares


BASE_DIR = Path(__file__).resolve().parent

PROCESSED_DIR = BASE_DIR / "data" / "processed"
OUTPUT_DIR = BASE_DIR / "outputs"
PLOT_DIR = OUTPUT_DIR / "plots"
RESULT_DIR = OUTPUT_DIR / "results"

PLOT_DIR.mkdir(parents=True, exist_ok=True)
RESULT_DIR.mkdir(parents=True, exist_ok=True)


def robust_std(values):
    """
    Robust noise estimate using Median Absolute Deviation.
    """
    values = np.asarray(values)
    median = np.nanmedian(values)
    mad = np.nanmedian(np.abs(values - median))

    if mad == 0 or np.isnan(mad):
        return np.nanstd(values)

    return 1.4826 * mad


def load_first_processed_lightcurve():
    """
    Loads the first clean/detrended CSV from backend/data/processed.
    """
    files = sorted(PROCESSED_DIR.glob("*_clean_detrended.csv"))

    if not files:
        raise FileNotFoundError(
            f"No processed files found in {PROCESSED_DIR}. Run Step 6 first."
        )

    file_path = files[0]
    tic_id = file_path.stem.replace("TIC_", "").replace("_clean_detrended", "")

    print(f"Loading processed light curve:")
    print(file_path)
    print(f"TIC ID: {tic_id}")

    df = pd.read_csv(file_path)

    required_columns = ["time", "detrended_flux"]

    for col in required_columns:
        if col not in df.columns:
            raise ValueError(f"Missing column: {col}. Available columns: {list(df.columns)}")

    df = df[["time", "detrended_flux"]].copy()
    df = df.replace([np.inf, -np.inf], np.nan)
    df = df.dropna()
    df = df.sort_values("time").reset_index(drop=True)

    return df, tic_id


def run_bls_detection(df):
    """
    Runs Box Least Squares transit search.
    """

    time = df["time"].values
    flux = df["detrended_flux"].values

    # Normalize around median = 1 again for safety
    flux = flux / np.nanmedian(flux)

    baseline = np.nanmax(time) - np.nanmin(time)

    print(f"Time baseline: {baseline:.2f} days")

    # Period range:
    # minimum 0.5 days, maximum either 20 days or half of baseline
    min_period = 0.5
    max_period = min(20.0, baseline / 2)

    if max_period <= min_period:
        max_period = baseline * 0.8

    # Transit duration range in days
    # 0.03 days = 43 minutes
    # 0.30 days = 7.2 hours
    durations = np.linspace(0.03, 0.30, 20)

    print(f"Searching periods from {min_period:.2f} to {max_period:.2f} days")
    print(f"Testing {len(durations)} transit durations")

    bls = BoxLeastSquares(time, flux)

    periodogram = bls.autopower(
        durations,
        minimum_period=min_period,
        maximum_period=max_period,
        frequency_factor=5
    )

    power = np.asarray(periodogram.power)
    best_index = int(np.nanargmax(power))

    best_period = float(np.asarray(periodogram.period)[best_index])
    best_duration = float(np.asarray(periodogram.duration)[best_index])
    best_t0 = float(np.asarray(periodogram.transit_time)[best_index])

    print("\nBest BLS result:")
    print(f"Period: {best_period:.6f} days")
    print(f"Duration: {best_duration:.6f} days")
    print(f"Transit time t0: {best_t0:.6f}")

    # Transit mask
    in_transit = bls.transit_mask(
        time,
        period=best_period,
        duration=best_duration,
        transit_time=best_t0
    )

    out_transit = ~in_transit

    if np.sum(in_transit) < 5:
        print("Warning: Very few in-transit points found.")

    median_out = np.nanmedian(flux[out_transit])
    median_in = np.nanmedian(flux[in_transit])

    depth = float(median_out - median_in)
    depth_percent = depth * 100

    noise = robust_std(flux[out_transit])

    if noise <= 0 or np.isnan(noise):
        snr = 0.0
    else:
        snr = float(depth * np.sqrt(np.sum(in_transit)) / noise)

    bls_power = float(power[best_index])

    # Simple confidence score for now
    # Later we will improve it using classification model.
    confidence = min(0.99, max(0.0, snr / 20))

    result = {
        "best_period_days": best_period,
        "best_duration_days": best_duration,
        "best_duration_hours": best_duration * 24,
        "transit_time": best_t0,
        "depth": depth,
        "depth_percent": depth_percent,
        "snr": snr,
        "bls_power": bls_power,
        "confidence": confidence,
        "n_points": int(len(time)),
        "n_in_transit_points": int(np.sum(in_transit)),
        "period_search_min_days": min_period,
        "period_search_max_days": max_period,
    }

    return result, periodogram, in_transit


def plot_periodogram(periodogram, result, tic_id):
    """
    Saves BLS periodogram plot.
    """

    periods = np.asarray(periodogram.period)
    power = np.asarray(periodogram.power)

    plt.figure(figsize=(12, 5))
    plt.plot(periods, power, linewidth=1)
    plt.axvline(result["best_period_days"], linestyle="--")
    plt.xlabel("Period (days)")
    plt.ylabel("BLS Power")
    plt.title(f"BLS Periodogram | TIC {tic_id}")
    plt.tight_layout()

    output_file = PLOT_DIR / f"TIC_{tic_id}_bls_periodogram.png"
    plt.savefig(output_file, dpi=200)
    plt.close()

    print(f"BLS periodogram plot saved: {output_file}")


def plot_phase_folded(df, result, tic_id):
    """
    Saves phase-folded light curve plot.
    """

    time = df["time"].values
    flux = df["detrended_flux"].values
    flux = flux / np.nanmedian(flux)

    period = result["best_period_days"]
    t0 = result["transit_time"]

    phase = ((time - t0 + 0.5 * period) % period) / period - 0.5

    # Sort by phase
    order = np.argsort(phase)
    phase = phase[order]
    flux = flux[order]

    plt.figure(figsize=(12, 5))
    plt.scatter(phase, flux, s=2, alpha=0.5)
    plt.axvline(0, linestyle="--")
    plt.xlabel("Phase")
    plt.ylabel("Detrended Flux")
    plt.title(
        f"Phase-Folded Light Curve | TIC {tic_id} | "
        f"P={period:.4f} d | SNR={result['snr']:.2f}"
    )
    plt.tight_layout()

    output_file = PLOT_DIR / f"TIC_{tic_id}_phase_folded.png"
    plt.savefig(output_file, dpi=200)
    plt.close()

    print(f"Phase-folded plot saved: {output_file}")

    # Save phase folded CSV also
    phase_df = pd.DataFrame({
        "phase": phase,
        "flux": flux
    })

    phase_csv = RESULT_DIR / f"TIC_{tic_id}_phase_folded.csv"
    phase_df.to_csv(phase_csv, index=False)

    print(f"Phase-folded CSV saved: {phase_csv}")


def main():
    df, tic_id = load_first_processed_lightcurve()

    result, periodogram, in_transit = run_bls_detection(df)

    print("\nFinal detected parameters:")
    print(f"Orbital period: {result['best_period_days']:.6f} days")
    print(f"Transit duration: {result['best_duration_hours']:.3f} hours")
    print(f"Transit depth: {result['depth_percent']:.4f}%")
    print(f"SNR: {result['snr']:.3f}")
    print(f"BLS power: {result['bls_power']:.3f}")
    print(f"Confidence: {result['confidence']:.3f}")

    plot_periodogram(periodogram, result, tic_id)
    plot_phase_folded(df, result, tic_id)

    result_file = RESULT_DIR / f"TIC_{tic_id}_bls_result.json"

    with open(result_file, "w") as f:
        json.dump(result, f, indent=4)

    print(f"\nBLS result JSON saved:")
    print(result_file)

    print("\nStep 7 completed successfully.")


if __name__ == "__main__":
    main()