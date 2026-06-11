from flask import Blueprint, jsonify
from extensions import db
from sqlalchemy import text, inspect
import os
import traceback

health_bp = Blueprint("health", __name__, url_prefix="/api")

@health_bp.route("/health", methods=["GET"])
def health():
    db_url = os.getenv("DATABASE_URL", "NOT SET")
    db_type = "sqlite" if "sqlite" in db_url else "postgres" if db_url != "NOT SET" else "NOT SET"

    try:
        db.session.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        db_status = f"ERROR: {str(e)}"

    try:
        insp = inspect(db.engine)
        tables = insp.get_table_names()
        users_cols = [c["name"] for c in insp.get_columns("users")] if "users" in tables else None
    except Exception as e:
        tables = f"ERROR: {str(e)}"
        users_cols = None

    register_status = "ok"
    try:
        from models import User
        user = User(name="__healthcheck__", email="__healthcheck__@example.com")
        user.set_password("password123")
        db.session.add(user)
        db.session.flush()
        db.session.rollback()
    except Exception:
        register_status = traceback.format_exc()
        db.session.rollback()

    return jsonify({
        "status":   "ok",
        "db_type":  db_type,
        "db_status": db_status,
        "tables": tables,
        "users_cols": users_cols,
        "register_status": register_status,
    }), 200
