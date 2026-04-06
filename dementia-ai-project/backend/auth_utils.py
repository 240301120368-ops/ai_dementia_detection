import os 
from datetime import datetime, timedelta
from typing import Optional
from jose import jwt
import pyotp
from passlib.context import CryptContext

# Use pbkdf2_sha256 to avoid bcrypt compatibility issues with Python 3.14
# passlib's bcrypt backend crashes during initialization on newer Python versions
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
from fastapi import Depends, HTTPException, status
import re
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import crud, schemas, database

# Configuration
SECRET_KEY_ENV = os.getenv("SECRET_KEY")
if SECRET_KEY_ENV is None:
    raise ValueError("SECRET_KEY environment variable not set.")
SECRET_KEY: str = SECRET_KEY_ENV

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 # 24 hours
PASSWORD_RESET_TOKEN_EXPIRE_MINUTES = 15

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def validate_password_complexity(password: str):
    """
    Validates password complexity.
    Raises HTTPException with all unmet criteria if the password is not complex enough.
    """
    errors = []
    if len(password) < 8:
        errors.append("be at least 8 characters long")
    if not re.search(r"[A-Z]", password):
        errors.append("contain at least one uppercase letter")
    if not re.search(r"[a-z]", password):
        errors.append("contain at least one lowercase letter")
    if not re.search(r"\d", password):
        errors.append("contain at least one digit")
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        errors.append("contain at least one special character")

    if errors:
        detail = "Password must: " + "; ".join(errors) + "."
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail,
        )

def generate_otp_secret() -> str:
    return pyotp.random_base32()

def get_otp_uri(email: str, secret: str) -> str:
    return pyotp.totp.TOTP(secret).provisioning_uri(
        name=email, issuer_name="NeuroCare AI"
    )

def verify_otp_code(secret: str, code: str) -> bool:
    totp = pyotp.totp.TOTP(secret)
    # The 'window' argument allows for a bit of clock drift between server and client
    return totp.verify(code, valid_window=1)

def create_2fa_temp_token(email: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=5) # Short-lived token
    to_encode = {"exp": expire, "sub": email, "scope": "2fa_login"}
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_password_reset_token(email: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=PASSWORD_RESET_TOKEN_EXPIRE_MINUTES)
    to_encode = {
        "exp": expire,
        "sub": email,
        "scope": "password_reset" # Add a scope to differentiate from access tokens
    }
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)