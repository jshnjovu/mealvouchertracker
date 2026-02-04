# Deployment Summary: Google Compute Engine

This document summarizes the steps taken to deploy the Meal Voucher Tracker PWA to Google Cloud Platform using a Compute Engine VM.

## 1. Project Initialization
*   **Project Set:** `bitlifeke`
*   **API Enabled:** Enabled `compute.googleapis.com` to manage VM resources.

## 2. Infrastructure Setup
*   **Static IP Reservation:** Reserved a static external IP address (`34.27.147.116`) to ensure the application remains accessible at the same URL after restarts.
*   **Firewall Rules:**
    *   **Default HTTP:** Created `default-allow-http` to allow ingress TCP traffic on port 80 (was missing initially).
    *   **Backend API:** Created a custom rule `allow-api-8000` to allow TCP traffic on port `8000` for backend communication.

## 3. VM Instance Creation
*   **Name:** `meal-voucher-server`
*   **Machine Type:** `e2-medium` (2 vCPU, 4GB RAM)
*   **Region/Zone:** `us-central1-a`
*   **Image:** Ubuntu 22.04 LTS
*   **Network Tags:** `http-server`, `https-server`, `meal-voucher-api`

## 4. Production Configuration
*   **Docker Compose:** Created `docker-compose.prod.yml` which:
    *   Points the frontend `VITE_API_URL` build argument to the static IP (`http://34.27.147.116:8000`).
    *   Sets containers to `restart: always` for reliability.
    *   Maps host ports to container ports (80 for frontend, 8000 for backend).

## 5. Deployment Execution
*   **Packaging:** Compressed the project into `project.zip`, excluding local development artifacts like `node_modules`, `.venv`, and cache files.
*   **Transfer:** Uploaded the package to the VM using `gcloud compute scp`.
*   **Remote Setup:**
    *   Installed `docker.io`, `docker-compose-v2`, and `unzip`.
    *   Extracted the project files.
    *   Triggered a production build and started the containers in detached mode:
        ```bash
        sudo docker compose -f docker-compose.prod.yml up -d --build --force-recreate
        ```

## 6. Access Information
*   **Frontend:** [http://34.27.147.116](http://34.27.147.116)
*   **Backend API:** [http://34.27.147.116:8000](http://34.27.147.116:8000)
*   **Admin PIN:** `1234`

## 7. Troubleshooting & Fixes
*   **Issue:** Frontend was unreachable.
    *   **Fix:** Added `default-allow-http` firewall rule.
*   **Issue:** API calls failing with network error.
    *   **Fix:** Updated `frontend/src/services/api.ts` to use `VITE_API_URL` environment variable instead of hardcoded local IP, allowing correct configuration via Docker Compose.
