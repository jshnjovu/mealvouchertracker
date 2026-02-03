from __future__ import annotations

import csv
import io
from typing import List

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from .. import crud, schemas
from ..database import get_db
from ..services.auth import verify_admin_pin

router = APIRouter(prefix="/api/employees", tags=["employees"])


@router.get("", response_model=List[schemas.EmployeeOut])
def list_employees(db: Session = Depends(get_db)):
    return crud.list_employees(db)


@router.post("", response_model=schemas.EmployeeOut, dependencies=[Depends(verify_admin_pin)])
def create_employee(payload: schemas.EmployeeCreate, db: Session = Depends(get_db)):
    existing = crud.get_employee(db, payload.employee_id)
    if existing:
        raise HTTPException(status_code=409, detail="Employee already exists")
    return crud.create_employee(db, payload)


@router.put("/{employee_id}", response_model=schemas.EmployeeOut, dependencies=[Depends(verify_admin_pin)])
def update_employee(employee_id: str, payload: schemas.EmployeeUpdate, db: Session = Depends(get_db)):
    employee = crud.get_employee(db, employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return crud.update_employee(db, employee, payload)


@router.post("/import", response_model=dict, dependencies=[Depends(verify_admin_pin)])
def import_employees(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Missing file")
    content = file.file.read().decode("utf-8")
    reader = csv.DictReader(io.StringIO(content))
    required = {"employee_id", "name"}
    if not required.issubset(reader.fieldnames or []):
        raise HTTPException(status_code=400, detail="CSV must include employee_id and name columns")

    created = 0
    updated = 0
    for row in reader:
        employee_id = (row.get("employee_id") or "").strip()
        name = (row.get("name") or "").strip()
        department = (row.get("department") or "").strip() or None
        is_active_val = (row.get("is_active") or "").strip().lower()
        is_active = True if is_active_val in ("", "1", "true", "yes") else False

        if not employee_id or not name:
            continue

        existing = crud.get_employee(db, employee_id)
        if existing:
            crud.update_employee(
                db,
                existing,
                schemas.EmployeeUpdate(name=name, department=department, is_active=is_active),
            )
            updated += 1
        else:
            crud.create_employee(
                db,
                schemas.EmployeeCreate(
                    employee_id=employee_id,
                    name=name,
                    department=department,
                    is_active=is_active,
                ),
            )
            created += 1

    return {"created": created, "updated": updated}
