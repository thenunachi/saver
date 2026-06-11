from flask import Flask
from flask_cors import CORS
from config import Config
from extensions import db, jwt
from routes import auth_bp, goals_bp, deposits_bp, stats_bp, health_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app,
         resources={r"/api/*": {
             "origins": "*",
             "allow_headers": ["Content-Type", "Authorization"],
             "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
             "expose_headers": ["Authorization"],
         }})

    db.init_app(app)
    jwt.init_app(app)

    app.register_blueprint(auth_bp)
    app.register_blueprint(goals_bp)
    app.register_blueprint(deposits_bp)
    app.register_blueprint(stats_bp)
    app.register_blueprint(health_bp)

    with app.app_context():
        from sqlalchemy import text, inspect
        inspector = inspect(db.engine)

        # One-time fix: an old/incompatible "users" table from a previous
        # deployment may exist without the columns our model expects.
        # If so, drop the stale tables so create_all() can recreate them
        # with the correct schema (safe: no real data has been written yet).
        if "users" in inspector.get_table_names():
            cols = [c["name"] for c in inspector.get_columns("users")]
            if "name" not in cols or "password" not in cols:
                with db.engine.connect() as conn:
                    conn.execute(text("DROP TABLE IF EXISTS deposits CASCADE"))
                    conn.execute(text("DROP TABLE IF EXISTS goals CASCADE"))
                    conn.execute(text("DROP TABLE IF EXISTS users CASCADE"))
                    conn.commit()
                inspector = inspect(db.engine)

        db.create_all()

        # Safe migration: add sort_order column if it doesn't exist yet.
        # Works on both SQLite and PostgreSQL.
        inspector = inspect(db.engine)
        if "goals" in inspector.get_table_names():
            cols = [c["name"] for c in inspector.get_columns("goals")]
            if "sort_order" not in cols:
                with db.engine.connect() as conn:
                    conn.execute(text(
                        "ALTER TABLE goals ADD COLUMN sort_order INTEGER DEFAULT 0"
                    ))
                    conn.commit()

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5050)
