from __future__ import annotations

import io
import csv
from datetime import date


def test_employee_crud_and_auth(client):
    res = client.post(
        "/api/employees",
        json={"employee_id": "EMP-1", "name": "Test User"},
    )
    assert res.status_code == 401

    res = client.post(
        "/api/employees",
        headers={"X-Admin-PIN": "9999"},
        json={"employee_id": "EMP-1", "name": "Test User"},
    )
    assert res.status_code == 200
    body = res.json()
    assert body["employee_id"] == "EMP-1"

    res = client.get("/api/employees")
    assert res.status_code == 200
    assert len(res.json()) == 1


def test_csv_import(client):
    csv_content = io.StringIO()
    writer = csv.writer(csv_content)
    writer.writerow(["employee_id", "name", "department", "is_active"])
    writer.writerow(["EMP-2", "First User", "Ops", "true"])
    writer.writerow(["EMP-3", "Second User", "Service", "false"])

    res = client.post(
        "/api/employees/import",
        headers={"X-Admin-PIN": "9999"},
        files={"file": ("employees.csv", csv_content.getvalue(), "text/csv")},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["created"] == 2


def test_voucher_checkin_checkout(client):
    client.post(
        "/api/employees",
        headers={"X-Admin-PIN": "9999"},
        json={"employee_id": "EMP-4", "name": "Voucher User"},
    )

    res = client.post("/api/vouchers/checkin", json={"employee_id": "EMP-4"})
    assert res.status_code == 200
    entry = res.json()
    assert entry["employee_id"] == "EMP-4"
    assert entry["time_out"] is None

    res = client.post("/api/vouchers/checkout", json={"employee_id": "EMP-4"})
    assert res.status_code == 200
    entry = res.json()
    assert entry["time_out"] is not None


def test_voucher_sync_and_report(client):
    client.post(
        "/api/employees",
        headers={"X-Admin-PIN": "9999"},
        json={"employee_id": "EMP-5", "name": "Report User"},
    )

    res = client.post(
        "/api/vouchers/sync",
        json=[
            {
                "id": "test-1",
                "employee_id": "EMP-5",
                "employee_name": "Report User",
                "date": date.today().isoformat(),
                "time_in": "2025-01-01T08:00:00",
                "time_out": "2025-01-01T12:00:00",
                "voucher_printed": True,
                "synced": False,
            }
        ],
    )
    assert res.status_code == 200
    synced = res.json()
    assert synced[0]["synced"] is True

    report_date = date.today().isoformat()
    res = client.get(
        f"/api/reports/daily?report_date={report_date}",
        headers={"X-Admin-PIN": "9999"},
    )
    assert res.status_code == 200
    assert res.headers["content-type"].startswith("text/csv")
