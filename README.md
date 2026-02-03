# Meal Voucher Tracker PWA

Progressive Web App for tracking employee meal vouchers with QR scanning, offline support, and daily reports.

For an implementation walkthrough and checklist, see `implementation_summery.md`.

## Features
- QR check-in/check-out with manual fallback
- Offline queue with background sync
- Printable voucher output
- Admin PIN-protected imports and reports
- Daily CSV report generation + email scheduling

## Project Layout
- `backend/` FastAPI service (SQLite)
- `frontend/` React + Vite PWA
- `docker-compose.yml` Local container orchestration

## Quick Start (Docker)
```bash
docker-compose up --build
```
- Backend: `http://localhost:8000`
- Frontend: `http://localhost:5173`

## Backend (Local)
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Backend Env Vars
- `DATABASE_URL` default `sqlite:///./mealvoucher.db`
- `ADMIN_PIN` default `1234`
- `REPORT_HOUR` default `18`
- `REPORT_MINUTE` default `0`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`, `SMTP_TO`
- `REPORT_DIR` default `./reports`
- `DISABLE_SCHEDULER=1` disables APScheduler (useful for tests)

### Seed Demo Data
```bash
cd backend
python scripts/seed_demo.py
```

### Tests
```bash
cd backend
pip install -r requirements-dev.txt
pytest
```

## Frontend (Local)
```bash
cd frontend
npm install
npm run dev
```

### Frontend Env Vars
- `VITE_API_URL` API base URL (default `http://localhost:8000`)

## Usage Notes
- Admin PIN is required for CSV import and daily report download.
- PWA background sync queues offline vouchers and pushes when online.
- QR scanning requires HTTPS or localhost for camera permissions.

## API Overview
- `GET /api/employees`
- `POST /api/employees` (PIN)
- `POST /api/employees/import` (PIN)
- `GET /api/vouchers`
- `POST /api/vouchers/checkin`
- `POST /api/vouchers/checkout`
- `POST /api/vouchers/sync`
- `GET /api/reports/daily` (PIN)
- `POST /api/auth/verify-pin`

For more details on what was implemented and how it maps to the plan, see `implementation_summery.md`.
