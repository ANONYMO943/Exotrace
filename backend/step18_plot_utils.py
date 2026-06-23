from pathlib import Path

import matplotlib
matplotlib.use("Agg")

import matplotlib.pyplot as plt
import numpy as np

from step8_extract_features_batch import clean_and_detrend_lightcurve


BASE_DIR = Path(__file__).resolve().parent
PLOT_DIR = BASE_DIR / "outputs" / "plots"

PLOT_DIR.mkdir(parents=True, exist_ok=True)


def generate_prediction_plots(file_path, tic_id, true_label, features):
    """
    Generates dashboard-ready plots for one prediction.
    Returns local plot file paths.
    """

    lc = clean_and_detrend_lightcurve(file_path)

    time = lc["time"].values
    normalized_flux = lc["normalized_flux"].values
    detrended_flux = lc["detrended_flux"].values

    period = float(features["period_days"])
    t0 = float(features["transit_time"])

    output_files = {}

    # Plot 1: Normalized light curve
    normalized_plot = PLOT_DIR / f"TIC_{tic_id}_normalized_dashboard.png"

    plt.figure(figsize=(12, 4.5))
    plt.scatter(time, normalized_flux, s=2, alpha=0.6)
    plt.xlabel("Time")
    plt.ylabel("Normalized Flux")
    plt.title(f"Normalized Light Curve | TIC {tic_id} | {true_label}")
    plt.tight_layout()
    plt.savefig(normalized_plot, dpi=180)
    plt.close()

    output_files["normalized"] = normalized_plot

    # Plot 2: Detrended light curve
    detrended_plot = PLOT_DIR / f"TIC_{tic_id}_detrended_dashboard.png"

    plt.figure(figsize=(12, 4.5))
    plt.scatter(time, detrended_flux, s=2, alpha=0.6)
    plt.xlabel("Time")
    plt.ylabel("Detrended Flux")
    plt.title(f"Detrended Light Curve | TIC {tic_id}")
    plt.tight_layout()
    plt.savefig(detrended_plot, dpi=180)
    plt.close()

    output_files["detrended"] = detrended_plot

    # Plot 3: Phase-folded light curve
    phase = ((time - t0 + 0.5 * period) % period) / period - 0.5

    order = np.argsort(phase)
    phase = phase[order]
    phase_flux = detrended_flux[order]

    phase_plot = PLOT_DIR / f"TIC_{tic_id}_phase_folded_dashboard.png"

    plt.figure(figsize=(12, 4.5))
    plt.scatter(phase, phase_flux, s=2, alpha=0.5)
    plt.axvline(0, linestyle="--")
    plt.xlabel("Phase")
    plt.ylabel("Detrended Flux")
    plt.title(
        f"Phase-Folded Light Curve | TIC {tic_id} | "
        f"P={period:.4f} days"
    )
    plt.tight_layout()
    plt.savefig(phase_plot, dpi=180)
    plt.close()

    output_files["phase_folded"] = phase_plot

    return output_files