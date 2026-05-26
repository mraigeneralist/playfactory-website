"""WhatsApp Flow data-exchange endpoint.

Meta sends an encrypted payload on every screen transition. We decrypt with
our RSA private key, build the next screen's data, and encrypt the response
with the AES key Meta sent in the same payload.

Scaffold — the screen-routing logic is here but Meta credentials and the
Flow upload still need to happen. See SETUP.md step 6.
"""
from __future__ import annotations

import base64
import json
import logging
from datetime import date, timedelta

from cryptography.hazmat.primitives import serialization, hashes, padding as sym_padding
from cryptography.hazmat.primitives.asymmetric import padding as asym_padding
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes

from .config import settings
from .sheets import fetch_slots, create_booking

log = logging.getLogger(__name__)


def _load_private_key():
    if not settings.FLOW_PRIVATE_KEY:
        return None
    pwd = settings.FLOW_PASSPHRASE.encode() if settings.FLOW_PASSPHRASE else None
    return serialization.load_pem_private_key(
        settings.FLOW_PRIVATE_KEY.encode(), password=pwd
    )


def _decrypt(body: dict) -> tuple[dict, bytes, bytes]:
    """Returns (decrypted_payload_json, aes_key, iv)."""
    pk = _load_private_key()
    if not pk:
        raise RuntimeError("FLOW_PRIVATE_KEY not configured")

    enc_aes_key = base64.b64decode(body["encrypted_aes_key"])
    aes_key = pk.decrypt(
        enc_aes_key,
        asym_padding.OAEP(
            mgf=asym_padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None,
        ),
    )

    iv = base64.b64decode(body["initial_vector"])
    enc_flow_data = base64.b64decode(body["encrypted_flow_data"])

    # WhatsApp uses AES-128-GCM. Tag is the trailing 16 bytes.
    ct, tag = enc_flow_data[:-16], enc_flow_data[-16:]
    cipher = Cipher(algorithms.AES(aes_key), modes.GCM(iv, tag))
    decryptor = cipher.decryptor()
    pt = decryptor.update(ct) + decryptor.finalize()
    return json.loads(pt), aes_key, iv


def _encrypt(payload: dict, aes_key: bytes, iv: bytes) -> str:
    # Flip IV bits per Meta's spec for the response leg.
    flipped_iv = bytes(b ^ 0xFF for b in iv)
    cipher = Cipher(algorithms.AES(aes_key), modes.GCM(flipped_iv))
    encryptor = cipher.encryptor()
    ct = encryptor.update(json.dumps(payload).encode()) + encryptor.finalize()
    return base64.b64encode(ct + encryptor.tag).decode()


async def handle_flow_request(body: dict):
    """Top-level handler. Returns a base64 string response Meta expects."""
    try:
        data, aes_key, iv = _decrypt(body)
    except Exception as e:
        log.exception("flow decrypt failed: %s", e)
        return {"error": "decrypt_failed"}

    action = data.get("action")
    screen = data.get("screen")
    form = data.get("data", {})

    next_screen, next_data = await _route(action, screen, form)
    response = {"version": data.get("version", "3.0"), "screen": next_screen, "data": next_data}
    return _encrypt(response, aes_key, iv)


# ─── Screen routing ──────────────────────────────────────────────────────────
SPORTS_FOR_FLOW = [
    {"id": "badminton-court", "title": "Badminton Court", "price": 400},
    {"id": "badminton-guest", "title": "Badminton Guest Player", "price": 150},
    {"id": "cricket-turf", "title": "Cricket Turf", "price": 1200},
    {"id": "tt-court", "title": "Table Tennis Court", "price": 250},
    {"id": "tt-guest", "title": "Table Tennis Guest Player", "price": 100},
]


async def _route(action: str, screen: str, form: dict):
    if action == "INIT" or screen is None:
        return "SPORT", {"sports": SPORTS_FOR_FLOW}

    if screen == "SPORT":
        # User picked a sport → show date picker (next 7 days)
        today = date.today()
        dates = [
            {"id": (today + timedelta(days=i)).isoformat(),
             "title": (today + timedelta(days=i)).strftime("%a, %d %b")}
            for i in range(7)
        ]
        return "DATE", {"sport_id": form.get("sport_id"), "dates": dates}

    if screen == "DATE":
        sport_id = form.get("sport_id")
        date_id = form.get("date_id")
        slots = await fetch_slots(sport_id, date_id)
        slot_opts = [
            {"id": s["time"], "title": f"{s['time']} ({s['remaining']} left)"}
            for s in slots if s.get("available")
        ]
        return "SLOT", {"sport_id": sport_id, "date_id": date_id, "slots": slot_opts}

    if screen == "SLOT":
        return "DETAILS", {
            "sport_id": form.get("sport_id"),
            "date_id": form.get("date_id"),
            "slot_id": form.get("slot_id"),
        }

    if screen == "DETAILS":
        sport_meta = next((s for s in SPORTS_FOR_FLOW if s["id"] == form.get("sport_id")), None)
        if not sport_meta:
            return "ERROR", {"message": "Unknown sport"}
        result = await create_booking({
            "sport": form["sport_id"],
            "sportName": sport_meta["title"],
            "date": form["date_id"],
            "slotTime": form["slot_id"],
            "durationMin": 60,
            "priceINR": sport_meta["price"],
            "name": form.get("name", ""),
            "phone": form.get("phone", ""),
            "source": "whatsapp",
        })
        if not result.get("success"):
            return "ERROR", {"message": result.get("error", "Booking failed")}
        return "SUCCESS", {"booking_id": result.get("bookingId", "—")}

    return "SPORT", {"sports": SPORTS_FOR_FLOW}
