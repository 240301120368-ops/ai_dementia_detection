@echo off
echo ==========================================
echo Starting Dementia AI Project...
echo ==========================================
echo.
echo Backend API will be available at: http://localhost:8000
echo Frontend will be available at:    http://localhost:5173
echo.

echo Starting Backend...
start cmd /k "cd backend && .venv\Scripts\activate && uvicorn main:app --reload"

echo Starting Frontend...
start cmd /k "cd frontend && npm run dev"

echo.
echo Servers are starting in separate windows.
echo You can access the application by clicking the frontend link above!
echo ==========================================