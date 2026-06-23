import lightkurve as lk
import pandas as pd
from pathlib import Path

OUTPUT_DIR = Path("backend/data/lightcurves/test")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# First test target from your TESS-EB catalog
tic_id = "91961"
target = f"TIC {tic_id}"

print(f"Searching light curve for {target}...")

search_result = lk.search_lightcurve(target, mission="TESS")

print(search_result)

if len(search_result) == 0:
    print("No TESS light curve found for this TIC ID.")
else:
    print("Downloading first available light curve...")
    lc = search_result[0].download()

    # Remove NaNs and normalize
    lc = lc.remove_nans().normalize()

    # Convert to pandas dataframe
    df = lc.to_pandas()

    output_file = OUTPUT_DIR / f"TIC_{tic_id}.csv"
    df.to_csv(output_file, index=False)

    print(f"Saved light curve to: {output_file}")
    print(df.head())