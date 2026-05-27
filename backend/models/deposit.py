from extensions import db
from datetime import datetime

class Deposit(db.Model):
    __tablename__ = "deposits"

    id         = db.Column(db.Integer, primary_key=True)
    goal_id    = db.Column(db.Integer, db.ForeignKey("goals.id"), nullable=False)
    amount     = db.Column(db.Float, nullable=False)
    note       = db.Column(db.String(300), default="")
    date       = db.Column(db.Date, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id":         self.id,
            "goal_id":    self.goal_id,
            "amount":     self.amount,
            "note":       self.note,
            "date":       self.date.isoformat() if self.date else None,
            "created_at": self.created_at.isoformat(),
        }
