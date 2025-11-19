from app.database import db
from .base import BaseModel
from sqlalchemy.dialects.postgresql import JSON, UUID
from datetime import datetime

class Attendance(BaseModel):
    __tablename__ = 'attendance'

    candidate_id = db.Column(UUID(as_uuid=True), db.ForeignKey('candidates.id'), nullable=False)
    session_name = db.Column(JSON, nullable=True)  # List or JSON field
    attended = db.Column(db.Boolean, nullable=False)
    date = db.Column(db.Date, nullable=False, default=datetime.utcnow)
    remarks = db.Column(db.String(255), nullable=True)
