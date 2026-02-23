from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from routers import sessions
from services.firebase import FirebaseService

load_dotenv()

app = FastAPI(title="Attendance Tracker API", version="1.0.0")

allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:3001").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """Initialize Firebase on startup."""
    FirebaseService.initialize()


@app.get("/health")
def health():
    return {"status": "ok"}


app.include_router(sessions.router)