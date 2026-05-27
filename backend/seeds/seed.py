"""
Seed the database with a demo user + goals + deposits.
Run from the backend/ folder:  python seeds/seed.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app import create_app
from extensions import db
from models import User, Goal, Deposit
from datetime import date, timedelta
import random

app = create_app()

GOALS_DATA = [
    {"name": "Emergency Fund",    "category": "Emergency Fund", "target": 10000, "icon": "🛡️",  "color": "#ef4444", "desc": "6 months of expenses"},
    {"name": "Japan Vacation",    "category": "Vacation",       "target": 4500,  "icon": "✈️",  "color": "#f59e0b", "desc": "2-week trip to Japan"},
    {"name": "New MacBook Pro",   "category": "Tech",           "target": 2500,  "icon": "💻",  "color": "#3b82f6", "desc": "M3 Pro model"},
    {"name": "Down Payment",      "category": "Home",           "target": 50000, "icon": "🏠",  "color": "#10b981", "desc": "20% down on first home"},
    {"name": "Wedding Fund",      "category": "Wedding",        "target": 15000, "icon": "💍",  "color": "#ec4899", "desc": "Dream wedding"},
    {"name": "Retirement IRA",    "category": "Retirement",     "target": 7000,  "icon": "🌴",  "color": "#8b5cf6", "desc": "Max Roth IRA contribution"},
]

with app.app_context():
    db.drop_all()
    db.create_all()

    # demo user
    user = User(name="Demo User", email="demo@savings.app")
    user.set_password("password123")
    db.session.add(user)
    db.session.flush()

    today = date.today()

    for i, gd in enumerate(GOALS_DATA):
        goal = Goal(
            user_id       = user.id,
            name          = gd["name"],
            description   = gd["desc"],
            target_amount = gd["target"],
            category      = gd["category"],
            icon          = gd["icon"],
            color         = gd["color"],
            deadline      = today + timedelta(days=random.randint(90, 730)),
        )
        db.session.add(goal)
        db.session.flush()

        # add random deposits over the last 6 months
        deposit_count = random.randint(4, 12)
        for _ in range(deposit_count):
            d_date  = today - timedelta(days=random.randint(0, 180))
            amount  = round(random.uniform(gd["target"] * 0.03, gd["target"] * 0.12), 2)
            deposit = Deposit(goal_id=goal.id, amount=amount, date=d_date, note="Regular savings")
            db.session.add(deposit)

        db.session.flush()
        if goal.saved_amount >= goal.target_amount:
            goal.is_completed = True

    db.session.commit()
    print("✅  Database seeded! Login: demo@savings.app / password123")
