from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

import crud, schemas, database, models
from dependencies import get_current_user

router = APIRouter(
    prefix="/patients",
    tags=["Patients"]
)

@router.post("/", response_model=schemas.PatientOut, status_code=status.HTTP_201_CREATED)
def create_patient(
    patient: schemas.PatientCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Create a new patient record.
    """
    db_patient = crud.get_patient_by_email(db, email=patient.email)
    if db_patient:
        raise HTTPException(status_code=400, detail="Patient with this email already exists")
    return crud.create_patient(db=db, patient=patient)

@router.get("/", response_model=List[schemas.PatientOut])
def read_patients(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    List all patients.
    """
    return crud.get_patients(db, skip=skip, limit=limit)

@router.get("/{patient_id}", response_model=schemas.PatientOut)
def read_patient(
    patient_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Get details for a specific patient.
    """
    db_patient = crud.get_patient(db, patient_id=patient_id)
    if not db_patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return db_patient
