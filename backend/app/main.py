import os 
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from starlette.routing import Mount
from starlette.responses import FileResponse
from . import models
from .database import engine
from .routers import admin, auth, work, service, users, contact
from .config import settings

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

app.include_router(auth.router)
app.include_router(work.router)
app.include_router(service.router)
app.include_router(admin.router)
app.include_router(users.router)
app.include_router(contact.router)

@app.get("/api")
def read_root():
    return {"message": "Hello from the backend!"}

# Mount the static files directory
# app.mount("/static", StaticFiles(directory="./static"), name="static")
# app.mount("/", StaticFiles(directory="static", html=True), name="frontend")

# Serve the frontend for all other routes
# @app.get("/{full_path:path}")
# async def serve_frontend(request: Request, full_path: str):
#     # Serve index.html for all other routes
#     return FileResponse("static/index.html")

app.mount("/static", StaticFiles(directory="static"), name="static")

# --- Frontend catch-all route ---
@app.get("/{full_path:path}")
async def serve_frontend(request: Request, full_path: str):
    # Only serve index.html for non-API routes
    if full_path.startswith("api"):
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Resource not found")
    
    index_path = os.path.join("static", "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"detail": "index.html not found"}
