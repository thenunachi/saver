from flask import Flask
from flask_cors import CORS
from config import Config
from extensions import db, jwt
from routes import auth_bp, goals_bp, deposits_bp, stats_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app, resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}},
         supports_credentials=True)

    db.init_app(app)
    jwt.init_app(app)

    app.register_blueprint(auth_bp)
    app.register_blueprint(goals_bp)
    app.register_blueprint(deposits_bp)
    app.register_blueprint(stats_bp)

    with app.app_context():
        db.create_all()
        # Safe migration: add sort_order column if it doesn't exist yet
        from sqlalchemy import text, inspect
        inspector = inspect(db.engine)
        cols = [c["name"] for c in inspector.get_columns("goals")]
        if "sort_order" not in cols:
            with db.engine.connect() as conn:
                conn.execute(text("ALTER TABLE goals ADD COLUMN sort_order INTEGER DEFAULT 0"))
                conn.commit()

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5050)
