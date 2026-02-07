# Bugs to Avoid & Lessons Learned

This document tracks critical production issues encountered during development and deployment, their root causes, and how to prevent them in future updates.

## 1. Production API & Frontend Connection Refused (SSL/Nginx)

### Problem
The frontend received `ERR_CONNECTION_REFUSED` or Nginx entered a restart loop, making the application unreachable via HTTPS (`https://mvt.redclief.com`).

### Root Causes
1.  **SSL Path Mismatch**: Certbot typically generates paths like `/etc/letsencrypt/live/domain.com/`, but Nginx was sometimes hardcoded with a suffix like `-0001`, causing a silent or crashing failure.
2.  **Missing TLS Includes**: Using `include /etc/letsencrypt/options-ssl-nginx.conf;` in Nginx causes an immediate crash if that file doesn't exist (e.g., on a fresh VM before `init-letsencrypt.sh` has run).
3.  **Port 443 Binding**: Port 443 was mapped in Docker but Nginx failed to start, leaving the port closed and leading to connection refused errors.
4.  **Incomplete Health Checks**: The CI/CD pipeline previously only checked the backend port (8000). A successful backend health check could mask a crashing Nginx container.

### Lessons Learned
*   **Relative API Paths**: Setting `VITE_API_URL=""` in production and using Nginx to proxy `/api/*` is more robust than hardcoding IPs or domains.
*   **Safe Nginx Bootstrapping**: Always comment out optional SSL includes (`options-ssl-nginx.conf`) for the initial setup. This allows Nginx to start, serve port 80, and allow Certbot to complete the ACME challenge.
*   **Standardize Paths**: Use the base domain path for certificates in `nginx.conf` to match standard Certbot and automation script behavior.

### Preventive Measures
*   **Dual Health Check Loop**: The CI/CD pipeline (`deploy.yml`) now checks BOTH the internal backend API (`:8000/api/health`) and the external frontend (`port 80`) before marking a deployment as successful.
*   **Log Capture on Failure**: If health checks fail, the pipeline automatically dumps the last 100 lines of container logs to the GitHub Actions console for immediate debugging.
*   **Automated .env**: Always generate the `.env` file from GitHub Secrets during deployment to prevent configuration drift.

## 2. Backend Startup Failures (Environment Variables)

### Problem
Backend containers crashed during manual startup with `ValueError: invalid literal for int() with base 10: ''`.

### Root Cause
Environment variables (like `SMTP_PORT`) were being passed as empty strings from GitHub Secrets or Shell environments, which `int()` cannot parse.

### Fix
Implemented a `get_env_int()` helper to safely handle empty or invalid numeric environment variables.

```python
def get_env_int(key: str, default: int) -> int:
    val = (os.getenv(key) or "").strip()
    if not val: return default
    try:
        return int(val)
    except ValueError:
        return default
```

## 3. Deployment Mismatch (Docker Volumes)

### Problem
Backend was using a full volume mount (`./backend:/app`) which could lead to inconsistent environments if the host directory had stale files, different Python versions, or missing dependencies.

### Fix
*   **Image Integrity**: Removed the full code volume mount in `docker-compose.prod.yml`. The container now relies solely on the code baked into the image during the build process.
*   **Dedicated Data Volumes**: Implemented a specific volume for SQLite persistence (`./backend_data:/app/data`) and updated the `DATABASE_URL` to point inside this protected path.

### Lesson
**Use volumes for data persistence only**, never for injecting code in production. Trust the Docker image build process to ensure a consistent environment.

## 4. Frontend Build & Type Errors

### Problem
The production build would fail or crash at runtime due to TypeScript errors or missing JSX support in `.ts` files.

### Root Cause
*   **Hook Extensions**: Hooks using JSX (like `useToast`) were named with `.ts` extensions, causing the Vite compiler to fail in strict environments.
*   **MUI Theme Discrepancies**: Using unsupported component keys (like `MuiPickersPopper` without the library installed) or providing an incorrect number of shadows (MUI requires exactly 25) caused the theme provider to crash.

### Fix
*   **Rename to .tsx**: All hooks or components containing JSX must use the `.tsx` extension.
*   **Strict Type Checking**: Added `npx tsc --noEmit` to the local verification workflow to catch these before pushing to master.