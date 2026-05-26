"""Vercel serverless: /api/flow — encrypted WhatsApp Flow data exchange."""
from fastapi import FastAPI, Request

from bot.flow_endpoint import handle_flow_request

app = FastAPI()


@app.post("/")
@app.post("/flow")
async def flow(request: Request):
    body = await request.json()
    return await handle_flow_request(body)
