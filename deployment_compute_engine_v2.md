# Deployment V2: CI/CD & Automated VM Setup

This document outlines the version 2 deployment strategy for the Meal Voucher Tracker. Unlike the initial manual deployment, V2 uses a fully automated CI/CD pipeline integrated with Google Compute Engine (VM).

## 1. Overview
The new approach shifts from manual `gcloud` commands to an automated **GitHub Actions** workflow. Every push to the `main` branch triggers a pipeline that tests, packages, and deploys the application directly to the live VM.

## 2. Key Components

### A. Infrastructure (GCP)
*   **Platform:** Google Compute Engine (VM).
*   **OS:** Ubuntu 22.04 LTS.
*   **Networking:** Static Public IP (`34.27.147.116`).
*   **Access:** SSH via Key Pair (managed by GitHub Secrets).
*   **Security:** Service Account with specific roles (`Compute OS Login`, `Service Account User`).

### B. CI/CD Pipeline (GitHub Actions)
The pipeline is defined in `.github/workflows/deploy.yml` and consists of:
1.  **Testing:** Runs `pytest` on the backend to ensure code quality.
2.  **Packaging:** Creates a lightweight `project.zip` artifact, excluding development files.
3.  **Deployment:**
    *   **SCP:** Securely copies the artifact to the VM.
    *   **SSH:**Executes remote commands to:
        *   Inject secrets into a production `.env` file.
        *   Rebuild Docker containers with new code.
        *   Prune old images to maintain disk hygiene.

### C. Configuration Management
*   **Frontend:** `VITE_API_URL` is injected at build time via Docker build arguments.
*   **Backend:** Sensitive data (`SMTP_PASSWORD`, `ADMIN_PIN`) is injected at runtime via the generated `.env` file.

## 3. Reference Documentation

For detailed setup instructions, please refer to the following guides:

*   **[GCP_SETUP_GUIDE.md](./GCP_SETUP_GUIDE.md):** Step-by-step instructions for creating the Service Account, configuring SSH keys, and setting up the required IAM roles on Google Cloud.
*   **[CI_CD_PIPELINE.md](./CI_CD_PIPELINE.md):** A deep dive into the pipeline architecture, workflow steps, and the comprehensive list of required GitHub Secrets.

## 4. Migration from V1 to V2
To switch from the manual V1 deployment to this automated V2 flow:
1.  **Follow `GCP_SETUP_GUIDE.md`** to create the Service Account and SSH keys.
2.  **Populate GitHub Secrets** with the credentials and configuration values listed in `CI_CD_PIPELINE.md`.
3.  **Push to Main**: The next commit to `main` will automatically deploy using the new system.
