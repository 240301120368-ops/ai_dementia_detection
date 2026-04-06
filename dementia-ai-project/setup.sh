#!/bin/bash
echo "=========================================="
echo "Setting up Dementia AI Project..."
echo "=========================================="

echo ""
echo "[1/2] Setting up Frontend (Node.js)..."
cd frontend || exit
npm install
cd ..

echo ""
echo "[2/2] Setting up Backend (Python)..."
cd backend || exit
if [ ! -d ".venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv .venv
fi
source .venv/bin/activate
python3 -m pip install --upgrade pip
pip install -r requirements.txt
cd ..

echo ""
echo "=========================================="
echo "Setup Complete!"
echo "You can now run ./start.sh to launch both servers."
echo "=========================================="