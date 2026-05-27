from extensions import db
from datetime import datetime

CATEGORIES = [
    "Emergency Fund", "Vacation", "Home", "Car", "Education",
    "Retirement", "Wedding", "Tech", "Health", "Other"
]

class Goal(db.Model):
    __tablename__ = "goals"

    id           = db.Column(db.Integer, primary_key=True)
    user_id      = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    name         = db.Column(db.String(200), nullable=False)
    description  = db.Column(db.Text, default="")
    target_amount = db.Column(db.Float, nullable=False)
    category     = db.Column(db.String(80), default="Other")
    color        = db.Column(db.String(20), default="#6366f1")   # hex colour
    icon         = db.Column(db.String(20), default="🎯")
    deadline     = db.Column(db.Date, nullable=True)
    is_completed = db.Column(db.Boolean, default=False)
    sort_order   = db.Column(db.Integer, default=0)
    created_at   = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at   = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    deposits     = db.relationship("Deposit", backref="goal", lazy=True, cascade="all, delete-orphan")

    @property
    def saved_amount(self):
        return sum(d.amount for d in self.deposits)

    @property
    def progress_pct(self):
        if self.target_amount == 0:
            return 0
        return min(round((self.saved_amount / self.target_amount) * 100, 2), 100)

    def to_dict(self):
        return {
            "id":            self.id,
            "user_id":       self.user_id,
            "name":          self.name,
            "description":   self.description,
            "target_amount": self.target_amount,
            "saved_amount":  self.saved_amount,
            "progress_pct":  self.progress_pct,
            "category":      self.category,
            "color":         self.color,
            "icon":          self.icon,
            "deadline":      self.deadline.isoformat() if self.deadline else None,
            "is_completed":  self.is_completed,
            "sort_order":    self.sort_order,
            "created_at":    self.created_at.isoformat(),
            "updated_at":    self.updated_at.isoformat(),
        }
