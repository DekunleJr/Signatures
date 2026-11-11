# ---- Stage 1: build the frontend ----
FROM node:22-slim AS frontend
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
# Vite reads VITE_* at build time; pass with --build-arg
ARG VITE_API_URL
ARG VITE_GOOGLE_CLIENT_ID
ENV VITE_API_URL=$VITE_API_URL VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
RUN npx vite build --outDir /dist --emptyOutDir

# ---- Stage 2: runtime ----
FROM python:3.13-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PIP_NO_CACHE_DIR=1
WORKDIR /app

COPY backend/requirements.txt .
RUN pip install -r requirements.txt

COPY backend/ .
COPY --from=frontend /dist ./static

EXPOSE 8000
CMD ["sh", "-c", "gunicorn app.main:app -k uvicorn.workers.UvicornWorker -w ${WEB_CONCURRENCY:-2} -b 0.0.0.0:${PORT:-8000} --timeout 60 --preload"]
