from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import shutil
import tempfile
import os
import numpy as np
import joblib
import crud, schemas, models
from database import get_db
from dependencies import get_current_user
from ml_logic.processor import AudioProcessor

router = APIRouter(
    tags=["Analysis"]
)

# --- ML Model Loading ---
MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'saved_models', 'dementia_model.pkl')
if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(f"Model file not found at {MODEL_PATH}. Please run the training script: `python -m backend.ml_logic.train`")
model = joblib.load(MODEL_PATH)
print("--- ML Model Loaded (from analysis router) ---")

@router.post("/analyze", response_model=schemas.AssessmentOut)
async def analyze_audio(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    try:
        with tempfile.NamedTemporaryFile(delete=True, suffix=os.path.splitext(file.filename)[1]) as tmp:
            shutil.copyfileobj(file.file, tmp)
            tmp.seek(0)
            file_path = tmp.name

            processor = AudioProcessor()
            features = processor.extract_features(file_path)
            if features is None:
                raise HTTPException(status_code=400, detail="Could not process audio file.")

            features_2d = np.array(features).reshape(1, -1)

            prediction_proba = model.predict_proba(features_2d)[0]
            prediction = model.predict(features_2d)[0]
            
            risk_score = float(prediction_proba[1]) 
            risk_label = "High Risk" if prediction == 1 else "Low Risk"

            assessment_data = schemas.AssessmentCreate(speech_score=risk_score, risk_label=risk_label)
            db_assessment = crud.create_assessment(db=db, assessment=assessment_data, user_id=current_user.id)

            return db_assessment
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {e}")

@router.get("/assessments/me", response_model=List[schemas.AssessmentOut])
def read_user_assessments(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.get_assessments_by_user(db=db, user_id=current_user.id)