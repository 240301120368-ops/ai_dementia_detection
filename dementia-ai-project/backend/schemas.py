from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# Logic for User Signup
class UserCreate(BaseModel): 
    full_name: str
    email: EmailStr
    password: str

# Logic for returning User data (Hiding the password)
class UserOut(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    is_2fa_enabled: bool
    is_verified: bool

    class Config:
        from_attributes = True

# --- Schemas for 2FA ---
class TwoFASetup(BaseModel):
    otp_uri: str

class TwoFAEnable(BaseModel):
    otp_code: str

class TwoFADisable(BaseModel):
    password: str

class FirstStepLoginResponse(BaseModel):
    two_fa_required: bool
    temp_token: Optional[str] = None

class Verify2FARequest(BaseModel):
    temp_token: str
    otp_code: str


# --- Schemas for Password Reset ---

class EmailSchema(BaseModel):
    email: EmailStr

class ResetPasswordSchema(BaseModel):
    token: str
    password: str

# --- Schemas for OTP Email Verification ---
class VerifySignupOTPSchema(BaseModel):
    email: EmailStr
    otp_code: str

# Logic for Authentication
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# --- Schemas for Patients ---

class PatientBase(BaseModel):
    full_name: str
    email: EmailStr
    age: int
    gender: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    medical_history: Optional[str] = None
    notes: Optional[str] = None

class PatientCreate(PatientBase):
    pass

class PatientOut(PatientBase):
    id: int
    date_created: datetime

    class Config:
        from_attributes = True


# --- Schemas for Assessments ---

class AssessmentBase(BaseModel):
    risk_label: str
    speech_score: float

class AssessmentCreate(AssessmentBase):
    # This is what the /analyze endpoint will create
    pass

class AssessmentOut(AssessmentBase):
    id: int
    user_id: int
    timestamp: datetime
    # These can be null if only speech was analyzed
    memory_score: Optional[int] = None
    reaction_ms: Optional[float] = None

    class Config:
        from_attributes = True