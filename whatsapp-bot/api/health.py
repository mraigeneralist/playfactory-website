from fastapi import FastAPI

from bot.config import settings

app = FastAPI()


@app.get("/")
@app.get("/health")
async def health():
    return {"ok": True, "business": settings.BUSINESS_NAME}
