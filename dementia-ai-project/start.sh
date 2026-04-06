#!/bin/bash
echo "=========================================="
echo "Starting Dementia AI Project..."
echo "=========================================="
echo ""
echo "Backend API will be available at: http://localhost:8000"
echo "Frontend will be available at:    http://localhost:5173"
echo ""

echo "Starting Backend..."
(cd backend && source .venv/bin/activate && uvicorn main:app --reload) &

echo "Starting Frontend..."
(cd frontend && npm run dev) &

echo ""
echo "Servers are starting in the background."
echo "You can access the application by clicking the frontend link above!"
echo "Press Ctrl+C to stop both servers."
echo "=========================================="

wait