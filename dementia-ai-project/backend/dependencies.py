from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from jose import JWTError

import auth_utils, crud, schemas, database

def get_current_user(db: Session = Depends(database.get_db), token: str = Depends(auth_utils.oauth2_scheme)):
    """
    Dependency to get the current user from a JWT token.
    Decodes the token, validates the user, and returns the user object.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = auth_utils.jwt.decode(token, auth_utils.SECRET_KEY, algorithms=[auth_utils.ALGORITHM])
        if payload.get("scope"):
            raise credentials_exception
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = crud.get_user_by_email(db, email=email)
    if user is None:
        raise credentials_exception
    return user