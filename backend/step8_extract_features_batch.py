from pathlib import Path
import warnings

import numpy as np
import pandas as pd
from scipy.signal import savgol_filter
from astropy.timeseries import BoxLeastSquares
from tqdm import tqdm


warnings.filterwarnings("ignore")

BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent

DATASET_INDEX = BASE_DIR / "data" / "dataset_index.csv"
FEATURES_FILE = BASE_DIR / "data" / "features.csv"
RESULTS_DIR = BASE_DIR / "outputs" / "results"

RESULTS_DIR.mkdir(parents=True, exist_ok=True)


def find_column(df, possible_names):
    lower_map = {col.lower(): col for col in df.columns}

    for name in possible_names:
        if name.lower() in lower_map:
            return lower_map[name.lower()]

    return None


def robust_std(values):
    values = np.asarray(values)
    median = np.nanmedian(values)
    mad = np.nanmedian(np.abs(values - median))

    if mad == 0 or np.isnan(mad):
        return np.nanstd(values)

    return 1.4826 * mad


def clean_and_detrend_lightcurve(file_path):
    df = pd.read_csv(file_path)

    time_col = find_column(df, ["time", "TIME"])
    flux_col = find_column(df, ["flux", "PDCSAP_FLUX", "SAP_FLUX", "sap_flux", "pdcsap_flux"])

    if time_col is None:
        raise ValueError(f"Time column not found. Columns: {list(df.columns)}")

    if flux_col is None:
        raise ValueError(f"Flux column not found. Columns: {list(df.columns)}")

    lc = df[[time_col, flux_col]].copy()
    lc.columns = ["time", "flux"]

    lc["time"] = pd.to_numeric(lc["time"], errors="coerce")
    lc["flux"] = pd.to_numeric(lc["flux"], errors="coerce")

    lc = lc.replace([np.inf, -np.inf], np.nan)
    lc = lc.dropna(subset=["time", "flux"])
    lc = lc.sort_values("time").reset_index(drop=True)

    if len(lc) < 500:
        raise ValueError("Too few valid points")

    # Remove extreme outliers using MAD
    median_flux = np.nanmedian(lc["flux"])
    mad = np.nanmedian(np.abs(lc["flux"] - median_flux))

    if mad > 0 and not np.isnan(mad):
        sigma_like = 0.6745 * (lc["flux"] - median_flux) / mad
        lc = lc[np.abs(sigma_like) < 8].reset_index(drop=True)

    if len(lc) < 500:
        raise ValueError("Too few points after outlier removal")

    # Normalize
    median_flux = np.nanmedian(lc["flux"])
    lc["normalized_flux"] = lc["flux"] / median_flux

    # Detrend
    n = len(lc)
    window_length = max(101, n // 30)

    if window_length % 2 == 0:
        window_length += 1

    if window_length >= n:
        window_length = n - 1

    if window_length % 2 == 0:
        window_length -= 1

    if window_length < 5:
        raise ValueError("Invalid detrending window")

    trend = savgol_filter(
        lc["normalized_flux"].values,
        window_length=window_length,
        polyorder=2
    )

    lc["trend"] = trend
    lc["detrended_flux"] = lc["normalized_flux"] / lc["trend"]

    lc = lc.replace([np.inf, -np.inf], np.nan)
    lc = lc.dropna(subset=["time", "detrended_flux"])

    return lc


def downsample_for_bls(time, flux, max_points=20000):
    """
    Keeps BLS faster for very large light curves.
    """
    if len(time) <= max_points:
        return time, flux

    step = int(np.ceil(len(time) / max_points))
    return time[::step], flux[::step]


def calculate_odd_even_depth(time, flux, period, duration, t0):
    """
    Simple odd-even depth difference.
    Useful for identifying eclipsing binaries.
    """
    transit_numbers = np.floor((time - t0) / period).astype(int)

    odd_mask = np.zeros_like(time, dtype=bool)
    even_mask = np.zeros_like(time, dtype=bool)

    unique_transits = np.unique(transit_numbers)

    for tn in unique_transits:
        center = t0 + tn * period
        mask = np.abs(time - center) < duration / 2

        if tn % 2 == 0:
            even_mask |= mask
        else:
            odd_mask |= mask

    out_mask = ~(odd_mask | even_mask)

    if np.sum(odd_mask) < 5 or np.sum(even_mask) < 5 or np.sum(out_mask) < 5:
        return np.nan

    out_median = np.nanmedian(flux[out_mask])
    odd_depth = out_median - np.nanmedian(flux[odd_mask])
    even_depth = out_median - np.nanmedian(flux[even_mask])

    return float(abs(odd_depth - even_depth))


def calculate_secondary_eclipse_depth(time, flux, period, duration, t0):
    """
    Checks for a secondary dip around phase 0.5.
    Eclipsing binaries often show secondary eclipses.
    """
    primary_phase = ((time - t0) % period) / period
    secondary_center = 0.5

    secondary_mask = np.abs(primary_phase - secondary_center) < (duration / period) / 2
    out_mask = np.abs(primary_phase - secondary_center) > (duration / period)

    if np.sum(secondary_mask) < 5 or np.sum(out_mask) < 5:
        return np.nan

    out_median = np.nanmedian(flux[out_mask])
    secondary_median = np.nanmedian(flux[secondary_mask])

    return float(out_median - secondary_median)


def calculate_v_shape_score(time, flux, period, duration, t0):
    """
    Rough V-shape score.
    Higher score means sharper V-like dip.
    Lower score means flatter U-like dip.

    This is simple and not perfect, but useful for first classifier.
    """
    phase = ((time - t0 + 0.5 * period) % period) / period - 0.5
    width_phase = duration / period

    in_transit = np.abs(phase) < width_phase / 2

    if np.sum(in_transit) < 20:
        return np.nan

    p = phase[in_transit]
    f = flux[in_transit]

    center_mask = np.abs(p) < width_phase * 0.15
    edge_mask = (np.abs(p) > width_phase * 0.30) & (np.abs(p) < width_phase * 0.50)

    if np.sum(center_mask) < 5 or np.sum(edge_mask) < 5:
        return np.nan

    center_flux = np.nanmedian(f[center_mask])
    edge_flux = np.nanmedian(f[edge_mask])

    # If center is much deeper than edges, shape is more V-like
    score = abs(edge_flux - center_flux)

    return float(score)


def run_bls_and_extract_features(lc):
    time = lc["time"].values
    flux = lc["detrended_flux"].values
    flux = flux / np.nanmedian(flux)

    time, flux = downsample_for_bls(time, flux, max_points=20000)

    baseline = np.nanmax(time) - np.nanmin(time)

    min_period = 0.5
    max_period = min(20.0, baseline / 2)

    if max_period <= min_period:
        max_period = max(1.0, baseline * 0.8)

    durations = np.linspace(0.03, 0.30, 12)

    bls = BoxLeastSquares(time, flux)

    periodogram = bls.autopower(
        durations,
        minimum_period=min_period,
        maximum_period=max_period,
        frequency_factor=3
    )

    power = np.asarray(periodogram.power)
    best_index = int(np.nanargmax(power))

    best_period = float(np.asarray(periodogram.period)[best_index])
    best_duration = float(np.asarray(periodogram.duration)[best_index])
    best_t0 = float(np.asarray(periodogram.transit_time)[best_index])
    best_power = float(power[best_index])

    in_transit = bls.transit_mask(
        time,
        period=best_period,
        duration=best_duration,
        transit_time=best_t0
    )

    out_transit = ~in_transit

    if np.sum(in_transit) < 5 or np.sum(out_transit) < 5:
        raise ValueError("Not enough in/out transit points")

    median_out = np.nanmedian(flux[out_transit])
    median_in = np.nanmedian(flux[in_transit])

    depth = float(median_out - median_in)
    depth_percent = depth * 100

    noise = robust_std(flux[out_transit])

    if noise <= 0 or np.isnan(noise):
        snr = 0.0
    else:
        snr = float(depth * np.sqrt(np.sum(in_transit)) / noise)

    odd_even_diff = calculate_odd_even_depth(
        time, flux, best_period, best_duration, best_t0
    )

    secondary_depth = calculate_secondary_eclipse_depth(
        time, flux, best_period, best_duration, best_t0
    )

    v_shape_score = calculate_v_shape_score(
        time, flux, best_period, best_duration, best_t0
    )

    n_transits = int(np.floor((np.nanmax(time) - best_t0) / best_period) - np.ceil((np.nanmin(time) - best_t0) / best_period) + 1)

    features = {
        "period_days": best_period,
        "duration_days": best_duration,
        "duration_hours": best_duration * 24,
        "transit_time": best_t0,
        "depth": depth,
        "depth_percent": depth_percent,
        "snr": snr,
        "bls_power": best_power,
        "n_points_used": int(len(time)),
        "n_in_transit_points": int(np.sum(in_transit)),
        "n_detected_transits": n_transits,
        "odd_even_depth_difference": odd_even_diff,
        "secondary_eclipse_depth": secondary_depth,
        "v_shape_score": v_shape_score,
        "baseline_days": baseline,
        "period_search_min_days": min_period,
        "period_search_max_days": max_period,
    }

    return features


def main():
    if not DATASET_INDEX.exists():
        raise FileNotFoundError(f"dataset_index.csv not found: {DATASET_INDEX}")

    index_df = pd.read_csv(DATASET_INDEX)

    records = []
    failed = []

    for _, row in tqdm(index_df.iterrows(), total=len(index_df), desc="Extracting features"):
        tic_id = str(row["tic_id"])
        label = str(row["label"])
        file_path = PROJECT_ROOT / row["file_path"]

        try:
            lc = clean_and_detrend_lightcurve(file_path)
            features = run_bls_and_extract_features(lc)

            record = {
                "tic_id": tic_id,
                "label": label,
                "file_path": row["file_path"],
                **features
            }

            records.append(record)

            print(f"SUCCESS | TIC {tic_id} | {label} | P={features['period_days']:.4f} d | SNR={features['snr']:.2f}")

        except Exception as e:
            failed.append({
                "tic_id": tic_id,
                "label": label,
                "file_path": row["file_path"],
                "error": str(e)
            })

            print(f"FAILED | TIC {tic_id} | {label} | {e}")

    features_df = pd.DataFrame(records)
    features_df.to_csv(FEATURES_FILE, index=False)

    print("\nFeature extraction completed.")
    print(f"Saved features to: {FEATURES_FILE}")
    print(f"Total successful records: {len(features_df)}")

    if len(features_df) > 0:
        print("\nClass counts:")
        print(features_df["label"].value_counts())

        print("\nPreview:")
        print(features_df.head())

    if failed:
        failed_df = pd.DataFrame(failed)
        failed_file = RESULTS_DIR / "feature_extraction_failed.csv"
        failed_df.to_csv(failed_file, index=False)

        print(f"\nSome files failed. Failed list saved to: {failed_file}")
        print(f"Total failed records: {len(failed_df)}")
    else:
        print("\nNo failures.")


if __name__ == "__main__":
    main()