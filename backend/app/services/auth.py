from __future__ import annotations

import os
from fastapi import Header, HTTPException, status


ADMIN_PIN = os.getenv("ADMIN_PIN", "1234")


def verify_admin_pin(x_admin_pin: str | None = Header(default=None)):
    if not x_admin_pin or x_admin_pin != ADMIN_PIN:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid admin PIN")
    return True
