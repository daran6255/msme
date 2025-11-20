import pandas as pd
import requests
from typing import Optional
from geopy.geocoders import Nominatim
from geopy.extra.rate_limiter import RateLimiter
import time

# Config
EXCEL_FILE = "script\candidates_input.xlsx"
API_URL = "http://127.0.0.1:5000/api/v1/candidates/create"

# Setup geopy
geolocator = Nominatim(user_agent="candidate_pincode_lookup")
geocode = RateLimiter(geolocator.geocode, min_delay_seconds=1)  # avoid rate limits

def lookup_pincode(state: str, district: str, taluk: str) -> Optional[str]:
    try:
        query = f"{taluk}, {district}, {state}, India"
        location = geocode(query, addressdetails=True)
        if location and "postcode" in location.raw['address']:
            return location.raw['address']['postcode']
        # fallback: search without taluk
        fallback_query = f"{district}, {state}, India"
        location = geocode(fallback_query, addressdetails=True)
        if location and "postcode" in location.raw['address']:
            return location.raw['address']['postcode']
    except Exception as e:
        print(f"⚠️ Geocode error for {state}/{district}/{taluk}: {e}")
    return None

def transform_business_type(bt_value: str) -> list:
    if not bt_value or pd.isna(bt_value):
        return []
    return [v.strip() for v in bt_value.split(",")]

def main():
    df = pd.read_excel(EXCEL_FILE, dtype=str)
    for idx, row in df.iterrows():
        name = row["name"]
        contact = row["contact"]
        gender = row["gender"]
        business_type_raw = row["Business Type"]
        state = row["State"]
        district = row["District"]
        taluk = row["Taluk"]
        udyam_certificate = row["Udyam_Certificate"]
        phone_model = row["phone_model"]
        disability_cat = row["disabled"]

        business_type = transform_business_type(business_type_raw)
        pin_code = lookup_pincode(state, district, taluk)

        if pin_code is None:
            print(f"⚠️ Could not find pincode for {name} – {state}/{district}/{taluk}. Skipping.")
            continue

        payload = {
            "name": name,
            "contact": contact,
            "gender": gender,
            "business_type": business_type,
            "pin_code": pin_code,
            "udyam_certificate": True if udyam_certificate.strip().upper() == "TRUE" else False,
            "phone_type": phone_model,
            "disability_cat": disability_cat,
            "state": state,
            "district": district,
            "taluk": taluk
        }

        try:
            res = requests.post(API_URL, json=payload)
            if res.status_code in [200, 201]:
                print(f"✅ Created candidate {name}")
            else:
                print(f"❌ Failed to create {name}. Status: {res.status_code}. Response: {res.text}")
        except Exception as e:
            print(f"❌ HTTP error for {name}: {e}")

        # Optional: small delay to avoid overloading API
        time.sleep(0.5)

if __name__ == "__main__":
    main()
