import pgeocode
from datetime import datetime
import pandas as pd


def get_location_by_pincode(pincode):
    """
    Look up Indian postal codes using pgeocode.
    Returns dict with city, district, state or None if not found.
    """
    nomi = pgeocode.Nominatim('IN')
    info = nomi.query_postal_code(str(pincode))
    
    if info is None or pd.isna(info.place_name):
        return None
    
    city = str(info.place_name).split(",")[0].strip() if not pd.isna(info.place_name) else None
    district = str(info.county_name).strip() if not pd.isna(info.county_name) else None
    state = str(info.state_name).strip() if not pd.isna(info.state_name) else None
    
    return {
        "city": city,
        "district": district,
        "state": state
    }
