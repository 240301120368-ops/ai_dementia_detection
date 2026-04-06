import os
from dotenv import load_dotenv
load_dotenv()
from pydantic import EmailStr, SecretStr
from fastapi_mail import ConnectionConfig
from slowapi import Limiter
from slowapi.util import get_remote_address

# Rate Limiter
limiter = Limiter(key_func=get_remote_address)

# Mail Configuration
conf = ConnectionConfig(
    MAIL_USERNAME = os.getenv("MAIL_USERNAME", "pattnaiksubham79@gmail.com"),
    MAIL_PASSWORD = SecretStr(os.getenv("MAIL_PASSWORD", "subham79@*")),
    MAIL_FROM = os.getenv("MAIL_FROM", "pattnaiksubham79@gmail.com"), # type: ignore
    MAIL_PORT = int(os.getenv("MAIL_PORT", 587)),
    MAIL_SERVER = os.getenv("MAIL_SERVER", "smtp.gmail.com"),
    MAIL_STARTTLS = True,
    MAIL_SSL_TLS = False,
    USE_CREDENTIALS = True,
    VALIDATE_CERTS = True,
    MAIL_DEBUG = int(os.getenv("MAIL_DEBUG", 1))
)