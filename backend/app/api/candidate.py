from flask import Blueprint, request, jsonify
from pydantic import BaseModel, ValidationError
from typing import Optional, List
from sqlalchemy.exc import SQLAlchemyError
from uuid import UUID

from app.database import db
from ..models.candidates import Candidate
from app.helpers.utils import get_location_by_pincode

candidate_bp = Blueprint('candidate_bp', __name__, url_prefix='/api/v1/candidates')


# --- Pydantic Schema for Validation ---
class CandidateSchema(BaseModel):
    name: str
    contact: str
    gender: str
    business_type: Optional[List[str]] = None
    pin_code: str
    udyam_certificate: bool
    phone_type: str
    disability_cat: bool  # Added field


# Schema for updating including status
class CandidateUpdateSchema(CandidateSchema):
    status: Optional[str] = None  # Only editable here


# --- POST: Create New Candidate ---
@candidate_bp.route('/create', methods=['POST'])
def create_candidate():
    try:
        data = CandidateSchema(**request.json)

        # Fetch location from PIN
        location = get_location_by_pincode(data.pin_code)
        if not location:
            return jsonify({"error": "Invalid Pincode"}), 400

        new_candidate = Candidate(
            name=data.name,
            contact=data.contact,
            gender=data.gender,
            business_type=data.business_type,
            pin_code=data.pin_code,
            udyam_certificate=data.udyam_certificate,
            phone_type=data.phone_type,
            disability_cat=data.disability_cat,  # Added
            state=location["state"],
            district=location["district"],
            taluk=location["city"],
            status="Active"  # Default
        )

        db.session.add(new_candidate)
        db.session.commit()

        return jsonify({"message": "Candidate registered successfully", "id": str(new_candidate.id)}), 201

    except ValidationError as e:
        return jsonify({"validation_errors": e.errors()}), 400
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# --- GET: Fetch All Candidates ---
@candidate_bp.route('/get-all', methods=['GET'])
def get_all_candidates():
    candidates = Candidate.query.all()
    return jsonify([
        {
            "id": str(c.id),
            "name": c.name,
            "contact": c.contact,
            "gender": c.gender,
            "business_type": c.business_type,
            "state": c.state,
            "district": c.district,
            "taluk": c.taluk,
            "pin_code": c.pin_code,
            "udyam_certificate": c.udyam_certificate,
            "phone_type": c.phone_type,
            "disability_cat": c.disability_cat,  # Added
            "status": c.status
        }
        for c in candidates
    ]), 200


# --- GET BY ID ---
@candidate_bp.route('/get/<uuid:candidate_id>', methods=['GET'])
def get_candidate_by_id(candidate_id):
    candidate = Candidate.query.get(candidate_id)
    if not candidate:
        return jsonify({"error": "Candidate not found"}), 404

    return jsonify({
        "id": str(candidate.id),
        "name": candidate.name,
        "contact": candidate.contact,
        "gender": candidate.gender,
        "business_type": candidate.business_type,
        "state": candidate.state,
        "district": candidate.district,
        "taluk": candidate.taluk,
        "pin_code": candidate.pin_code,
        "udyam_certificate": candidate.udyam_certificate,
        "phone_type": candidate.phone_type,
        "disability_cat": candidate.disability_cat,  # Added
        "status": candidate.status
    }), 200


# --- PUT: Bulk Update (no status change) ---
@candidate_bp.route('/update-all', methods=['PUT'])
def update_candidates():
    data = request.json  # Expecting list
    if not isinstance(data, list):
        return jsonify({"error": "Expected list of objects"}), 400

    updated = 0
    for item in data:
        try:
            validated = CandidateSchema(**item)
            candidate = Candidate.query.filter_by(contact=validated.contact).first()
            if candidate:
                location = get_location_by_pincode(validated.pin_code)
                if location:
                    candidate.name = validated.name
                    candidate.gender = validated.gender
                    candidate.business_type = validated.business_type
                    candidate.udyam_certificate = validated.udyam_certificate
                    candidate.phone_type = validated.phone_type
                    candidate.disability_cat = validated.disability_cat  # Added
                    candidate.pin_code = validated.pin_code
                    candidate.state = location["state"]
                    candidate.district = location["district"]
                    candidate.taluk = location["city"]
                    updated += 1
        except:
            continue

    db.session.commit()
    return jsonify({"message": f"{updated} candidates updated"}), 200


# --- PUT by ID (can update status here) ---
@candidate_bp.route('/update/<uuid:candidate_id>', methods=['PUT'])
def update_candidate_by_id(candidate_id):
    candidate = Candidate.query.get(candidate_id)
    if not candidate:
        return jsonify({"error": "Candidate not found"}), 404

    try:
        data = CandidateUpdateSchema(**request.json)
        location = get_location_by_pincode(data.pin_code)

        # Update fields
        candidate.name = data.name
        candidate.contact = data.contact
        candidate.gender = data.gender
        candidate.business_type = data.business_type
        candidate.udyam_certificate = data.udyam_certificate
        candidate.phone_type = data.phone_type
        candidate.disability_cat = data.disability_cat  # Added
        candidate.pin_code = data.pin_code
        candidate.state = location["state"]
        candidate.district = location["district"]
        candidate.taluk = location["city"]

        if data.status:
            candidate.status = data.status  # Allowed only here

        db.session.commit()
        return jsonify({"message": "Candidate updated successfully"}), 200

    except ValidationError as e:
        return jsonify({"validation_errors": e.errors()}), 400


# --- DELETE ALL (soft delete optional) ---
@candidate_bp.route('/delete-all', methods=['DELETE'])
def delete_all_candidates():
    candidates = Candidate.query.all()
    for candidate in candidates:
        candidate.status = "Inactive"
    db.session.commit()
    return jsonify({"message": "All candidates marked as Inactive"}), 200


# --- DELETE BY ID (soft delete) ---
@candidate_bp.route('/delete/<uuid:candidate_id>', methods=['DELETE'])
def delete_candidate(candidate_id):
    candidate = Candidate.query.get(candidate_id)
    if not candidate:
        return jsonify({"error": "Candidate not found"}), 404

    candidate.status = "Inactive"
    db.session.commit()
    return jsonify({"message": "Candidate marked as Inactive"}), 200
