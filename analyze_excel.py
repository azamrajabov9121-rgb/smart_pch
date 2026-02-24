import pandas as pd
import json
import sys

try:
    file_path = '1 brigada (2).xlsx'
    # Read the file header to understand columns
    df = pd.read_excel(file_path, header=None, nrows=20)
    
    print("--- START EXCEL DATA ---")
    print(df.to_string())
    print("--- END EXCEL DATA ---")

except ImportError:
    print("Pandas not installed. Please define columns manually.")
except Exception as e:
    print(f"Error: {e}")
