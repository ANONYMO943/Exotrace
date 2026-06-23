import warnings
from pathlib import Path

import lightkurve as lk
import pandas as pd
from tqdm import tqdm

# Ignore optional Lightkurve warnings
warnings.filterwarnings("ignore")

BASE_DIR = Path(__file__).resolve().parent

CATALOG_DIR = BASE_DIR / "data" / "catalogs"
LIGHTCURVE_DIR = BASE_DIR / "data" / "lightcurves"

TOI_FILE = CATALOG_DIR / "toi_catalog.csv"
EB_FILE = CATALOG_DIR / "tess_eb_catalog.csv"

PLANET_DIR = LIGHTCURVE_DIR / "planets"
FALSE_POSITIVE_DIR = LIGHTCURVE_DIR / "false_positives"
EB_DIR = LIGHTCURVE_DIR / "eclipsing_binaries"

for folder in [PLANET_DIR, FALSE_POSITIVE_DIR, EB_DIR]:
    folder.mkdir(parents=True, exist_ok=True)

FAILED_FILE = LIGHTCURVE_DIR / "failed_downloads.csv"


def clean_tic_id(value):
    """
    Converts TIC ID values into clean numeric string.
    Example:
    0000091961 -> 91961
    91961.0 -> 91961
    TIC 91961 -> 91961
    """
    if pd.isna(value):
        return None

    text = str(value).strip()
    text = text.replace("TIC", "").replace("tic", "").strip()

    if "." in text:
        text = text.split(".")[0]

    text = text.lstrip("0")

    if text == "":
        return None

    return text


def normalize_disposition(value):
    """
    Converts TOI disposition into simple label.
    """
    if pd.isna(value):
        return "unknown"

    text = str(value).strip().upper()

    # Common TESS disposition meanings
    if text in ["CP", "KP", "PC", "APC"]:
        return "planet"

    if "PLANET" in text and "FALSE" not in text:
        return "planet"

    if text in ["FP", "FA"]:
        return "false_positive"

    if "FALSE" in text or "FP" in text:
        return "false_positive"

    return "unknown"


def choose_best_lightcurve(search_result):
    """
    Prefer high-quality / useful products.
    Priority:
    1. SPOC short cadence if available
    2. TESS-SPOC
    3. QLP
    4. first available product
    """
    if len(search_result) == 0:
        return None

    table = search_result.table

    # Try SPOC first
    for preferred_author in ["SPOC", "TESS-SPOC", "QLP"]:
        matches = [
            i for i, row in enumerate(table)
            if str(row["author"]).upper() == preferred_author.upper()
        ]
        if matches:
            return search_result[matches[0]]

    return search_result[0]


def download_one_lightcurve(tic_id, label, output_dir):
    """
    Downloads one TESS light curve and saves it as CSV.
    """
    tic_id = clean_tic_id(tic_id)

    if tic_id is None:
        return False, "Invalid TIC ID"

    output_file = output_dir / f"TIC_{tic_id}.csv"

    # Skip if already downloaded
    if output_file.exists():
        return True, "Already exists"

    target = f"TIC {tic_id}"

    try:
        search_result = lk.search_lightcurve(target, mission="TESS")

        if len(search_result) == 0:
            return False, "No TESS light curve found"

        selected = choose_best_lightcurve(search_result)

        if selected is None:
            return False, "No suitable light curve product"

        lc = selected.download()

        if lc is None:
            return False, "Download returned None"

        # Basic cleaning only
        lc = lc.remove_nans().normalize()

        df = lc.to_pandas()

        # Add useful metadata columns
        df["tic_id"] = tic_id
        df["label"] = label

        df.to_csv(output_file, index=True)

        return True, "Downloaded"

    except Exception as e:
        return False, str(e)


def load_planet_and_false_positive_targets(limit_per_class=10):
    """
    Loads planet and false-positive TIC IDs from TOI catalog.
    Expected columns from your direct API file:
    toi, tid, tfopwg_disp, pl_orbper, pl_trandurh, pl_trandep
    """
    if not TOI_FILE.exists():
        raise FileNotFoundError(f"TOI catalog not found: {TOI_FILE}")

    df = pd.read_csv(TOI_FILE)

    print("\nTOI catalog columns:")
    print(list(df.columns))

    # Find TIC ID column
    tic_col = None
    for possible in ["tid", "tic_id", "TIC ID", "ticid", "tic"]:
        if possible in df.columns:
            tic_col = possible
            break

    if tic_col is None:
        raise ValueError("Could not find TIC ID column in TOI catalog. Expected column like tid or tic_id.")

    # Find disposition column
    disp_col = None
    for possible in ["tfopwg_disp", "disposition", "toi_disposition", "disp"]:
        if possible in df.columns:
            disp_col = possible
            break

    if disp_col is None:
        raise ValueError("Could not find disposition column in TOI catalog. Expected tfopwg_disp.")

    df["clean_tic_id"] = df[tic_col].apply(clean_tic_id)
    df["simple_label"] = df[disp_col].apply(normalize_disposition)

    planets = (
        df[df["simple_label"] == "planet"]["clean_tic_id"]
        .dropna()
        .drop_duplicates()
        .head(limit_per_class)
        .tolist()
    )

    false_positives = (
        df[df["simple_label"] == "false_positive"]["clean_tic_id"]
        .dropna()
        .drop_duplicates()
        .head(limit_per_class)
        .tolist()
    )

    return planets, false_positives


def load_eb_targets(limit=10):
    """
    Loads eclipsing binary TIC IDs from cleaned TESS-EB catalog.
    """
    if not EB_FILE.exists():
        raise FileNotFoundError(f"TESS-EB catalog not found: {EB_FILE}")

    df = pd.read_csv(EB_FILE)

    print("\nTESS-EB catalog columns:")
    print(list(df.columns))

    if "tic_id" not in df.columns:
        raise ValueError("Could not find tic_id column in TESS-EB catalog.")

    eb_targets = (
        df["tic_id"]
        .apply(clean_tic_id)
        .dropna()
        .drop_duplicates()
        .head(limit)
        .tolist()
    )

    return eb_targets


def main():
    LIMIT_PER_CLASS = 10

    failed = []

    print("\nLoading planet and false-positive targets...")
    planets, false_positives = load_planet_and_false_positive_targets(LIMIT_PER_CLASS)

    print(f"Planet targets selected: {len(planets)}")
    print(f"False-positive targets selected: {len(false_positives)}")

    print("\nLoading eclipsing binary targets...")
    eclipsing_binaries = load_eb_targets(LIMIT_PER_CLASS)
    print(f"Eclipsing binary targets selected: {len(eclipsing_binaries)}")

    jobs = []

    for tic_id in planets:
        jobs.append((tic_id, "planet", PLANET_DIR))

    for tic_id in false_positives:
        jobs.append((tic_id, "false_positive", FALSE_POSITIVE_DIR))

    for tic_id in eclipsing_binaries:
        jobs.append((tic_id, "eclipsing_binary", EB_DIR))

    print(f"\nTotal download jobs: {len(jobs)}")

    for tic_id, label, output_dir in tqdm(jobs, desc="Downloading light curves"):
        success, message = download_one_lightcurve(tic_id, label, output_dir)

        if success:
            print(f"SUCCESS | TIC {tic_id} | {label} | {message}")
        else:
            print(f"FAILED  | TIC {tic_id} | {label} | {message}")
            failed.append({
                "tic_id": tic_id,
                "label": label,
                "reason": message
            })

    if failed:
        failed_df = pd.DataFrame(failed)
        failed_df.to_csv(FAILED_FILE, index=False)
        print(f"\nSome downloads failed. Saved failed list to: {FAILED_FILE}")
    else:
        print("\nAll downloads completed successfully.")

    print("\nDone.")
    print(f"Planet files folder: {PLANET_DIR}")
    print(f"False-positive files folder: {FALSE_POSITIVE_DIR}")
    print(f"Eclipsing-binary files folder: {EB_DIR}")


if __name__ == "__main__":
    main()