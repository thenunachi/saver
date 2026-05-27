from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import Goal, Deposit
from datetime import date

deposits_bp = Blueprint("deposits", __name__, url_prefix="/api")


def _check_goal_ownership(goal_id, user_id):
    return Goal.query.filter_by(id=goal_id, user_id=user_id).first()


# ── list all deposits for a goal ────────────────────────────────────────────
@deposits_bp.route("/goals/<int:goal_id>/deposits", methods=["GET"])
@jwt_required()
def list_deposits(goal_id):
    user_id = int(get_jwt_identity())
    goal    = _check_goal_ownership(goal_id, user_id)
    if not goal:
        return jsonify({"error": "goal not found"}), 404
    deposits = Deposit.query.filter_by(goal_id=goal_id).order_by(Deposit.date.desc()).all()
    return jsonify([d.to_dict() for d in deposits]), 200


# ── add a deposit ────────────────────────────────────────────────────────────
@deposits_bp.route("/goals/<int:goal_id>/deposits", methods=["POST"])
@jwt_required()
def add_deposit(goal_id):
    user_id = int(get_jwt_identity())
    goal    = _check_goal_ownership(goal_id, user_id)
    if not goal:
        return jsonify({"error": "goal not found"}), 404

    data   = request.get_json() or {}
    amount = data.get("amount")
    if amount is None:
        return jsonify({"error": "amount is required"}), 400
    try:
        amount = float(amount)
        if amount <= 0:
            raise ValueError
    except (ValueError, TypeError):
        return jsonify({"error": "amount must be a positive number"}), 400

    dep_date = None
    if data.get("date"):
        try:
            dep_date = date.fromisoformat(data["date"])
        except ValueError:
            dep_date = None
    if dep_date is None:
        dep_date = date.today()

    deposit = Deposit(
        goal_id = goal_id,
        amount  = amount,
        note    = data.get("note", ""),
        date    = dep_date,
    )
    db.session.add(deposit)

    # auto-mark goal complete when target reached
    db.session.flush()
    if goal.saved_amount >= goal.target_amount:
        goal.is_completed = True

    db.session.commit()
    return jsonify({
        "deposit": deposit.to_dict(),
        "goal":    goal.to_dict(),
    }), 201


# ── delete a deposit ─────────────────────────────────────────────────────────
@deposits_bp.route("/deposits/<int:deposit_id>", methods=["DELETE"])
@jwt_required()
def delete_deposit(deposit_id):
    user_id = int(get_jwt_identity())
    deposit = Deposit.query.get_or_404(deposit_id)
    goal    = _check_goal_ownership(deposit.goal_id, user_id)
    if not goal:
        return jsonify({"error": "not authorized"}), 403

    db.session.delete(deposit)

    # re-evaluate completion after deletion
    db.session.flush()
    if goal.saved_amount < goal.target_amount:
        goal.is_completed = False

    db.session.commit()
    return jsonify({"message": "deposit deleted", "goal": goal.to_dict()}), 200


# ── recent deposits across ALL goals for a user ──────────────────────────────
@deposits_bp.route("/deposits", methods=["GET"])
@jwt_required()
def all_deposits():
    user_id  = int(get_jwt_identity())
    limit    = min(int(request.args.get("limit", 50)), 200)
    goal_ids = [g.id for g in Goal.query.filter_by(user_id=user_id).all()]
    if not goal_ids:
        return jsonify([]), 200

    deposits = (
        Deposit.query
        .filter(Deposit.goal_id.in_(goal_ids))
        .order_by(Deposit.date.desc(), Deposit.created_at.desc())
        .limit(limit)
        .all()
    )
    return jsonify([d.to_dict() for d in deposits]), 200
