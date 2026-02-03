from __future__ import annotations

from datetime import date
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from .. import crud, schemas
from ..database import get_db

router = APIRouter(prefix="/api/vouchers", tags=["vouchers"])


@router.get("", response_model=List[schemas.VoucherEntryOut])
def list_vouchers(date_filter: Optional[date] = Query(None, alias="date"), db: Session = Depends(get_db)):
    return crud.list_vouchers(db, date_filter)


@router.post("/checkin", response_model=schemas.VoucherEntryOut)
def check_in(payload: schemas.VoucherCheckIn, db: Session = Depends(get_db)):
    try:
        return crud.check_in(db, payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/checkout", response_model=schemas.VoucherEntryOut)
def check_out(payload: schemas.VoucherCheckOut, db: Session = Depends(get_db)):
    try:
        return crud.check_out(db, payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/sync", response_model=List[schemas.VoucherEntryOut])
def sync_vouchers(payload: List[schemas.VoucherSyncIn], db: Session = Depends(get_db)):
    return crud.sync_vouchers(db, payload)
