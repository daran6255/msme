from flask import Blueprint, request, jsonify
from pydantic import BaseModel, ValidationError
from typing import Optional
from uuid import UUID
from datetime import datetime
from sqlalchemy.exc import SQLAlchemyError

from app.database import db
from app.models.assessment import Assessment
from app.models.candidates import Candidate

assessment_bp = Blueprint("assessment_bp", __name__, url_prefix="/api/v1/assessment")


# --- Pydantic Validation Schema ---
class AssessmentSchema(BaseModel):
    candidate_id: UUID
    training: str
    date: Optional[str] = None  # Format: YYYY-MM-DD
    status: Optional[str] = None
    mark: Optional[float] = None
    remarks: Optional[str] = None


# --- POST: Create new assessment ---
@assessment_bp.route("/create", methods=["POST"])
def create_assessment():
    try:
        data = AssessmentSchema(**request.json)

        candidate = Candidate.query.get(data.candidate_id)
        if not candidate:
            return jsonify({"error": "Invalid Candidate ID"}), 400

        new_assessment = Assessment(
            candidate_id=data.candidate_id,
            training=data.training,
            date=datetime.strptime(data.date, "%Y-%m-%d") if data.date else datetime.utcnow(),
            status=data.status,
            mark=data.mark,
            remarks=data.remarks,
        )

        db.session.add(new_assessment)
        db.session.commit()

        return jsonify({"message": "Assessment recorded successfully", "id": str(new_assessment.id)}), 201

    except ValidationError as e:
        return jsonify({"validation_errors": e.errors()}), 400
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# --- GET: All assessments ---
@assessment_bp.route("/get-all", methods=["GET"])
def get_all_assessments():
    assessments = Assessment.query.all()
    return jsonify([
        {
            "id": str(a.id),
            "candidate_id": str(a.candidate_id),
            "training": a.training,
            "date": a.date.strftime("%Y-%m-%d"),
            "status": a.status,
            "mark": a.mark,
            "remarks": a.remarks
        } for a in assessments
    ]), 200


# --- GET BY ID ---
@assessment_bp.route("/get/<uuid:assessment_id>", methods=["GET"])
def get_assessment_by_id(assessment_id):
    assessment = Assessment.query.get(assessment_id)
    if not assessment:
        return jsonify({"error": "Assessment not found"}), 404

    return jsonify({
        "id": str(assessment.id),
        "candidate_id": str(assessment.candidate_id),
        "training": assessment.training,
        "date": assessment.date.strftime("%Y-%m-%d"),
        "status": assessment.status,
        "mark": assessment.mark,
        "remarks": assessment.remarks
    }), 200


# --- PUT: Bulk update (optional) ---
@assessment_bp.route("/update-all", methods=["PUT"])
def bulk_update_assessment():
    data = request.json
    if not isinstance(data, list):
        return jsonify({"error": "Expected array of objects"}), 400

    updated = 0
    for item in data:
        try:
            validated = AssessmentSchema(**item)
            record = Assessment.query.filter_by(candidate_id=validated.candidate_id).first()

            if record:
                if validated.date:
                    record.date = datetime.strptime(validated.date, "%Y-%m-%d")
                record.training = validated.training
                record.status = validated.status
                record.mark = validated.mark
                record.remarks = validated.remarks
                updated += 1
        except:
            continue

    db.session.commit()
    return jsonify({"message": f"{updated} assessment records updated"}), 200


# --- PUT BY ID ---
@assessment_bp.route("/update/<uuid:assessment_id>", methods=["PUT"])
def update_assessment(assessment_id):
    record = Assessment.query.get(assessment_id)
    if not record:
        return jsonify({"error": "Assessment not found"}), 404

    try:
        data = AssessmentSchema(**request.json)

        candidate = Candidate.query.get(data.candidate_id)
        if not candidate:
            return jsonify({"error": "Invalid Candidate ID"}), 400

        record.candidate_id = data.candidate_id
        record.training = data.training
        record.date = datetime.strptime(data.date, "%Y-%m-%d") if data.date else record.date
        record.status = data.status
        record.mark = data.mark
        record.remarks = data.remarks

        db.session.commit()
        return jsonify({"message": "Assessment updated successfully"}), 200

    except ValidationError as e:
        return jsonify({"validation_errors": e.errors()}), 400


# --- DELETE: All assessments ---
@assessment_bp.route("/delete-all", methods=["DELETE"])
def delete_all_assessments():
    db.session.query(Assessment).delete()
    db.session.commit()
    return jsonify({"message": "All assessment records deleted"}), 200


# --- DELETE BY ID ---
@assessment_bp.route("/delete/<uuid:assessment_id>", methods=["DELETE"])
def delete_assessment(assessment_id):
    record = Assessment.query.get(assessment_id)
    if not record:
        return jsonify({"error": "Assessment not found"}), 404

    db.session.delete(record)
    db.session.commit()
    return jsonify({"message": "Assessment deleted successfully"}), 200
