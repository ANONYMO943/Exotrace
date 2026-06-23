from pathlib import Path
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent
LIGHTCURVE_DIR = BASE_DIR / "data" / "lightcurves"

OUTPUT_FILE = BASE_DIR / "data" / "dataset_index.csv"

CLASS_FOLDERS = {
    "planet": LIGHTCURVE_DIR / "planets",
    "false_positive": LIGHTCURVE_DIR / "false_positives",
    "eclipsing_binary": LIGHTCURVE_DIR / "eclipsing_binaries",
}

records = []

for label, folder in CLASS_FOLDERS.items():
    if not folder.exists():
        print(f"Folder not found: {folder}")
        continue

    csv_files = list(folder.glob("*.csv"))

    print(f"{label}: {len(csv_files)} files found")

    for file_path in csv_files:
        # File name format: TIC_123456789.csv
        tic_id = file_path.stem.replace("TIC_", "")

        records.append({
            "file_path": str(file_path.relative_to(BASE_DIR.parent)).replace("\\", "/"),
            "tic_id": tic_id,
            "label": label
        })

df = pd.DataFrame(records)

df.to_csv(OUTPUT_FILE, index=False)

print("\nDataset index created successfully.")
print(f"Saved to: {OUTPUT_FILE}")
print(f"Total files indexed: {len(df)}")
print("\nClass count:")
print(df["label"].value_counts())

print("\nPreview:")
print(df.head())