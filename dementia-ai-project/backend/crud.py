from sqlalchemy.orm import Session
import models, schemas 
from typing import Optional

def get_user_by_email(db: Session, email: str):
    """
    Fetches a user from the database by their email address.
    """
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate, hashed_password: str):
    """
    Creates a new user in the database.
    """
    db_user = models.User(
        email=user.email, full_name=user.full_name, hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user_password(db: Session, user: models.User, hashed_password: str):
    user.hashed_password = hashed_password # type: ignore
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def update_user_2fa(db: Session, user: models.User, secret: Optional[str], enabled: bool):
    """
    Updates a user's 2FA secret and status.
    If disabling, the secret is set to None.
    """
    user.otp_secret = secret # type: ignore
    user.is_2fa_enabled = enabled # type: ignore
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def update_user_otp(db: Session, user: models.User, otp: Optional[str], expiry: Optional[models.datetime.datetime]):
    """
    Updates the registration OTP and its expiry time.
    """
    user.otp = otp # type: ignore
    user.otp_expiry = expiry # type: ignore
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def get_patient(db: Session, patient_id: int):
    return db.query(models.Patient).filter(models.Patient.id == patient_id).first()

def get_patient_by_email(db: Session, email: str):
    return db.query(models.Patient).filter(models.Patient.email == email).first()

def get_patients(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Patient).offset(skip).limit(limit).all()

def create_patient(db: Session, patient: schemas.PatientCreate):
    db_patient = models.Patient(
        full_name=patient.full_name,
        email=patient.email,
        age=patient.age,
        gender=patient.gender,
        phone=patient.phone,
        address=patient.address,
        medical_history=patient.medical_history,
        notes=patient.notes
    )
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    return db_patient

def set_user_verified(db: Session, user: models.User):
    """
    Marks a user as verified and clears OTP data.
    """
    user.is_verified = True # type: ignore
    user.otp = None # type: ignore
    user.otp_expiry = None # type: ignore
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def delete_user(db: Session, user: models.User):
    """
    Deletes a user and all their associated data (due to cascade).
    """
    db.delete(user)
    db.commit()