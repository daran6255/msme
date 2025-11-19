from app.database import db
from .base import BaseModel
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime

class Assessment(BaseModel):
    __tablename__ = 'assessment'

    candidate_id = db.Column(UUID(as_uuid=True), db.ForeignKey('candidates.id'), nullable=False)
    training = db.Column(db.String(120), nullable=False)
    date = db.Column(db.Date, nullable=False, default=datetime.utcnow)
    status = db.Column(db.String(50), nullable=True)
    mark = db.Column(db.Integer, nullable=True)
    remarks = db.Column(db.String(255), nullable=True)
