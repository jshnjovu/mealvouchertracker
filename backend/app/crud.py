from __future__ import annotations

from datetime import date, datetime, timezone
from typing import Iterable, Optional

from sqlalchemy.orm import Session

from . import models, schemas


# Employee operations

def list_employees(db: Session):
    return db.query(models.Employee).order_by(models.Employee.employee_id).all()


def get_employee(db: Session, employee_id: str) -> Optional[models.Employee]:
    return db.query(models.Employee).filter(models.Employee.employee_id == employee_id).first()


def create_employee(db: Session, data: schemas.EmployeeCreate) -> models.Employee:
    employee = models.Employee(**data.model_dump())
    db.add(employee)
    db.commit()
    db.refresh(employee)
    return employee


def update_employee(db: Session, employee: models.Employee, data: schemas.EmployeeUpdate) -> models.Employee:
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(employee, key, value)
    db.commit()
    db.refresh(employee)
    return employee


# Voucher operations

def list_vouchers(db: Session, for_date: Optional[date] = None):
    query = db.query(models.VoucherEntry)
    if for_date:
        query = query.filter(models.VoucherEntry.date == for_date)
    return query.order_by(models.VoucherEntry.time_in.desc()).all()


def get_open_voucher(db: Session, employee_id: str) -> Optional[models.VoucherEntry]:
    return (
        db.query(models.VoucherEntry)
        .filter(
            models.VoucherEntry.employee_id == employee_id,
            models.VoucherEntry.time_out.is_(None),
        )
        .order_by(models.VoucherEntry.time_in.desc())
        .first()
    )


def check_in(db: Session, data: schemas.VoucherCheckIn) -> models.VoucherEntry:
    employee = get_employee(db, data.employee_id)
    if not employee:
        raise ValueError("Employee not found")
    if not employee.is_active:
        raise ValueError("Employee inactive")

    time_in = data.time_in or datetime.now(timezone.utc)
    voucher = models.VoucherEntry(
        employee_id=employee.employee_id,
        employee_name=data.employee_name or employee.name,
        date=time_in.date(),
        time_in=time_in,
        time_out=None,
        voucher_printed=False,
        synced=True,
    )
    db.add(voucher)
    db.commit()
    db.refresh(voucher)
    return voucher


def check_out(db: Session, data: schemas.VoucherCheckOut) -> models.VoucherEntry:
    voucher = get_open_voucher(db, data.employee_id)
    if not voucher:
        raise ValueError("No open voucher entry")
    voucher.time_out = data.time_out or datetime.now(timezone.utc)
    db.commit()
    db.refresh(voucher)
    return voucher


def sync_vouchers(db: Session, entries: Iterable[schemas.VoucherSyncIn]):
    results = []
    for entry in entries:
        existing = None
        if entry.id:
            existing = db.query(models.VoucherEntry).filter(models.VoucherEntry.id == entry.id).first()
        if existing:
            existing.time_out = entry.time_out
            existing.voucher_printed = entry.voucher_printed
            existing.synced = True
            results.append(existing)
        else:
            voucher = models.VoucherEntry(
                id=entry.id,
                employee_id=entry.employee_id,
                employee_name=entry.employee_name,
                date=entry.date,
                time_in=entry.time_in,
                time_out=entry.time_out,
                voucher_printed=entry.voucher_printed,
                synced=True,
            )
            db.add(voucher)
            results.append(voucher)
    db.commit()
    for item in results:
        db.refresh(item)
    return results
