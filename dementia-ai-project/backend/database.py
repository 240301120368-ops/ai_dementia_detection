import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

load_dotenv()

# We'll use SQLite for easy setup. In production, change this to PostgreSQL.
SQLALCHEMY_DATABASE_URL = "sqlite:///./early_dementia.db"
# Example production URL: os.getenv("DATABASE_URL")

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency to get the DB session for each API request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
