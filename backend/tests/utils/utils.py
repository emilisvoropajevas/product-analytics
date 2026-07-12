import random
import string

from fastapi.testclient import TestClient

from app.core.config import settings

def get_superuser_token_headers(client : TestClient) -> dict[str, str]:
    login_data = {
        "username": settings.FIRST_SUPERUSER,
        "password": settings.FIRST_SUPERUSER_PASSWORD,
    }
    r = client.post(f"{settings.API_V1_STR}/login/access-token", data=login_data)
    tokens = r.json()
    a_token = tokens["access_token"]
    headers = {"Authorization": f"Bearer {a_token}"}
    return headers

def generate_random_password() -> str:
    return "".join(random.choices(string.ascii_lowercase, k=32))

def get_user_token_headers(client: TestClient, username: str, password: str) -> dict[str,str]:
    login_data = {
        "username": username,
        "password": password,
    }
    r = client.post(f"{settings.API_V1_STR}/login/access-token", data=login_data)
    tokens = r.json()
    a_token = tokens["access_token"]
    headers = {"Authorization": f"Bearer {a_token}"}
    return headers
