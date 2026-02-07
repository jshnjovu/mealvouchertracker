from __future__ import annotations

from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from ..database import get_db
from ..services.auth import verify_admin_pin
from ..services.reports import fetch_vouchers_for_date, generate_csv

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/daily", dependencies=[Depends(verify_admin_pin)])
def daily_report(
    report_date: date = Query(default_factory=date.today),
    time_format: str | None = Query(None),
    db: Session = Depends(get_db)
):
    vouchers = fetch_vouchers_for_date(db, report_date)
    if not vouchers:
        raise HTTPException(status_code=404, detail="No vouchers for date")
    csv_path = generate_csv(vouchers, report_date, time_format)
    return FileResponse(path=csv_path, filename=csv_path.name, media_type="text/csv")
