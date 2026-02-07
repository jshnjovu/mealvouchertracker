from __future__ import annotations

import csv
import os
from datetime import date, datetime
from pathlib import Path
from typing import Iterable

from aiosmtplib import SMTP
from email.message import EmailMessage
from sqlalchemy.orm import Session

from ..models import VoucherEntry

REPORT_DIR = Path(os.getenv("REPORT_DIR", "./reports"))
REPORT_DIR.mkdir(parents=True, exist_ok=True)

def get_env_int(key: str, default: int) -> int:
    val = (os.getenv(key) or "").strip()
    if not val:
        return default
    try:
        return int(val)
    except ValueError:
        return default


SMTP_HOST = os.getenv("SMTP_HOST", "")
SMTP_PORT = get_env_int("SMTP_PORT", 587)
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM = os.getenv("SMTP_FROM", "reports@mealvoucher.local")
SMTP_TO = os.getenv("SMTP_TO", "")


def fetch_vouchers_for_date(db: Session, for_date: date):
    return (
        db.query(VoucherEntry)
        .filter(VoucherEntry.date == for_date)
        .order_by(VoucherEntry.time_in.asc())
        .all()
    )


def generate_csv(vouchers: Iterable[VoucherEntry], report_date: date, time_format: str | None = None) -> Path:
    filename = REPORT_DIR / f"voucher_report_{report_date.isoformat()}.csv"
    with filename.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle)
        writer.writerow(
            [
                "employee_id",
                "employee_name",
                "date",
                "time_in",
                "time_out",
                "voucher_printed",
            ]
        )
        for entry in vouchers:
            writer.writerow(
                [
                    entry.employee_id,
                    entry.employee_name,
                    entry.date.isoformat(),
                    entry.time_in.strftime(time_format) if time_format else entry.time_in.isoformat(),
                    entry.time_out.strftime(time_format) if entry.time_out and time_format else (entry.time_out.isoformat() if entry.time_out else ""),
                    "yes" if entry.voucher_printed else "no",
                ]
            )
    return filename


async def send_report_email(report_date: date, csv_path: Path):
    if not SMTP_HOST or not SMTP_TO:
        return

    message = EmailMessage()
    message["From"] = SMTP_FROM
    message["To"] = SMTP_TO
    message["Subject"] = f"Meal Voucher Report - {report_date.isoformat()}"
    message.set_content(f"Daily report attached for {report_date.isoformat()}.")

    message.add_attachment(
        csv_path.read_bytes(),
        maintype="text",
        subtype="csv",
        filename=csv_path.name,
    )

    smtp = SMTP(hostname=SMTP_HOST, port=SMTP_PORT, start_tls=True)
    await smtp.connect()
    if SMTP_USER:
        await smtp.login(SMTP_USER, SMTP_PASSWORD)
    await smtp.send_message(message)
    await smtp.quit()


async def generate_and_email_report(db: Session, report_date: date):
    vouchers = fetch_vouchers_for_date(db, report_date)
    csv_path = generate_csv(vouchers, report_date)
    await send_report_email(report_date, csv_path)
    return csv_path
