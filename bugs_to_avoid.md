# Bugs to Avoid & Lessons Learned

This document tracks critical production issues encountered during development and deployment, their root causes, and how to prevent them in future updates.

## 1. Production API Connection Refused (SSL/Nginx)

### Problem
The frontend received `ERR_CONNECTION_REFUSED` when trying to reach the backend API at `https://mvt.redclief.com/api/*`.

### Root Causes
1.  **SSL Misconfiguration**: Port 443 was mapped in `docker-compose.prod.yml`, but `nginx.conf` was only listening on port 80.
2.  **Certificate Path Mismatch**: Certbot generated certificates in a directory with a suffix (`mvt.redclief.com-0001`), while Nginx expected them in the base directory.
3.  **Missing TLS Parameters**: Nginx failed to start because it couldn't find `options-ssl-nginx.conf` and `ssl-dhparams.pem` inside the container.
4.  **Deployment Directory Fragmentation**: Files were being uploaded to `/home/github-actions/` but containers were being managed in `/home/joash/`, leading to stale configurations.

### Lessons Learned
*   **Always use project prefixes**: Use `docker compose -p meal-voucher` consistently to avoid duplicate stacks and ensure stable network names.
*   **Relative API Paths**: Setting `VITE_API_URL=""` in production and using Nginx to proxy `/api/*` is more robust than hardcoding IPs or domains.
*   **Sturdy Env Parsing**: Backend code must handle empty environment variables gracefully (e.g., `SMTP_PORT=""` causing `ValueError`).

### Preventive Measures
*   **Health Check Loop**: The CI/CD pipeline now includes a 30-retry health check against BOTH the direct backend port (8000) and the live frontend (port 80) before marking a deployment as successful.
*   **SSL Path Consistency**: Ensure `nginx.conf` matches the directory structure created by the `init-letsencrypt.sh` script (e.g., avoid the common `-0001` suffix mismatch).
*   **Consolidated Deployment**: Ensure the SSH user in GitHub Actions matches the primary operator user on the VM to maintain a single source of truth for files.
*   **Automated .env**: Always generate the `.env` file from GitHub Secrets during deployment to prevent configuration drift.

## 2. Backend Startup Failures (Environment Variables)
# ... [existing content] ...

## 3. Deployment Mismatch (Volumes)

### Problem
Backend was using a full volume mount (`./backend:/app`) which could lead to inconsistent environments if the host directory had stale files or was missing dependencies.

### Fix
Removed the full code volume mount in `docker-compose.prod.yml` and replaced it with a dedicated data volume for SQLite persistence (`./backend_data:/app/data`).

### Lesson
Use volumes for **data persistence** only, not for injecting code in production. Trust the Docker image build process for the application source.
