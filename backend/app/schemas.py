from __future__ import annotations

from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class EmployeeBase(BaseModel):
    employee_id: str = Field(..., min_length=1)
    name: str
    department: Optional[str] = None
    is_active: bool = True


class EmployeeCreate(EmployeeBase):
    pass


class EmployeeUpdate(BaseModel):
    name: Optional[str] = None
    department: Optional[str] = None
    is_active: Optional[bool] = None


class EmployeeOut(EmployeeBase):
    model_config = ConfigDict(from_attributes=True)


class VoucherBase(BaseModel):
    employee_id: str


class VoucherCheckIn(VoucherBase):
    employee_name: Optional[str] = None
    time_in: Optional[datetime] = None


class VoucherCheckOut(VoucherBase):
    time_out: Optional[datetime] = None


class VoucherEntryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    employee_id: str
    employee_name: str
    date: date
    time_in: datetime
    time_out: Optional[datetime]
    voucher_printed: bool
    synced: bool


class VoucherSyncIn(BaseModel):
    id: Optional[str] = None
    employee_id: str
    employee_name: str
    date: date
    time_in: datetime
    time_out: Optional[datetime] = None
    voucher_printed: bool = False
    synced: bool = False


class PinVerifyRequest(BaseModel):
    pin: str


class PinVerifyResponse(BaseModel):
    valid: bool
