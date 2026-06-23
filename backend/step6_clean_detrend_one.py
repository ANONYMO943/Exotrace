from pathlib import Path

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from scipy.signal import savgol_filter


BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent

DATASET_INDEX = BASE_DIR / "data" / "dataset_index.csv"
PLOT_DIR = BASE_DIR / "outputs" / "plots"
PROCESSED_DIR = BASE_DIR / "data" / "processed"

PLOT_DIR.mkdir(parents=True, exist_ok=True)
PROCESSED_DIR.mkdir(parents=True, exist_ok=True)


def find_column(df, possible_names):
    """
    Finds a column by checking possible names in lowercase.
    """
    lower_map = {col.lower(): col for col in df.columns}

    for name in possible_names:
        if name.lower() in lower_map:
            return lower_map[name.lower()]

    return None


def load_one_lightcurve():
    """
    Loads the first light curve from dataset_index.csv.
    """
    index_df = pd.read_csv(DATASET_INDEX)

    if len(index_df) == 0:
        raise ValueError("dataset_index.csv is empty.")

    row = index_df.iloc[0]

    file_path = PROJECT_ROOT / row["file_path"]
    tic_id = str(row["tic_id"])
    label = str(row["label"])

    print(f"Loading TIC {tic_id}")
    print(f"Label: {label}")
    print(f"File: {file_path}")

    df = pd.read_csv(file_path)

    return df, tic_id, label


def prepare_lightcurve(df):
    """
    Cleans and detrends one light curve.
    """

    # Try to find time column
    time_col = find_column(df, ["time", "TIME"])

    # Try to find flux column
    flux_col = find_column(df, ["flux", "PDCSAP_FLUX", "SAP_FLUX", "sap_flux", "pdcsap_flux"])

    if time_col is None:
        raise ValueError(f"Could not find time column. Available columns: {list(df.columns)}")

    if flux_col is None:
        raise ValueError(f"Could not find flux column. Available columns: {list(df.columns)}")

    print(f"Using time column: {time_col}")
    print(f"Using flux column: {flux_col}")

    clean_df = df[[time_col, flux_col]].copy()
    clean_df.columns = ["time", "flux"]

    # Convert to numeric
    clean_df["time"] = pd.to_numeric(clean_df["time"], errors="coerce")
    clean_df["flux"] = pd.to_numeric(clean_df["flux"], errors="coerce")

    # Remove NaN and infinite values
    clean_df = clean_df.replace([np.inf, -np.inf], np.nan)
    clean_df = clean_df.dropna(subset=["time", "flux"])

    # Sort by time
    clean_df = clean_df.sort_values("time").reset_index(drop=True)

    # Remove extreme outliers using median absolute deviation
    median_flux = np.median(clean_df["flux"])
    mad = np.median(np.abs(clean_df["flux"] - median_flux))

    if mad > 0:
        sigma_like = 0.6745 * (clean_df["flux"] - median_flux) / mad
        clean_df = clean_df[np.abs(sigma_like) < 8].reset_index(drop=True)

    # Normalize flux around 1
    median_flux = np.median(clean_df["flux"])
    clean_df["normalized_flux"] = clean_df["flux"] / median_flux

    # Detrending using Savitzky-Golay filter
    n = len(clean_df)

    if n < 101:
        raise ValueError("Not enough data points for detrending.")

    # Window length must be odd and smaller than data length
    window_length = max(101, n // 30)

    if window_length % 2 == 0:
        window_length += 1

    if window_length >= n:
        window_length = n - 1

    if window_length % 2 == 0:
        window_length -= 1

    trend = savgol_filter(
        clean_df["normalized_flux"].values,
        window_length=window_length,
        polyorder=2
    )

    clean_df["trend"] = trend
    clean_df["detrended_flux"] = clean_df["normalized_flux"] / clean_df["trend"]

    print(f"Total clean points: {len(clean_df)}")
    print(f"Detrending window length: {window_length}")

    return clean_df


def plot_lightcurve(clean_df, tic_id, label):
    """
    Saves raw, normalized, and detrended plots.
    """

    # Raw flux plot
    plt.figure(figsize=(12, 5))
    plt.scatter(clean_df["time"], clean_df["flux"], s=2)
    plt.xlabel("Time")
    plt.ylabel("Flux")
    plt.title(f"Raw Light Curve | TIC {tic_id} | {label}")
    plt.tight_layout()
    raw_plot = PLOT_DIR / f"TIC_{tic_id}_raw.png"
    plt.savefig(raw_plot, dpi=200)
    plt.close()

    # Normalized flux plot
    plt.figure(figsize=(12, 5))
    plt.scatter(clean_df["time"], clean_df["normalized_flux"], s=2)
    plt.xlabel("Time")
    plt.ylabel("Normalized Flux")
    plt.title(f"Normalized Light Curve | TIC {tic_id} | {label}")
    plt.tight_layout()
    normalized_plot = PLOT_DIR / f"TIC_{tic_id}_normalized.png"
    plt.savefig(normalized_plot, dpi=200)
    plt.close()

    # Detrended flux plot
    plt.figure(figsize=(12, 5))
    plt.scatter(clean_df["time"], clean_df["detrended_flux"], s=2)
    plt.xlabel("Time")
    plt.ylabel("Detrended Flux")
    plt.title(f"Detrended Light Curve | TIC {tic_id} | {label}")
    plt.tight_layout()
    detrended_plot = PLOT_DIR / f"TIC_{tic_id}_detrended.png"
    plt.savefig(detrended_plot, dpi=200)
    plt.close()

    print("\nPlots saved:")
    print(raw_plot)
    print(normalized_plot)
    print(detrended_plot)


def main():
    df, tic_id, label = load_one_lightcurve()

    clean_df = prepare_lightcurve(df)

    output_csv = PROCESSED_DIR / f"TIC_{tic_id}_clean_detrended.csv"
    clean_df.to_csv(output_csv, index=False)

    print(f"\nClean detrended CSV saved to:")
    print(output_csv)

    plot_lightcurve(clean_df, tic_id, label)

    print("\nStep 6 completed successfully.")


if __name__ == "__main__":
    main()