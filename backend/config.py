import os
from dotenv import load_dotenv

load_dotenv()

def _db_url():
    url = os.getenv("DATABASE_URL", "sqlite:///savings.db")
    # Render (and older Heroku) gives "postgres://..." but SQLAlchemy 1.4+
    # requires "postgresql://..."
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)
    return url

class Config:
    SECRET_KEY             = os.getenv("SECRET_KEY", "dev-secret-key")
    JWT_SECRET_KEY         = os.getenv("JWT_SECRET_KEY", "dev-jwt-secret")
    SQLALCHEMY_DATABASE_URI = _db_url()
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_ACCESS_TOKEN_EXPIRES = False   # set timedelta in production
    CORS_ORIGINS           = os.getenv("CORS_ORIGINS", "http://localhost:5173")
