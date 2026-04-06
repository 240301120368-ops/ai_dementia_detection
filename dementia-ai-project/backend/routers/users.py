from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

import crud, schemas, auth_utils, database, models
from dependencies import get_current_user

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

@router.get("/me", response_model=schemas.UserOut)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    """
    Protected route to get the current authenticated user's information.
    """
    return current_user

@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_current_user(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Protected route to delete the current authenticated user and all their data.
    """
    crud.delete_user(db=db, user=current_user)
    return

@router.get("/2fa/setup", response_model=schemas.TwoFASetup)
def setup_2fa(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.is_2fa_enabled:
        raise HTTPException(status_code=400, detail="2FA is already enabled.")

    otp_secret = current_user.otp_secret or auth_utils.generate_otp_secret()
    crud.update_user_2fa(db, user=current_user, secret=otp_secret, enabled=False)

    otp_uri = auth_utils.get_otp_uri(current_user.email, otp_secret)
    return schemas.TwoFASetup(otp_uri=otp_uri)

@router.post("/2fa/enable", status_code=status.HTTP_200_OK)
def enable_2fa(
    payload: schemas.TwoFAEnable,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    if not current_user.otp_secret or not auth_utils.verify_otp_code(current_user.otp_secret, payload.otp_code):
        raise HTTPException(status_code=400, detail="Invalid 2FA code.")

    crud.update_user_2fa(db, user=current_user, secret=current_user.otp_secret, enabled=True)
    return {"message": "2FA has been enabled successfully."}

@router.post("/2fa/disable", status_code=status.HTTP_200_OK)
def disable_2fa(
    payload: schemas.TwoFADisable,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    if not auth_utils.verify_password(payload.password, current_user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect password.")

    crud.update_user_2fa(db, user=current_user, secret=None, enabled=False)
    return {"message": "2FA has been disabled successfully."}