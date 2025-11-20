import pandas as pd
import requests
import math

# ---------------- CONFIG ----------------
EXCEL_FILE = "script/business_data.xlsx"  # Path to your Excel
CANDIDATE_API = "http://127.0.0.1:5000/api/v1/candidates/get-all"
BUSINESS_API = "http://127.0.0.1:5000/api/v1/business"

# ---------------- HELPERS ----------------
def safe_value(val, default=None):
    """Convert NaN/None to safe default"""
    if val is None or (isinstance(val, float) and math.isnan(val)):
        return default
    return val

def safe_int(val):
    """Convert value to int safely"""
    try:
        return int(val)
    except (ValueError, TypeError):
        return None

def safe_float(val):
    """Convert value to float safely"""
    try:
        return float(val)
    except (ValueError, TypeError):
        return None

# ---------------- MAIN ----------------
def main():
    # Load Excel
    try:
        df = pd.read_excel(EXCEL_FILE, dtype=str)
    except Exception as e:
        print(f"❌ Failed to read Excel file: {e}")
        return

    df.columns = df.columns.str.strip()  # remove extra spaces from headers

    # Fetch all candidates once
    try:
        res_candidates = requests.get(CANDIDATE_API)
        res_candidates.raise_for_status()
        candidates = res_candidates.json()
    except Exception as e:
        print(f"❌ Failed to fetch candidates: {e}")
        return

    # Process each row
    for idx, row in df.iterrows():
        name = safe_value(row.get("name", "")).strip()
        customers_before = safe_int(safe_value(row.get("totalcustomersbefore")))
        customers_after = safe_int(safe_value(row.get("totalcustomersafter")))
        income_before = safe_float(safe_value(row.get("incomebefore")))
        income_after = safe_float(safe_value(row.get("incomeafter")))

        # Candidate lookup (ignore case and extra spaces)
        candidate = next(
            (c for c in candidates if c["name"].strip().lower() == name.lower()),
            None
        )
        if not candidate:
            print(f"⚠️ Candidate '{name}' not found. Skipping.")
            continue

        candidate_id = candidate["id"]

        payload = {
            "candidate_id": candidate_id,
            "customers_before": customers_before,
            "customers_after": customers_after,
            "income_before": income_before,
            "income_after": income_after
        }

        # POST to business API
        try:
            res = requests.post(BUSINESS_API, json=payload)
            if res.status_code in [200, 201]:
                print(f"✅ Business record added for {name}")
            else:
                print(f"❌ Failed for {name}: {res.status_code} {res.text}")
        except Exception as e:
            print(f"❌ HTTP error for {name}: {e}")

if __name__ == "__main__":
    main()
