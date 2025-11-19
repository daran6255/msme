from flask import Blueprint, request, jsonify
from pydantic import BaseModel, conint, confloat, ValidationError
from typing import Optional, Annotated
from uuid import UUID
from datetime import datetime
from sqlalchemy.exc import SQLAlchemyError

from app.database import db
from app.models.business import Business
from app.models.candidates import Candidate

business_bp = Blueprint("business_bp", __name__, url_prefix="/api/v1/business")


# -------------------------
# Pydantic Validation Model
# -------------------------
class BusinessSchema(BaseModel):
    candidate_id: UUID
    customers_before: Optional[Annotated[int, conint(ge=0)]] = None
    customers_after: Optional[Annotated[int, conint(ge=0)]] = None
    income_before: Optional[Annotated[float, confloat(ge=0)]] = None
    income_after: Optional[Annotated[float, confloat(ge=0)]] = None


# -------------------------
# POST: Create Business entry
# -------------------------
@business_bp.route("", methods=["POST"])
def create_business():
    try:
        data = BusinessSchema(**request.json)

        # Validate candidate existence
        candidate = Candidate.query.get(data.candidate_id)
        if not candidate:
            return jsonify({"error": "Invalid candidate_id"}), 400

        new_record = Business(
            candidate_id=data.candidate_id,
            customers_before=data.customers_before,
            customers_after=data.customers_after,
            income_before=data.income_before,
            income_after=data.income_after,
        )

        db.session.add(new_record)
        db.session.commit()

        return jsonify({"message": "Business record created", "id": str(new_record.id)}), 201

    except ValidationError as e:
        return jsonify({"validation_errors": e.errors()}), 400
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# -------------------------
# GET: All Business records
# -------------------------
@business_bp.route("", methods=["GET"])
def get_all_business():
    try:
        records = Business.query.order_by(Business.created_at.desc()).all()
        payload = [
            {
                "id": str(r.id),
                "candidate_id": str(r.candidate_id),
                "customers_before": r.customers_before,
                "customers_after": r.customers_after,
                "income_before": r.income_before,
                "income_after": r.income_after,
                "created_at": r.created_at.isoformat()
            }
            for r in records
        ]
        return jsonify(payload), 200
    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500


# -------------------------
# GET BY ID
# -------------------------
@business_bp.route("/<uuid:business_id>", methods=["GET"])
def get_business_by_id(business_id):
    record = Business.query.get(business_id)
    if not record:
        return jsonify({"error": "Business record not found"}), 404

    return jsonify({
        "id": str(record.id),
        "candidate_id": str(record.candidate_id),
        "customers_before": record.customers_before,
        "customers_after": record.customers_after,
        "income_before": record.income_before,
        "income_after": record.income_after,
        "created_at": record.created_at.isoformat()
    }), 200


# -------------------------
# PUT: Bulk update records
# Expecting a list of objects (each with candidate_id or id)
# -------------------------
@business_bp.route("", methods=["PUT"])
def bulk_update_business():
    payload = request.json
    if not isinstance(payload, list):
        return jsonify({"error": "Expected a list of business objects"}), 400

    updated = 0
    for item in payload:
        try:
            # Accept either `id` (record id) or `candidate_id` to find the record
            if "id" in item:
                record = Business.query.get(item["id"])
            elif "candidate_id" in item:
                record = Business.query.filter_by(candidate_id=item["candidate_id"]).first()
            else:
                continue

            if not record:
                continue

            validated = BusinessSchema(**{
                "candidate_id": record.candidate_id,
                "customers_before": item.get("customers_before", record.customers_before),
                "customers_after": item.get("customers_after", record.customers_after),
                "income_before": item.get("income_before", record.income_before),
                "income_after": item.get("income_after", record.income_after),
            })

            record.customers_before = validated.customers_before
            record.customers_after = validated.customers_after
            record.income_before = validated.income_before
            record.income_after = validated.income_after

            updated += 1

        except ValidationError:
            continue
        except Exception:
            continue

    try:
        db.session.commit()
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

    return jsonify({"message": f"{updated} records updated"}), 200


# -------------------------
# PUT BY ID: Update specific business record
# -------------------------
@business_bp.route("/<uuid:business_id>", methods=["PUT"])
def update_business(business_id):
    record = Business.query.get(business_id)
    if not record:
        return jsonify({"error": "Business record not found"}), 404

    try:
        data = BusinessSchema(**request.json)

        # Ensure candidate exists
        candidate = Candidate.query.get(data.candidate_id)
        if not candidate:
            return jsonify({"error": "Invalid candidate_id"}), 400

        record.candidate_id = data.candidate_id
        record.customers_before = data.customers_before
        record.customers_after = data.customers_after
        record.income_before = data.income_before
        record.income_after = data.income_after

        db.session.commit()
        return jsonify({"message": "Business record updated"}), 200

    except ValidationError as e:
        return jsonify({"validation_errors": e.errors()}), 400
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# -------------------------
# DELETE ALL
# -------------------------
@business_bp.route("", methods=["DELETE"])
def delete_all_business():
    try:
        db.session.query(Business).delete()
        db.session.commit()
        return jsonify({"message": "All business records deleted"}), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# -------------------------
# DELETE BY ID
# -------------------------
@business_bp.route("/<uuid:business_id>", methods=["DELETE"])
def delete_business(business_id):
    record = Business.query.get(business_id)
    if not record:
        return jsonify({"error": "Business record not found"}), 404

    try:
        db.session.delete(record)
        db.session.commit()
        return jsonify({"message": "Business record deleted"}), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
