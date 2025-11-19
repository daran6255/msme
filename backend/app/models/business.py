from app.database import db
from .base import BaseModel
from sqlalchemy.dialects.postgresql import UUID

class Business(BaseModel):
    __tablename__ = 'business'

    candidate_id = db.Column(UUID(as_uuid=True), db.ForeignKey('candidates.id'), nullable=False)
    customers_before = db.Column(db.Integer, nullable=True)
    customers_after = db.Column(db.Integer, nullable=True)
    income_before = db.Column(db.Float, nullable=True)
    income_after = db.Column(db.Float, nullable=True)
