# Stage 1: Build the frontend
FROM node:22 AS build-frontend

WORKDIR /app/frontend/my-app

COPY frontend/my-app/package.json ./
COPY frontend/my-app/package-lock.json ./

RUN npm install

COPY frontend/my-app/ ./

ARG VITE_API_URL=/api/
RUN npm run build

# Stage 2: Build the backend
FROM python:3.13

WORKDIR /app

COPY --from=build-frontend /app/frontend/my-app/dist /app/static

COPY backend/requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
