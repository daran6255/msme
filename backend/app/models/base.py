# app/models/base.py
import uuid
from datetime import datetime
from app.database import db
from sqlalchemy.dialects.postgresql import UUID

class BaseModel(db.Model):
    __abstract__ = True
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
