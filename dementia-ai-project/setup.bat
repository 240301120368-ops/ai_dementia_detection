@echo off
echo ==========================================
echo Setting up Dementia AI Project...
echo ==========================================

echo.
echo [1/2] Setting up Frontend (Node.js)...
cd frontend
call npm install
cd ..

echo.
echo [2/2] Setting up Backend (Python)...
cd backend
if not exist ".venv\" (
    echo Creating virtual environment...
    python -m venv .venv
)
call .venv\Scripts\activate.bat
python -m pip install --upgrade pip
pip install -r requirements.txt
cd ..

echo.
echo ==========================================
echo Setup Complete!
echo You can now use start.bat to run the application.
echo ==========================================
pause