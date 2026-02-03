from __future__ import annotations

from fastapi import APIRouter

from ..schemas import PinVerifyRequest, PinVerifyResponse
from ..services.auth import ADMIN_PIN

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/verify-pin", response_model=PinVerifyResponse)
def verify_pin(payload: PinVerifyRequest):
    return PinVerifyResponse(valid=payload.pin == ADMIN_PIN)
