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
        tables = inspect(db.engine).get_table_names()
    except Exception as e:
        tables = f"ERROR: {str(e)}"

    bcrypt_status = "ok"
    try:
        import bcrypt
        bcrypt.checkpw(b"x", bcrypt.hashpw(b"x", bcrypt.gensalt()))
    except Exception:
        bcrypt_status = traceback.format_exc()

    return jsonify({
        "status":   "ok",
        "db_type":  db_type,
        "db_status": db_status,
        "tables": tables,
        "bcrypt_status": bcrypt_status,
    }), 200
