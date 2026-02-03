from __future__ import annotations

import os
from contextlib import asynccontextmanager
from datetime import date
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.asyncio import AsyncIOScheduler

from .database import Base, engine, SessionLocal
from .routers import auth, employees, vouchers, reports
from .services.reports import generate_and_email_report

Base.metadata.create_all(bind=engine)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    scheduler = None
    if os.getenv("DISABLE_SCHEDULER") != "1":
        scheduler = AsyncIOScheduler()
        report_hour = int(os.getenv("REPORT_HOUR", "18"))
        report_minute = int(os.getenv("REPORT_MINUTE", "0"))

        async def run_report():
            db = SessionLocal()
            try:
                await generate_and_email_report(db, date.today())
            finally:
                db.close()

        scheduler.add_job(run_report, "cron", hour=report_hour, minute=report_minute)
        scheduler.start()
        app.state.scheduler = scheduler

    yield

    # Shutdown
    if scheduler:
        scheduler.shutdown()


app = FastAPI(title="Meal Voucher Tracker API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(employees.router)
app.include_router(vouchers.router)
app.include_router(reports.router)


@app.get("/api/health")
def health_check():
    return {"status": "ok"}
