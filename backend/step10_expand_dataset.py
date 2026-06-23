import warnings
from pathlib import Path

import lightkurve as lk
import pandas as pd
from tqdm import tqdm

warnings.filterwarnings("ignore")

BASE_DIR = Path(__file__).resolve().parent

CATALOG_DIR = BASE_DIR / "data" / "catalogs"
LIGHTCURVE_DIR = BASE_DIR / "data" / "lightcurves"

TOI_FILE = CATALOG_DIR / "toi_catalog.csv"
EB_FILE = CATALOG_DIR / "tess_eb_catalog.csv"

PLANET_DIR = LIGHTCURVE_DIR / "planets"
FALSE_POSITIVE_DIR = LIGHTCURVE_DIR / "false_positives"
EB_DIR = LIGHTCURVE_DIR / "eclipsing_binaries"

FAILED_FILE = LIGHTCURVE_DIR / "failed_downloads_step10.csv"

for folder in [PLANET_DIR, FALSE_POSITIVE_DIR, EB_DIR]:
    folder.mkdir(parents=True, exist_ok=True)


TARGET_PER_CLASS = 50

# We check more than 50 candidates because some TIC IDs may fail.
MAX_CANDIDATES_PER_CLASS = 200


def clean_tic_id(value):
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
    if pd.isna(value):
        return "unknown"

    text = str(value).strip().upper()

    # Common TOI disposition labels
    if text in ["CP", "KP", "PC", "APC"]:
        return "planet"

    if "PLANET" in text and "FALSE" not in text:
        return "planet"

    if text in ["FP", "FA"]:
        return "false_positive"

    if "FALSE" in text or "FP" in text:
        return "false_positive"

    return "unknown"


def existing_count(folder):
    return len(list(folder.glob("*.csv")))


def choose_best_lightcurve(search_result):
    """
    Prefer science-friendly products.

    Priority:
    1. SPOC
    2. TESS-SPOC
    3. QLP
    4. first available
    """
    if len(search_result) == 0:
        return None

    table = search_result.table

    for preferred_author in ["SPOC", "TESS-SPOC", "QLP"]:
        matches = [
            i for i, row in enumerate(table)
            if str(row["author"]).upper() == preferred_author.upper()
        ]

        if matches:
            return search_result[matches[0]]

    return search_result[0]


def save_minimal_lightcurve(lc, tic_id, label, output_file):
    """
    Saves only columns needed by our pipeline.
    """
    lc = lc.remove_nans().normalize()
    df = lc.to_pandas()

    if "flux" not in df.columns:
        raise ValueError("Downloaded light curve does not contain flux column.")

    minimal = pd.DataFrame()

    # In Lightkurve DataFrame, time is usually the index.
    if "time" in df.columns:
        minimal["time"] = df["time"].values
    else:
        minimal["time"] = df.index.values

    minimal["flux"] = df["flux"].values

    if "flux_err" in df.columns:
        minimal["flux_err"] = df["flux_err"].values
    else:
        minimal["flux_err"] = None

    minimal["tic_id"] = tic_id
    minimal["label"] = label

    minimal = minimal.dropna(subset=["time", "flux"])

    if len(minimal) < 500:
        raise ValueError("Too few valid points after cleaning.")

    minimal.to_csv(output_file, index=False)


def download_one_lightcurve(tic_id, label, output_dir):
    tic_id = clean_tic_id(tic_id)

    if tic_id is None:
        return False, "Invalid TIC ID"

    output_file = output_dir / f"TIC_{tic_id}.csv"

    if output_file.exists():
        return True, "Already exists"

    target = f"TIC {tic_id}"

    try:
        search_result = lk.search_lightcurve(target, mission="TESS")

        if len(search_result) == 0:
            return False, "No TESS light curve found"

        selected = choose_best_lightcurve(search_result)

        if selected is None:
            return False, "No suitable product"

        lc = selected.download()

        if lc is None:
            return False, "Download returned None"

        save_minimal_lightcurve(lc, tic_id, label, output_file)

        return True, "Downloaded"

    except Exception as e:
        return False, str(e)


def load_toi_targets():
    if not TOI_FILE.exists():
        raise FileNotFoundError(f"TOI catalog not found: {TOI_FILE}")

    df = pd.read_csv(TOI_FILE)

    print("\nTOI catalog columns:")
    print(list(df.columns))

    tic_col = None
    for possible in ["tid", "tic_id", "TIC ID", "ticid", "tic"]:
        if possible in df.columns:
            tic_col = possible
            break

    if tic_col is None:
        raise ValueError("Could not find TIC ID column in TOI catalog.")

    disp_col = None
    for possible in ["tfopwg_disp", "disposition", "toi_disposition", "disp"]:
        if possible in df.columns:
            disp_col = possible
            break

    if disp_col is None:
        raise ValueError("Could not find disposition column in TOI catalog.")

    df["clean_tic_id"] = df[tic_col].apply(clean_tic_id)
    df["simple_label"] = df[disp_col].apply(normalize_disposition)

    planet_targets = (
        df[df["simple_label"] == "planet"]["clean_tic_id"]
        .dropna()
        .drop_duplicates()
        .head(MAX_CANDIDATES_PER_CLASS)
        .tolist()
    )

    false_positive_targets = (
        df[df["simple_label"] == "false_positive"]["clean_tic_id"]
        .dropna()
        .drop_duplicates()
        .head(MAX_CANDIDATES_PER_CLASS)
        .tolist()
    )

    return planet_targets, false_positive_targets


def load_eb_targets():
    if not EB_FILE.exists():
        raise FileNotFoundError(f"TESS-EB catalog not found: {EB_FILE}")

    df = pd.read_csv(EB_FILE)

    if "tic_id" not in df.columns:
        raise ValueError("tess_eb_catalog.csv must contain tic_id column.")

    eb_targets = (
        df["tic_id"]
        .apply(clean_tic_id)
        .dropna()
        .drop_duplicates()
        .head(MAX_CANDIDATES_PER_CLASS)
        .tolist()
    )

    return eb_targets


def fill_class(label, targets, output_dir, target_count):
    """
    Downloads until output_dir has target_count CSV files or target list ends.
    """
    failed = []

    print(f"\nClass: {label}")
    print(f"Existing files: {existing_count(output_dir)}")
    print(f"Target files: {target_count}")
    print(f"Candidate TIC IDs available: {len(targets)}")

    for tic_id in tqdm(targets, desc=f"Downloading {label}"):
        current_count = existing_count(output_dir)

        if current_count >= target_count:
            print(f"{label}: target reached with {current_count} files.")
            break

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

    final_count = existing_count(output_dir)

    print(f"\nFinal count for {label}: {final_count}")

    if final_count < target_count:
        print(f"Warning: {label} did not reach target count.")
        print(f"Needed: {target_count}, Got: {final_count}")

    return failed


def main():
    all_failed = []

    print("Loading TOI targets...")
    planet_targets, false_positive_targets = load_toi_targets()

    print("\nLoading eclipsing binary targets...")
    eb_targets = load_eb_targets()

    all_failed += fill_class(
        label="planet",
        targets=planet_targets,
        output_dir=PLANET_DIR,
        target_count=TARGET_PER_CLASS,
    )

    all_failed += fill_class(
        label="false_positive",
        targets=false_positive_targets,
        output_dir=FALSE_POSITIVE_DIR,
        target_count=TARGET_PER_CLASS,
    )

    all_failed += fill_class(
        label="eclipsing_binary",
        targets=eb_targets,
        output_dir=EB_DIR,
        target_count=TARGET_PER_CLASS,
    )

    if all_failed:
        failed_df = pd.DataFrame(all_failed)
        failed_df.to_csv(FAILED_FILE, index=False)
        print(f"\nFailed downloads saved to: {FAILED_FILE}")

    print("\nStep 10 completed.")
    print("Final folder counts:")
    print(f"Planets: {existing_count(PLANET_DIR)}")
    print(f"False positives: {existing_count(FALSE_POSITIVE_DIR)}")
    print(f"Eclipsing binaries: {existing_count(EB_DIR)}")


if __name__ == "__main__":
    main()