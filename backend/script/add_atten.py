import pandas as pd
import requests
import math

# ---------------- CONFIG ----------------
EXCEL_FILE = "script/attendance_data.xlsx"  # Path to your Excel
CANDIDATE_API = "http://localhost:5000/api/v1/candidates/get-all"
ATTENDANCE_API = "http://localhost:5000/api/v1/attendance/create"

# ---------------- HELPERS ----------------
def str_to_bool(value: str) -> bool:
    """Convert TRUE/FALSE strings to boolean"""
    return str(value).strip().upper() == "TRUE"

def safe_value(val, default=None):
    """Convert NaN/None to safe default"""
    if val is None or (isinstance(val, float) and math.isnan(val)):
        return default
    return val

def format_date(date_str):
    """Convert Excel date string to YYYY-MM-DD"""
    try:
        if not date_str:
            return None
        return pd.to_datetime(date_str, dayfirst=True).strftime("%Y-%m-%d")
    except Exception:
        return None

# ---------------- MAIN ----------------
def main():
    # Load Excel
    try:
        df = pd.read_excel(EXCEL_FILE, dtype=str)
    except Exception as e:
        print(f"❌ Failed to read Excel file: {e}")
        return

    df.columns = df.columns.str.strip()  # Remove extra spaces from headers

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
        session_name = safe_value(row.get("sessionname", ""))
        attended = str_to_bool(safe_value(row.get("attended", "FALSE")))
        date_str = safe_value(row.get("date", None))
        remarks = safe_value(row.get("remarks", ""))

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
            "session_name": [session_name] if session_name else [],
            "attended": attended,
            "date": format_date(date_str),
            "remarks": remarks
        }

        # POST to attendance API
        try:
            res = requests.post(ATTENDANCE_API, json=payload)
            if res.status_code in [200, 201]:
                print(f"✅ Attendance added for {name} - {session_name}")
            else:
                print(f"❌ Failed for {name}: {res.status_code} {res.text}")
        except Exception as e:
            print(f"❌ HTTP error for {name}: {e}")

if __name__ == "__main__":
    main()
