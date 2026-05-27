# 💰 Savr — Savings Tracker

A full-stack savings goal tracker with deposit tracking, progress visualisation, filtering, and JWT auth.

## Stack

| Layer    | Technology |
|----------|-----------|
| Frontend | React 18, Vite, React Router, Recharts, Lucide |
| Backend  | Flask 3, SQLAlchemy, Flask-JWT-Extended, SQLite |
| Auth     | JWT (Bearer tokens), bcrypt password hashing |

## Features

- 🎯 **Goal management** — create/edit/delete savings goals with custom icon, colour, category, deadline
- 💸 **Deposit tracking** — add/delete deposits per goal; auto-mark complete when target reached
- 📊 **Progress visualisation** — per-goal progress bars; Analytics page with area/bar/pie/radial charts
- 🔍 **Filtering** — filter by category, status (active/completed), sort by date/progress/deadline, search by name
- 🔐 **Full-stack auth** — register/login screens, JWT stored in localStorage, protected routes
- 🌙 **Dark theme** — consistent dark UI throughout

## Getting started

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# seed with demo data (optional)
python seeds/seed.py

# run
python app.py
# → http://localhost:5050
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

### Demo credentials (after seeding)

```
Email:    demo@savings.app
Password: password123
```

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login → JWT |
| GET  | `/api/auth/me` | Current user |
| GET  | `/api/goals` | List goals (filters: category, status, sort) |
| POST | `/api/goals` | Create goal |
| PUT  | `/api/goals/:id` | Update goal |
| DELETE | `/api/goals/:id` | Delete goal |
| GET  | `/api/goals/:id/deposits` | List deposits for goal |
| POST | `/api/goals/:id/deposits` | Add deposit |
| DELETE | `/api/deposits/:id` | Delete deposit |
| GET  | `/api/deposits` | All deposits (across goals) |
| GET  | `/api/stats` | Summary stats + chart data |
