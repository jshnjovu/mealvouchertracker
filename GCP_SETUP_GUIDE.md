# GCP Setup Guide: Compute Engine & GitHub Actions

This guide explains how to configure Google Cloud Platform (GCP) and GitHub Actions to automatically deploy the Meal Voucher Tracker to a Compute Engine VM.

## 1. Prerequisites

*   A Google Cloud Project (e.g., `bitlifeke`).
*   A Compute Engine VM (already set up as `meal-voucher-server`).
*   Administrative access to the GCP Console and the GitHub repository.

## 2. Service Account Setup (GCP)

We need a Service Account (SA) that GitHub Actions will use to authenticate and execute commands on your VM.

### Step 2.1: Create Service Account
1.  Open the [Service Accounts page](https://console.cloud.google.com/iam-admin/serviceaccounts).
2.  Click **Create Service Account**.
3.  **Name:** `github-deployer`
4.  **Description:** "Used by GitHub Actions to deploy to VM".
5.  Click **Create and Continue**.

### Step 2.2: Grant Permissions
Grant the following roles to the service account:
*   **Compute Instance Admin (v1)**: Allows managing VM instances (start/stop/reset).
*   **Compute OS Login**: Allows logging into the VM via SSH.
*   **Service Account User**: Required to act as the service account.
*   **IAP-secured Tunnel User**: (Optional) Recommended if connecting via IAP instead of public IP.

### Step 2.3: Generate Key
1.  Click on the newly created Service Account (`github-deployer@...`).
2.  Go to the **Keys** tab.
3.  Click **Add Key** > **Create new key**.
4.  Select **JSON** and create.
5.  **Save this file!** This is your `GCP_SA_KEY`.

## 3. GitHub Secrets Configuration

Go to your GitHub Repository -> **Settings** -> **Secrets and variables** -> **Actions**. Add the following repository secrets:

### Authentication
| Secret Name | Value |
| :--- | :--- |
| `GCP_SA_KEY` | The entire content of the JSON key file you downloaded. |
| `GCP_PROJECT_ID` | Your Project ID (e.g., `bitlifeke`). |
| `VM_IP` | The Public IP of your VM (`34.27.147.116`). |
| `SSH_USERNAME` | The username to log in as (usually `github-actions` or your GCP user). |
| `SSH_PRIVATE_KEY` | Your private SSH key (Generate one locally via `ssh-keygen`, add public key to VM metadata). |

### Application Config (Backend)
| Secret Name | Value |
| :--- | :--- |
| `ADMIN_PIN` | Your secure 4-digit PIN (e.g., `1234`). |
| `SMTP_USER` | Email address for sending reports (e.g., `reports@example.com`). |
| `SMTP_PASSWORD` | Password or App Password for the email account. |
| `SMTP_HOST` | SMTP Server (e.g., `smtp.gmail.com`). |
| `SMTP_PORT` | SMTP Port (e.g., `587`). |

### Application Config (Frontend)
| Secret Name | Value |
| :--- | :--- |
| `VITE_API_URL` | The full public URL of your backend (e.g., `http://34.27.147.116:8000`). |

## 4. SSH Access Setup

GitHub Actions needs to SSH into your VM to pull code and restart Docker.

1.  **Generate a Key Pair (Locally):**
    ```bash
    ssh-keygen -t rsa -f ./github-deploy-key -C "github-actions"
    ```
    *   Do not set a passphrase.
2.  **Add Public Key to VM:**
    *   Copy the content of `github-deploy-key.pub`.
    *   Go to **Compute Engine** -> **VM instances** -> Click `meal-voucher-server` -> **Edit**.
    *   Scroll to **SSH Keys** -> **Add Item**.
    *   Paste the key content. GCP will auto-detect the username (`github-actions`).
    *   Save.
3.  **Add Private Key to GitHub:**
    *   Copy the content of `github-deploy-key` (the private key).
    *   Add it as the `SSH_PRIVATE_KEY` secret in GitHub.

## 5. Verification

Once everything is set up:
1.  Push a change to the `main` branch.
2.  Go to the **Actions** tab in GitHub.
3.  Watch the `Deploy to VM` workflow run.
4.  If successful, your changes will be live on the VM!
