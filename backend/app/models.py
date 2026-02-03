from __future__ import annotations

import uuid
from datetime import date, datetime
from sqlalchemy import Boolean, Column, Date, DateTime, ForeignKey, String
from sqlalchemy.orm import relationship

from .database import Base


class Employee(Base):
    __tablename__ = "employees"

    employee_id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    department = Column(String, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)

    vouchers = relationship("VoucherEntry", back_populates="employee")


class VoucherEntry(Base):
    __tablename__ = "voucher_entries"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    employee_id = Column(String, ForeignKey("employees.employee_id"), nullable=False, index=True)
    employee_name = Column(String, nullable=False)
    date = Column(Date, default=date.today, nullable=False, index=True)
    time_in = Column(DateTime, default=datetime.utcnow, nullable=False)
    time_out = Column(DateTime, nullable=True)
    voucher_printed = Column(Boolean, default=False, nullable=False)
    synced = Column(Boolean, default=True, nullable=False)

    employee = relationship("Employee", back_populates="vouchers")
