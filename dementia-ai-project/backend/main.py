import os
from dotenv import load_dotenv
load_dotenv() # MUST be before any local imports like models, database, routers

from fastapi import FastAPI, HTTPException, Depends, Body
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List

# Import your new database components
import models
import database

# Import routers
from routers import authentication, patients

# 1. Initialize the database! This creates the .db file
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Early Dementia System API")

# Setup rate limiter (needed by auth router)
try:
    from config import limiter
    from slowapi import _rate_limit_exceeded_handler
    from slowapi.errors import RateLimitExceeded
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
except ImportError:
    pass  # slowapi not installed, skip rate limiting

# Setup CORS (Crucial for connecting frontend and backend)
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount authentication router (/signup, /login, etc.)
app.include_router(authentication.router)
app.include_router(patients.router)

# 2. Pydantic schema for submitting new test data
class TestSubmissionRequest(BaseModel):
    patient_id: int
    memory_score: float
    recall_score: float
    attention_score: float

# 3. Pydantic schema for the results API response
class TestResultResponse(BaseModel):
    id: int
    date_performed: str
    result_status: str
    avg_score: float

# --- ENDPOINTS ---

@app.post("/api/analysis/submit", response_model=TestResultResponse)
def process_and_save_test_data(request: TestSubmissionRequest, db: Session = Depends(database.get_db)):
    """
    Receives scores from the frontend, runs AI logic (mock),
    saves results to the DB, and returns the analysis summary.
    """
    
    # Check if patient exists
    patient = db.query(models.Patient).filter(models.Patient.id == request.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # A. Run AI logic (Mock for now)
    # Simple logic to simulate analysis based on inputs.
    total_score = request.memory_score + request.recall_score + request.attention_score
    avg_score = total_score / 3
    
    status = "Detected" if avg_score < 7.0 else "Not Detected"
    stage = "Advanced" if avg_score < 4.0 else "Early" if avg_score < 7.0 else "Normal"
    confidence = int((10.0 - avg_score) * 10)

    # B. Create the Database Record
    new_check = models.MemoryCheck(
        patient_id=patient.id,
        memory_score=request.memory_score,
        recall_score=request.recall_score,
        attention_score=request.attention_score,
        avg_score=avg_score,
        result_status=status,
        result_stage=stage,
        ai_confidence=confidence
    )

    # C. Save to the database
    db.add(new_check)
    db.commit()
    db.refresh(new_check) # Get the newly created ID

    # Return summary response
    return {
        "id": new_check.id,
        "date_performed": new_check.date_performed.strftime("%Y-%m-%d"),
        "result_status": new_check.result_status,
        "avg_score": new_check.avg_score
    }

@app.get("/api/patients/{patient_id}/checks", response_model=List[TestResultResponse])
def get_patient_history(patient_id: int, db: Session = Depends(database.get_db)):
    """
    Returns a history of all memory checks for a patient.
    """
    checks = db.query(models.MemoryCheck).filter(models.MemoryCheck.patient_id == patient_id).order_by(models.MemoryCheck.date_performed.desc()).all()
    
    # Format dates as strings for JSON serialization
    results = []
    for check in checks:
        results.append({
            "id": check.id,
            "date_performed": check.date_performed.strftime("%Y-%m-%d"),
            "result_status": check.result_status,
            "avg_score": check.avg_score
        })
    return results

# Add endpoint for get_key for token validation verification.
@app.get("/get_key")
def get_key_check():
    return {"status": "ok", "key_validation_status": "Success"}

# Startup: auto-seed database with a patient if empty
@app.on_event("startup")
def startup_seed():
    db = database.SessionLocal()
    try:
        if not db.query(models.Patient).first():
            new_patient = models.Patient(full_name="Test Patient", email="patient@earlydementia.ai", age=72)
            db.add(new_patient)
            db.commit()
    finally:
        db.close()

@app.post("/api/seed")
def seed_data(db: Session = Depends(database.get_db)):
    if not db.query(models.Patient).first():
        new_patient = models.Patient(full_name="Test Patient", email="patient@earlydementia.ai", age=72)
        db.add(new_patient)
        db.commit()
    return {"message": "Database seeded with patient ID 1"}


@app.get("/api/analysis/latest")
def get_latest_analysis(db: Session = Depends(database.get_db)):
    """
    Returns the latest analysis in the full dashboard format.
    This endpoint bridges the gap between the DB schema and the Dashboard UI.
    """
    # Get the latest memory check
    latest_check = db.query(models.MemoryCheck).order_by(
        models.MemoryCheck.date_performed.desc()
    ).first()

    if not latest_check:
        raise HTTPException(status_code=404, detail="No analysis data found. Please complete an assessment first.")

    # Get the associated patient
    patient = db.query(models.Patient).filter(
        models.Patient.id == latest_check.patient_id
    ).first()

    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # Calculate AI model predictions from scores
    avg = latest_check.avg_score or 0
    # Mock MCI vs AD probability based on average score
    mci_prob = max(0, min(1, (7.0 - avg) / 7.0)) if avg < 7 else 0.05
    ad_prob = max(0, min(1, (4.0 - avg) / 4.0)) if avg < 4 else 0.02
    normal_prob = max(0, 1.0 - mci_prob - ad_prob)

    return {
        "patient": {
            "name": patient.full_name,
            "age": patient.age,
            "patient_id": f"PT-{patient.id:04d}"
        },
        "overview": {
            "date": latest_check.date_performed.strftime("%Y-%m-%d"),
            "technician": "AI System (Automated)"
        },
        "result": {
            "status": latest_check.result_status,
            "stage": latest_check.result_stage,
            "score": latest_check.ai_confidence
        },
        "test_data": [
            {"label": "Memory Score", "value": round(latest_check.memory_score, 1)},
            {"label": "Recall Score", "value": round(latest_check.recall_score, 1)},
            {"label": "Attention Score", "value": round(latest_check.attention_score, 1)},
            {"label": "Average Score", "value": round(avg, 1)},
        ],
        "model_predictions": [
            {"label": "Normal", "value": round(normal_prob, 3)},
            {"label": "MCI (Mild)", "value": round(mci_prob, 3)},
            {"label": "AD (Advanced)", "value": round(ad_prob, 3)},
        ]
    }

# --- Serve Frontend (SPA) ---
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

frontend_dir = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")

if os.path.isdir(frontend_dir):
    # Serve the static assets (JS, CSS, images)
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dir, "assets")), name="assets")
    
    # Optional: Serve vite.svg or other root public files if you have them
    @app.get("/vite.svg")
    def get_vite_svg():
        path = os.path.join(frontend_dir, "vite.svg")
        return FileResponse(path) if os.path.exists(path) else None
        
    # Catch-all route to serve React index.html for SPA routing (e.g. /dashboard)
    # Ensure this is the last route defined!
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        path = os.path.join(frontend_dir, full_path)
        if os.path.isfile(path):
            return FileResponse(path)
        return FileResponse(os.path.join(frontend_dir, "index.html"))

