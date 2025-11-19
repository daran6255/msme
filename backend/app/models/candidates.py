from app.database import db
from sqlalchemy.dialects.postgresql import JSON, ENUM, UUID
from .base import BaseModel
import uuid

# Define ENUMs
gender_enum = ENUM('Male', 'Female', name='gender_enum', create_type=False)
phone_type_enum = ENUM('Smart Phone', 'Basic Phone', name='phone_type_enum', create_type=False)
status_enum = ENUM('Active', 'Inactive', name='status_enum', create_type=False)

class Candidate(BaseModel):
    __tablename__ = 'candidates'

    # UUID Primary Key
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, nullable=False)

    # Candidate Specific Fields
    name = db.Column(db.String(120), nullable=False)
    contact = db.Column(db.String(15), nullable=False)
    gender = db.Column(gender_enum, nullable=False)
    business_type = db.Column(JSON, nullable=True)  # JSON field
    state = db.Column(db.String(100), nullable=False)
    district = db.Column(db.String(100), nullable=False)
    taluk = db.Column(db.String(100), nullable=False)
    pin_code = db.Column(db.String(10), nullable=False)
    udyam_certificate = db.Column(db.Boolean, nullable=False, default=False)
    phone_type = db.Column(phone_type_enum, nullable=False)

    # Status field with default "Active"
    status = db.Column(status_enum, nullable=False, default="Active")
