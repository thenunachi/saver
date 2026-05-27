from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import Goal, Deposit
from sqlalchemy import func
from datetime import date, timedelta
from collections import defaultdict

stats_bp = Blueprint("stats", __name__, url_prefix="/api/stats")


@stats_bp.route("", methods=["GET"])
@jwt_required()
def overview():
    user_id  = int(get_jwt_identity())
    goals    = Goal.query.filter_by(user_id=user_id).all()
    goal_ids = [g.id for g in goals]

    total_target = sum(g.target_amount for g in goals)
    total_saved  = sum(g.saved_amount   for g in goals)
    completed    = sum(1 for g in goals if g.is_completed)
    active       = len(goals) - completed

    # monthly savings over last 6 months
    six_months_ago = date.today() - timedelta(days=180)
    deposits = []
    if goal_ids:
        deposits = (
            Deposit.query
            .filter(Deposit.goal_id.in_(goal_ids))
            .filter(Deposit.date >= six_months_ago)
            .order_by(Deposit.date)
            .all()
        )

    monthly = defaultdict(float)
    for d in deposits:
        key = d.date.strftime("%Y-%m")
        monthly[key] += d.amount

    # fill in missing months with 0
    months_data = []
    for i in range(5, -1, -1):
        m_date = date.today().replace(day=1) - timedelta(days=i * 30)
        key    = m_date.strftime("%Y-%m")
        label  = m_date.strftime("%b %Y")
        months_data.append({"month": label, "saved": round(monthly.get(key, 0), 2)})

    # savings by category
    cat_totals = defaultdict(float)
    for g in goals:
        cat_totals[g.category] += g.saved_amount
    category_data = [{"category": k, "saved": round(v, 2)} for k, v in cat_totals.items()]

    return jsonify({
        "total_target":   round(total_target, 2),
        "total_saved":    round(total_saved,  2),
        "overall_pct":    round((total_saved / total_target * 100) if total_target else 0, 2),
        "active_goals":   active,
        "completed_goals": completed,
        "total_goals":    len(goals),
        "monthly_savings": months_data,
        "category_breakdown": category_data,
    }), 200
