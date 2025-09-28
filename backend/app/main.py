from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

@app.get("/api")
def read_root():
    return {"message": "Hello from the backend!"}

# app.mount("/assets", StaticFiles(directory="static/assets"), name="assets")
# templates = Jinja2Templates(directory="static")

# @app.get("/{full_path:path}")
# async def serve_react_app(request: Request, full_path: str):
#     return templates.TemplateResponse("index.html", {"request": request})
