from __future__ import annotations

import random
from datetime import datetime, timedelta

from app.database import Base, SessionLocal, engine
from app.models import Employee, VoucherEntry


DEMO_EMPLOYEES = [
    ("EMP-1001", "Ava Brooks", "Kitchen"),
    ("EMP-1002", "Miles Carter", "Service"),
    ("EMP-1003", "Lina Patel", "Operations"),
    ("EMP-1004", "Noah Kim", "Service"),
    ("EMP-1005", "Ivy Chen", "Kitchen"),
]


def seed_demo():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        existing_ids = {row[0] for row in db.query(Employee.employee_id).all()}
        for employee_id, name, department in DEMO_EMPLOYEES:
            if employee_id in existing_ids:
                continue
            db.add(
                Employee(
                    employee_id=employee_id,
                    name=name,
                    department=department,
                    is_active=True,
                )
            )

        db.commit()

        employees = db.query(Employee).all()
        if not employees:
            return

        now = datetime.utcnow().replace(minute=0, second=0, microsecond=0)
        for offset in range(3):
            day = now - timedelta(days=offset)
            for employee in employees:
                if random.random() < 0.2:
                    continue
                time_in = day + timedelta(hours=8 + random.randint(0, 2))
                time_out = time_in + timedelta(hours=4 + random.randint(0, 2))
                db.add(
                    VoucherEntry(
                        employee_id=employee.employee_id,
                        employee_name=employee.name,
                        date=time_in.date(),
                        time_in=time_in,
                        time_out=time_out,
                        voucher_printed=True,
                        synced=True,
                    )
                )
        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    seed_demo()
    print("Seeded demo employees and vouchers.")
