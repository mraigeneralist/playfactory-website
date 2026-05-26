"""Environment-driven config. Fail-fast on truly required values."""
from __future__ import annotations

import os
from dataclasses import dataclass
from dotenv import load_dotenv

load_dotenv()


def _env(name: str, default: str | None = None) -> str | None:
    v = os.environ.get(name)
    return v if v not in (None, "") else default


@dataclass(frozen=True)
class Settings:
    # WhatsApp Cloud API
    WHATSAPP_TOKEN: str | None = _env("WHATSAPP_TOKEN")
    PHONE_NUMBER_ID: str | None = _env("PHONE_NUMBER_ID")
    VERIFY_TOKEN: str = _env("VERIFY_TOKEN", "playfactory-verify") or "playfactory-verify"
    META_APP_SECRET: str | None = _env("META_APP_SECRET")

    # Flow encryption
    FLOW_PRIVATE_KEY: str | None = _env("FLOW_PRIVATE_KEY")
    FLOW_PASSPHRASE: str | None = _env("FLOW_PASSPHRASE")
    FLOW_ID_BOOKING: str | None = _env("FLOW_ID_BOOKING")

    # Sheets backend
    SHEETS_WEBHOOK_URL: str | None = _env("SHEETS_WEBHOOK_URL")
    SHEETS_WEBHOOK_SECRET: str | None = _env("SHEETS_WEBHOOK_SECRET")

    # Cron
    CRON_SECRET: str | None = _env("CRON_SECRET")

    # Business
    ADMIN_PHONE: str | None = _env("ADMIN_PHONE")
    BUSINESS_NAME: str = _env("BUSINESS_NAME", "PlayFactory") or "PlayFactory"
    WEBSITE_URL: str = _env("WEBSITE_URL", "https://playfactory.in") or "https://playfactory.in"

    # Toggle in-process APScheduler. Disable when running on Vercel
    # (use /cron/reminders + Vercel Cron there).
    RUN_IN_PROCESS_SCHEDULER: bool = _env("RUN_IN_PROCESS_SCHEDULER", "1") == "1"


settings = Settings()
