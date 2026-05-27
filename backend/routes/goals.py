from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import Goal
from datetime import date

goals_bp = Blueprint("goals", __name__, url_prefix="/api/goals")


def _parse_deadline(val):
    if not val:
        return None
    try:
        return date.fromisoformat(val)
    except ValueError:
        return None


@goals_bp.route("", methods=["GET"])
@jwt_required()
def list_goals():
    user_id  = int(get_jwt_identity())
    category = request.args.get("category")
    status   = request.args.get("status")          # "active" | "completed"
    sort     = request.args.get("sort", "created_at")   # "created_at" | "progress" | "deadline"

    q = Goal.query.filter_by(user_id=user_id)
    if category:
        q = q.filter_by(category=category)
    if status == "completed":
        q = q.filter_by(is_completed=True)
    elif status == "active":
        q = q.filter_by(is_completed=False)

    goals = q.all()

    # Python-side sorting for computed fields
    if sort == "progress":
        goals.sort(key=lambda g: g.progress_pct, reverse=True)
    elif sort == "deadline":
        goals.sort(key=lambda g: (g.deadline is None, g.deadline))
    elif sort == "created_at":
        goals.sort(key=lambda g: g.created_at, reverse=True)
    else:
        # default: custom drag order (sort_order ASC, then created_at DESC as tiebreaker)
        goals.sort(key=lambda g: (g.sort_order, -g.created_at.timestamp()))

    return jsonify([g.to_dict() for g in goals]), 200


@goals_bp.route("", methods=["POST"])
@jwt_required()
def create_goal():
    user_id = int(get_jwt_identity())
    data    = request.get_json() or {}

    name          = data.get("name", "").strip()
    target_amount = data.get("target_amount")

    if not name or target_amount is None:
        return jsonify({"error": "name and target_amount are required"}), 400
    try:
        target_amount = float(target_amount)
        if target_amount <= 0:
            raise ValueError
    except (ValueError, TypeError):
        return jsonify({"error": "target_amount must be a positive number"}), 400

    goal = Goal(
        user_id       = user_id,
        name          = name,
        description   = data.get("description", ""),
        target_amount = target_amount,
        category      = data.get("category", "Other"),
        color         = data.get("color", "#6366f1"),
        icon          = data.get("icon", "🎯"),
        deadline      = _parse_deadline(data.get("deadline")),
    )
    db.session.add(goal)
    db.session.commit()
    return jsonify(goal.to_dict()), 201


@goals_bp.route("/reorder", methods=["PATCH"])
@jwt_required()
def reorder_goals():
    """Accepts [{id, sort_order}, …] and persists the new order."""
    user_id = int(get_jwt_identity())
    items   = request.get_json() or []
    for item in items:
        goal = Goal.query.filter_by(id=item.get("id"), user_id=user_id).first()
        if goal:
            goal.sort_order = item.get("sort_order", 0)
    db.session.commit()
    return jsonify({"message": "order saved"}), 200


@goals_bp.route("/<int:goal_id>", methods=["GET"])
@jwt_required()
def get_goal(goal_id):
    user_id = int(get_jwt_identity())
    goal = Goal.query.filter_by(id=goal_id, user_id=user_id).first_or_404()
    return jsonify(goal.to_dict()), 200


@goals_bp.route("/<int:goal_id>", methods=["PUT"])
@jwt_required()
def update_goal(goal_id):
    user_id = int(get_jwt_identity())
    goal    = Goal.query.filter_by(id=goal_id, user_id=user_id).first_or_404()
    data    = request.get_json() or {}

    if "name"          in data: goal.name          = data["name"].strip()
    if "description"   in data: goal.description   = data["description"]
    if "target_amount" in data:
        ta = float(data["target_amount"])
        if ta <= 0:
            return jsonify({"error": "target_amount must be positive"}), 400
        goal.target_amount = ta
    if "category"      in data: goal.category      = data["category"]
    if "color"         in data: goal.color         = data["color"]
    if "icon"          in data: goal.icon          = data["icon"]
    if "deadline"      in data: goal.deadline      = _parse_deadline(data["deadline"])
    if "is_completed"  in data: goal.is_completed  = bool(data["is_completed"])

    db.session.commit()
    return jsonify(goal.to_dict()), 200


@goals_bp.route("/<int:goal_id>", methods=["DELETE"])
@jwt_required()
def delete_goal(goal_id):
    user_id = int(get_jwt_identity())
    goal    = Goal.query.filter_by(id=goal_id, user_id=user_id).first_or_404()
    db.session.delete(goal)
    db.session.commit()
    return jsonify({"message": "goal deleted"}), 200
