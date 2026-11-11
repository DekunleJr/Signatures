import os 
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from starlette.routing import Mount
from starlette.responses import FileResponse
from sqlalchemy import text
from . import models
from .database import engine
from .routers import admin, auth, work, service, users, contact, home
from . import seo
from .database import get_db
from fastapi import Depends
from sqlalchemy.orm import Session
from .config import settings

models.Base.metadata.create_all(bind=engine)

# create_all does not add indexes to tables that already exist; do it idempotently.
with engine.begin() as _conn:
    for _stmt in (
        "CREATE INDEX IF NOT EXISTS ix_works_created_at ON works (created_at DESC)",
        "CREATE INDEX IF NOT EXISTS ix_users_verification_token ON users (verification_token)",
        "CREATE INDEX IF NOT EXISTS ix_password_resets_user_id ON password_resets (user_id)",
        "CREATE INDEX IF NOT EXISTS ix_liked_works_work_id ON liked_works (work_id)",
    ):
        _conn.execute(text(_stmt))

# Gunicorn runs with --preload: drop connections opened above so forked workers
# don't share the master's sockets (each worker opens its own).
engine.dispose()

app = FastAPI()

app.add_middleware(GZipMiddleware, minimum_size=1024)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://www.2125signature.com", "https://2125signature.com", "http://localhost:8000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

app.include_router(home.router)
app.include_router(auth.router)
app.include_router(work.router)
app.include_router(service.router)
app.include_router(admin.router)
app.include_router(users.router)
app.include_router(contact.router)
app.include_router(seo.router)  # robots.txt + sitemap.xml (must precede the catch-all)

@app.get("/api")
def read_root():
    return {"message": "Hello from the backend!"}


class CachedStaticFiles(StaticFiles):
    """Vite emits content-hashed files under /assets, so they are safe to cache forever."""
    async def get_response(self, path, scope):
        response = await super().get_response(path, scope)
        if response.status_code == 200:
            if path.startswith("assets/"):
                response.headers["Cache-Control"] = "public, max-age=31536000, immutable"
            else:
                response.headers["Cache-Control"] = "public, max-age=86400"
        return response


app.mount("/static", CachedStaticFiles(directory="static"), name="static")

# --- Frontend catch-all route ---
@app.api_route("/{full_path:path}", methods=["GET", "HEAD"])
def serve_frontend(full_path: str, db: Session = Depends(get_db)):
    # API paths that match no route are real 404s, not the SPA
    if full_path.startswith("api"):
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Resource not found")

    # Per-route <head> (title, description, canonical, Open Graph, JSON-LD) and
    # an honest HTTP status: 200 for real pages, 404 for unknown URLs.
    return seo.page_for("/" + full_path, db)
