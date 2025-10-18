# Signatures

## Description

A full-stack web application with a FastAPI backend and a React frontend. The backend provides API endpoints for authentication and other functionalities, while the frontend consumes these APIs to deliver a dynamic user experience.

## Features

- User authentication (login, registration)
- FastAPI backend with SQLAlchemy for database interactions
- React frontend with `react-router-dom` for navigation
- CORS enabled for seamless frontend-backend communication

## Technologies Used

- **Backend:** Python, FastAPI, SQLAlchemy, PostgreSQL (implied by `psycopg2-binary`), `python-jose` for JWT, `passlib` for password hashing.
- **Frontend:** JavaScript, React, Vite, `react-router-dom`.

## Setup Instructions

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/DekunleJr/Signatures.git
    cd Signatures
    ```

2.  **Backend Setup:**

    - Navigate to the `backend` directory:
      ```bash
      cd backend
      ```
    - Create a Python virtual environment and activate it:
      ```bash
      python -m venv venv
      # On Windows
      .\venv\Scripts\activate
      # On macOS/Linux
      source venv/bin/activate
      ```
    - Install backend dependencies:
      ```bash
      pip install -r requirements.txt
      ```
    - Create a `.env` file in the `backend` directory. Example content:
      ```
      DATABASE_URL="postgresql://user:password@host:port/dbname"
      SECRET_KEY="your-super-secret-key"
      ALGORITHM="HS256"
      ACCESS_TOKEN_EXPIRE_MINUTES=30
      ```
    - Run database migrations:
      ```bash
      # This project uses SQLAlchemy, so the models.Base.metadata.create_all(bind=engine)
      # in main.py will create tables on startup if they don't exist.
      # For production, consider a dedicated migration tool like Alembic.
      ```
    - Start the FastAPI backend server:
      ```bash
      uvicorn app.main:app --reload
      ```
      The backend will be accessible at `http://127.0.0.1:8000` (default).

3.  **Frontend Setup:**
    - Navigate to the `frontend/my-app` directory:
      ```bash
      cd ../frontend/my-app
      ```
    - Install frontend dependencies:
      ```bash
      npm install
      ```
    - Create a `.env` file in the `frontend/` directory. This should include `VITE_API_URL` pointing to your backend. For example:
      ```
      VITE_API_URL=http://localhost:8000
      ```
    - Start the React development server:
      ```bash
      npm run dev
      ```
      The frontend will typically be accessible at `http://localhost:5173` (or another port if 5173 is in use).

## Usage

Once both the backend and frontend servers are running, you can access the application through your web browser at the frontend's address (e.g., `http://localhost:5173`). You can navigate through the different pages and interact with the application.
