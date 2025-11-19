from flask import Blueprint, request, jsonify
from pydantic import BaseModel, ValidationError
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from sqlalchemy.exc import SQLAlchemyError

from app.database import db
from app.models.attendance import Attendance
from app.models.candidates import Candidate

attendance_bp = Blueprint("attendance_bp", __name__, url_prefix="/api/v1/attendance")


# --- Pydantic Validation Schema ---
class AttendanceSchema(BaseModel):
    candidate_id: UUID
    session_name: Optional[List[str]] = None
    attended: bool
    date: Optional[str] = None  # Format: "YYYY-MM-DD"
    remarks: Optional[str] = None


# --- POST: Create attendance ---
@attendance_bp.route("/create", methods=["POST"])
def create_attendance():
    try:
        data = AttendanceSchema(**request.json)

        # Validate candidate
        candidate = Candidate.query.get(data.candidate_id)
        if not candidate:
            return jsonify({"error": "Invalid Candidate ID"}), 400

        new_attendance = Attendance(
            candidate_id=data.candidate_id,
            session_name=data.session_name,
            attended=data.attended,
            date=datetime.strptime(data.date, "%Y-%m-%d") if data.date else datetime.utcnow(),
            remarks=data.remarks
        )

        db.session.add(new_attendance)
        db.session.commit()
        return jsonify({"message": "Attendance added successfully", "id": str(new_attendance.id)}), 201

    except ValidationError as e:
        return jsonify({"validation_errors": e.errors()}), 400
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# --- GET: Get all attendance records ---
@attendance_bp.route("/get-all", methods=["GET"])
def get_all_attendance():
    records = Attendance.query.all()
    return jsonify([
        {
            "id": str(a.id),
            "candidate_id": str(a.candidate_id),
            "session_name": a.session_name,
            "attended": a.attended,
            "date": a.date.strftime("%Y-%m-%d"),
            "remarks": a.remarks
        } for a in records
    ]), 200


# --- GET BY ID ---
@attendance_bp.route("/get/<uuid:attendance_id>", methods=["GET"])
def get_attendance_by_id(attendance_id):
    record = Attendance.query.get(attendance_id)
    if not record:
        return jsonify({"error": "Attendance not found"}), 404

    return jsonify({
        "id": str(record.id),
        "candidate_id": str(record.candidate_id),
        "session_name": record.session_name,
        "attended": record.attended,
        "date": record.date.strftime("%Y-%m-%d"),
        "remarks": record.remarks
    }), 200


# --- PUT: Bulk update (optional) ---
@attendance_bp.route("/update-all", methods=["PUT"])
def update_attendance_bulk():
    data = request.json
    if not isinstance(data, list):
        return jsonify({"error": "Expected list of attendance objects"}), 400

    updated = 0
    for item in data:
        try:
            validated = AttendanceSchema(**item)
            record = Attendance.query.get(validated.candidate_id)

            if record:
                if validated.date:
                    record.date = datetime.strptime(validated.date, "%Y-%m-%d")

                record.session_name = validated.session_name
                record.attended = validated.attended
                record.remarks = validated.remarks
                updated += 1
        except Exception:
            continue

    db.session.commit()
    return jsonify({"message": f"{updated} attendance records updated"}), 200


# --- PUT BY ID ---
@attendance_bp.route("/update/<uuid:attendance_id>", methods=["PUT"])
def update_attendance(attendance_id):
    record = Attendance.query.get(attendance_id)
    if not record:
        return jsonify({"error": "Attendance not found"}), 404

    try:
        data = AttendanceSchema(**request.json)

        # Verify candidate exists
        candidate = Candidate.query.get(data.candidate_id)
        if not candidate:
            return jsonify({"error": "Invalid Candidate ID"}), 400

        record.candidate_id = data.candidate_id
        record.session_name = data.session_name
        record.attended = data.attended
        record.date = datetime.strptime(data.date, "%Y-%m-%d") if data.date else record.date
        record.remarks = data.remarks

        db.session.commit()
        return jsonify({"message": "Attendance updated successfully"}), 200

    except ValidationError as e:
        return jsonify({"validation_errors": e.errors()}), 400


# --- DELETE ALL ---
@attendance_bp.route("/delete-all", methods=["DELETE"])
def delete_all_attendance():
    db.session.query(Attendance).delete()
    db.session.commit()
    return jsonify({"message": "All attendance records deleted"}), 200


# --- DELETE BY ID ---
@attendance_bp.route("/delete/<uuid:attendance_id>", methods=["DELETE"])
def delete_attendance(attendance_id):
    record = Attendance.query.get(attendance_id)
    if not record:
        return jsonify({"error": "Attendance not found"}), 404

    db.session.delete(record)
    db.session.commit()
    return jsonify({"message": "Attendance deleted successfully"}), 200
