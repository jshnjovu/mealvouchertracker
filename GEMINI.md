# Meal Voucher Tracker PWA

This project is a Progressive Web App (PWA) designed to track employee meal vouchers. It features QR code scanning for check-in/check-out, offline support with background synchronization, and automated daily reporting.

## Project Overview

*   **Purpose:** Efficiently manage meal vouchers for employees, ensuring reliable operation even with intermittent internet connectivity.
*   **Key Features:**
    *   **QR Scanning:** Uses `html5-qrcode` to scan employee badges.
    *   **Offline First:** Uses `Dexie` (IndexedDB) to cache employee data and queue voucher transactions when offline. Syncs automatically when online.
    *   **Admin Tools:** PIN-protected area for importing employee data (CSV) and downloading reports.
    *   **Reporting:** Automated daily CSV reports generated via `APScheduler` and email delivery support.

## Architecture & Tech Stack

The application follows a standard client-server architecture, containerized with Docker.

### Backend (`/backend`)
*   **Language:** Python 3.12+
*   **Framework:** FastAPI
*   **Database:** SQLite (via SQLAlchemy)
*   **Key Libraries:**
    *   `uvicorn`: ASGI server.
    *   `pydantic`: Data validation.
    *   `apscheduler`: Scheduled tasks (reports).
    *   `aiofiles` / `aiosmtplib`: Async file I/O and email.

### Frontend (`/frontend`)
*   **Language:** TypeScript
*   **Framework:** React (Vite)
*   **UI Library:** Material UI (@mui/material)
*   **State/Data:** @tanstack/react-query
*   **Offline Storage:** Dexie.js (IndexedDB wrapper)
*   **PWA:** vite-plugin-pwa (Service Worker generation)

## Getting Started

### Prerequisites
*   Docker & Docker Compose (Recommended)
*   **OR** Node.js 18+ and Python 3.12+ for local development.

### Running with Docker (Easiest)
This brings up both the backend and frontend services.

```bash
docker-compose up --build
```
*   **Frontend:** [http://localhost:5173](http://localhost:5173)
*   **Backend API:** [http://localhost:8000](http://localhost:8000)
*   **API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)

### Local Development Setup

#### Backend
1.  Navigate to `backend/`:
    ```bash
    cd backend
    ```
2.  Create and activate a virtual environment (optional but recommended):
    ```bash
    python -m venv .venv
    source .venv/bin/activate  # Linux/Mac
    # .venv\Scripts\activate   # Windows
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Run the server:
    ```bash
    uvicorn app.main:app --reload
    ```

#### Frontend
1.  Navigate to `frontend/`:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run the dev server:
    ```bash
    npm run dev
    ```

## Key Commands & Scripts

*   **Seed Data:** Populates the database with demo employees and vouchers.
    ```bash
    # From /backend directory
    python scripts/seed_demo.py
    ```
*   **Run Tests:** Executes the backend test suite.
    ```bash
    # From /backend directory
    pip install -r requirements-dev.txt
    pytest
    ```

## Environment Variables

### Backend
| Variable | Default | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | `sqlite:///./mealvoucher.db` | Database connection string. |
| `ADMIN_PIN` | `1234` | PIN for protected admin actions. |
| `REPORT_DIR` | `./reports` | Directory to save generated CSV reports. |
| `DISABLE_SCHEDULER` | (Unset) | Set to `1` to disable background jobs (useful for testing). |

### Frontend
| Variable | Default | Description |
| :--- | :--- | :--- |
| `VITE_API_URL` | `http://localhost:8000` | URL of the backend API. |

## Directory Structure

*   `backend/`
    *   `app/`: Application source code.
        *   `routers/`: API route handlers (auth, employees, vouchers, reports).
        *   `services/`: Business logic (reporting, sync).
        *   `models.py`: Database models.
        *   `schemas.py`: Pydantic models for API request/response.
    *   `tests/`: Pytest test suite.
*   `frontend/`
    *   `src/`
        *   `components/`: Reusable UI components.
        *   `pages/`: Application screens (Scan, History, Admin).
        *   `services/`: API client and local DB (Dexie) logic.
        *   `hooks/`: Custom React hooks (sync, toast, online status).
*   `reports/`: Default location for generated CSV reports.

## Development Notes

*   **Offline Logic:** The frontend queues requests in IndexedDB when the network is unreachable. The `useVoucherSync` hook attempts to flush this queue when the application comes online or on mount.
*   **Authentication:** The app uses a simple PIN-based mechanism for admin actions (`X-Admin-PIN` header). General user actions (scanning) do not require authentication but valid employee IDs.
