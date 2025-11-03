import pandas as pd
import sys

try:
    df = pd.read_csv('data/raw/carbon_dataset.csv')
    print("/nDataset loaded successfully!")
except FileNotFoundError:
    print("\nERROR: Dataset file not found!")
    print("Expected location: data/raw/carbon_dataset.csv")
    print("\nPlease copy your dataset to this location:")
    print("  cp YOUR_DATASET.csv data/raw/carbon_dataset.csv")
    sys.exit(1)

# Display Basic Information
print(f"\nDataset Overview:")
print(f"   Rows: {len(df):,}")
print(f"   Columns: {len(df.columns)}")
print(f"   Size: {df.memory_usage(deep=True).sum() / 1024**2:.2f} MB")

# Display column names
print(f"\nColumns: ({len(df.columns)}): ")
for i, col in enumerate(df.columns, 1):
    dtype = df[col].dtype
    non_null = df[col].notna().sum()
    print(f"   {i:2d}. {col:40s} | {str(dtype):10s} | {non_null:,} non-null")
    

target_col = 'CarbonEmission'

if target_col:
    print(f"\n Target Variable Found: '{target_col}'")
    print(f"   Min:    {df[target_col].min():.2f}")
    print(f"   Max:    {df[target_col].max():.2f}")
    print(f"   Mean:   {df[target_col].mean():.2f}")
    print(f"   Median: {df[target_col].median():.2f}")
else:
    print("\n  WARNING: Target column not found!")
    print("   Looking for: CarbonEmission, Carbon_Emission, etc.")


# Check for missing values
missing = df.isnull().sum()
if missing.sum() > 0:
    print(f"\n  Missing Values Detected:")
    for col, count in missing[missing > 0].items():
        print(f"   {col}: {count:,} ({count/len(df)*100:.1f}%)")
else:
    print(f"\n No missing values!")

#Showing sample rows 
#

print(f"\n🔍 Data Type Summary:")
print(df.dtypes.value_counts())

with open('data/processed/dataset_summary.txt', 'w') as f:
    f.write("Dataset Summary\n")
    f.write("="*80 + "\n")
    f.write(f"Rows: {len(df):,}\n")
    f.write(f"Columns: {len(df.columns)}\n")
    f.write(f"\nColumns:\n")
    for col in df.columns:
        f.write(f"  - {col}\n")
