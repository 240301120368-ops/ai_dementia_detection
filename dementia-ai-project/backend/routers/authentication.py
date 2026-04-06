from fastapi import APIRouter, Depends, HTTPException, status, Request
import secrets
import datetime
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Union
from datetime import timedelta
import os
from jose import jwt, JWTError
from fastapi_mail import FastMail, MessageSchema, MessageType

import crud, schemas, auth_utils, database
from config import limiter, conf

async def send_otp_email(email: str, full_name: str, otp: str):
    """
    Helper to send the verification OTP via email.
    """
    message = MessageSchema(
        subject="Verify your NeuroCare AI Account",
        recipients=[email],
        body=f"""
        <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #4ade80;">Welcome to NeuroCare AI!</h2>
            <p>Hello {full_name},</p>
            <p>Please use the following 6-digit code to verify your account registration. This code will expire in 10 minutes.</p>
            <div style="background: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; border-radius: 5px; margin: 20px 0;">
                {otp}
            </div>
            <p style="color: #666; font-size: 12px;">If you did not request this, please ignore this email.</p>
        </div>
        """,
        subtype=MessageType.html
    )
    fm = FastMail(conf)
    await fm.send_message(message)

router = APIRouter(
    tags=["Authentication"]
)

@router.post("/signup", response_model=schemas.UserOut)
async def signup(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    """
    Step 1: Create unverified account and send OTP.
    """
    db_user = crud.get_user_by_email(db, email=user.email)
    
    if db_user:
        if db_user.is_verified:
            raise HTTPException(status_code=400, detail="Email already registered")
        # If user exists but isn't verified, we allow "re-signing up" (updating info/sending new OTP)
        auth_utils.validate_password_complexity(user.password)
        hashed_password = auth_utils.get_password_hash(user.password)
        db_user.full_name = user.full_name
        db_user.hashed_password = hashed_password
        db.commit()
    else:
        auth_utils.validate_password_complexity(user.password)
        hashed_password = auth_utils.get_password_hash(user.password)
        db_user = crud.create_user(db=db, user=user, hashed_password=hashed_password)

    # Generate 6-digit OTP
    otp_code = "".join([str(secrets.randbelow(10)) for _ in range(6)])
    expiry = datetime.datetime.utcnow() + datetime.timedelta(minutes=10)
    
    crud.update_user_otp(db, db_user, otp_code, expiry)
    
    # Send Email
    try:
        await send_otp_email(db_user.email, db_user.full_name, otp_code)
    except Exception as e:
        print(f"Mail Error: {e}")
        # We don't fail the whole request, but ideally log this
    
    return db_user


@router.post("/verify-signup-otp", response_model=schemas.Token)
def verify_signup_otp(payload: schemas.VerifySignupOTPSchema, db: Session = Depends(database.get_db)):
    """
    Step 2: Verify OTP and log user in.
    """
    user = crud.get_user_by_email(db, email=payload.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.is_verified:
        raise HTTPException(status_code=400, detail="Account already verified")

    if not user.otp or user.otp != payload.otp_code:
        raise HTTPException(status_code=400, detail="Invalid verification code")

    if datetime.datetime.utcnow() > user.otp_expiry:
        raise HTTPException(status_code=400, detail="Verification code has expired")

    # Success
    crud.set_user_verified(db, user)
    
    # Issue token immediately
    access_token_expires = timedelta(minutes=auth_utils.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth_utils.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return schemas.Token(access_token=access_token, token_type="bearer")


@router.post("/login", response_model=Union[schemas.Token, schemas.FirstStepLoginResponse])
@limiter.limit("5/minute")
def login(request: Request, db: Session = Depends(database.get_db), form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Handles the first step of user login.
    """
    user = crud.get_user_by_email(db, email=form_data.username)
    if not user or not auth_utils.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if user.is_2fa_enabled:
        temp_token = auth_utils.create_2fa_temp_token(email=user.email)
        return schemas.FirstStepLoginResponse(two_fa_required=True, temp_token=temp_token)
    else:
        access_token_expires = timedelta(minutes=auth_utils.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = auth_utils.create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )
        return schemas.Token(access_token=access_token, token_type="bearer")


@router.post("/login/verify-2fa", response_model=schemas.Token)
def verify_2fa(request: schemas.Verify2FARequest, db: Session = Depends(database.get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate 2FA credentials",
    )
    try:
        payload = jwt.decode(request.temp_token, auth_utils.SECRET_KEY, algorithms=[auth_utils.ALGORITHM])
        if payload.get("scope") != "2fa_login":
            raise credentials_exception
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = crud.get_user_by_email(db, email=email)
    if not user:
        raise credentials_exception

    if not user.otp_secret or not auth_utils.verify_otp_code(user.otp_secret, request.otp_code):
        raise HTTPException(status_code=400, detail="Invalid 2FA code.")

    access_token_expires = timedelta(minutes=auth_utils.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth_utils.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return schemas.Token(access_token=access_token, token_type="bearer")


@router.post("/forgot-password")
@limiter.limit("5/minute")
async def forgot_password(payload: schemas.EmailSchema, request: Request, db: Session = Depends(database.get_db)):
    user = crud.get_user_by_email(db, email=payload.email)
    if not user:
        return {"message": "If an account with this email exists, a password reset link has been sent."}

    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://127.0.0.1:5500")
    token = auth_utils.create_password_reset_token(email=user.email)
    reset_link = f"{FRONTEND_URL}/reset-password.html?token={token}"

    message = MessageSchema(
        subject="Password Reset Request for NeuroCare AI",
        recipients=[user.email],
        body=f"""
        <p>Hello {user.full_name},</p>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <p><a href="{reset_link}">{reset_link}</a></p>
        <p>This link will expire in {auth_utils.PASSWORD_RESET_TOKEN_EXPIRE_MINUTES} minutes.</p>
        <p>If you did not request a password reset, please ignore this email.</p>
        """,
        subtype=MessageType.html
    )

    fm = FastMail(conf)
    await fm.send_message(message)
    return {"message": "If an account with this email exists, a password reset link has been sent."}


@router.post("/reset-password")
def reset_password(request: schemas.ResetPasswordSchema, db: Session = Depends(database.get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials, token is invalid or expired",
    )
    try:
        payload = jwt.decode(request.token, auth_utils.SECRET_KEY, algorithms=[auth_utils.ALGORITHM])
        if payload.get("scope") != "password_reset":
            raise credentials_exception
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = crud.get_user_by_email(db, email=email)
    if user is None:
        raise credentials_exception

    auth_utils.validate_password_complexity(request.password)
    hashed_password = auth_utils.get_password_hash(request.password)
    crud.update_user_password(db=db, user=user, hashed_password=hashed_password)

    return {"message": "Password has been reset successfully."}