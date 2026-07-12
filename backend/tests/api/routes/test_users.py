import uuid

from fastapi.testclient import TestClient

from app.core.config import settings
from tests.utils.utils import generate_random_password


def test_create_user(client: TestClient, superuser_token_headers: dict[str,str]) -> None:
    username = f"created_user_{uuid.uuid4().hex[:8]}"
    data = {"username": username, "password": generate_random_password()}
    r = client.post(f"{settings.API_V1_STR}/users", headers=superuser_token_headers, json=data)
    assert r.status_code == 200
    result = r.json()
    assert result["username"] == username
    assert result["is_active"] is True
    assert result["is_superuser"] is False
    assert "password" not in result
    assert "hashed_password" not in result


def test_create_user_duplicate_username(client: TestClient, superuser_token_headers: dict[str,str]) -> None:
    username = f"dup_user_{uuid.uuid4().hex[:8]}"
    data = {"username": username, "password": generate_random_password()}
    r1 = client.post(f"{settings.API_V1_STR}/users", headers=superuser_token_headers, json=data)
    assert r1.status_code == 200
    r2 = client.post(f"{settings.API_V1_STR}/users", headers=superuser_token_headers, json=data)
    assert r2.status_code == 409


def test_create_user_forbidden_for_non_superuser(client: TestClient, normal_user_token_headers: dict[str,str]) -> None:
    data = {"username": f"should_not_exist_{uuid.uuid4().hex[:8]}", "password": generate_random_password()}
    r = client.post(f"{settings.API_V1_STR}/users", headers=normal_user_token_headers, json=data)
    assert r.status_code == 403


def test_read_users(client: TestClient, superuser_token_headers: dict[str,str]) -> None:
    r = client.get(f"{settings.API_V1_STR}/users", headers=superuser_token_headers)
    assert r.status_code == 200
    usernames = [u["username"] for u in r.json()]
    assert settings.FIRST_SUPERUSER in usernames


def test_read_users_forbidden_for_non_superuser(client: TestClient, normal_user_token_headers: dict[str,str]) -> None:
    r = client.get(f"{settings.API_V1_STR}/users", headers=normal_user_token_headers)
    assert r.status_code == 403


def test_update_user_grants_superuser(client: TestClient, superuser_token_headers: dict[str,str]) -> None:
    username = f"promote_user_{uuid.uuid4().hex[:8]}"
    data = {"username": username, "password": generate_random_password()}
    r_create = client.post(f"{settings.API_V1_STR}/users", headers=superuser_token_headers, json=data)
    user_id = r_create.json()["id"]

    r = client.patch(f"{settings.API_V1_STR}/users/{user_id}", headers=superuser_token_headers, json={"is_superuser": True})
    assert r.status_code == 200
    assert r.json()["is_superuser"] is True


def test_update_user_deactivate_blocks_login(client: TestClient, superuser_token_headers: dict[str,str]) -> None:
    username = f"deactivate_user_{uuid.uuid4().hex[:8]}"
    password = generate_random_password()
    r_create = client.post(f"{settings.API_V1_STR}/users", headers=superuser_token_headers, json={"username": username, "password": password})
    user_id = r_create.json()["id"]

    r = client.patch(f"{settings.API_V1_STR}/users/{user_id}", headers=superuser_token_headers, json={"is_active": False})
    assert r.status_code == 200
    assert r.json()["is_active"] is False

    r_login = client.post(f"{settings.API_V1_STR}/login/access-token", data={"username": username, "password": password})
    assert r_login.status_code == 400


def test_update_user_password(client: TestClient, superuser_token_headers: dict[str,str]) -> None:
    username = f"pw_user_{uuid.uuid4().hex[:8]}"
    old_password = generate_random_password()
    new_password = generate_random_password()
    r_create = client.post(f"{settings.API_V1_STR}/users", headers=superuser_token_headers, json={"username": username, "password": old_password})
    user_id = r_create.json()["id"]

    r = client.patch(f"{settings.API_V1_STR}/users/{user_id}", headers=superuser_token_headers, json={"password": new_password})
    assert r.status_code == 200

    r_old = client.post(f"{settings.API_V1_STR}/login/access-token", data={"username": username, "password": old_password})
    assert r_old.status_code == 400

    r_new = client.post(f"{settings.API_V1_STR}/login/access-token", data={"username": username, "password": new_password})
    assert r_new.status_code == 200


def test_update_user_not_found(client: TestClient, superuser_token_headers: dict[str,str]) -> None:
    r = client.patch(f"{settings.API_V1_STR}/users/{uuid.uuid4()}", headers=superuser_token_headers, json={"is_active": False})
    assert r.status_code == 404


def test_update_user_duplicate_username(client: TestClient, superuser_token_headers: dict[str,str]) -> None:
    username_a = f"user_a_{uuid.uuid4().hex[:8]}"
    username_b = f"user_b_{uuid.uuid4().hex[:8]}"
    client.post(f"{settings.API_V1_STR}/users", headers=superuser_token_headers, json={"username": username_a, "password": generate_random_password()})
    r_b = client.post(f"{settings.API_V1_STR}/users", headers=superuser_token_headers, json={"username": username_b, "password": generate_random_password()})
    user_b_id = r_b.json()["id"]

    r = client.patch(f"{settings.API_V1_STR}/users/{user_b_id}", headers=superuser_token_headers, json={"username": username_a})
    assert r.status_code == 409


def test_delete_user(client: TestClient, superuser_token_headers: dict[str,str]) -> None:
    username = f"delete_user_{uuid.uuid4().hex[:8]}"
    r_create = client.post(f"{settings.API_V1_STR}/users", headers=superuser_token_headers, json={"username": username, "password": generate_random_password()})
    user_id = r_create.json()["id"]

    r = client.delete(f"{settings.API_V1_STR}/users/{user_id}", headers=superuser_token_headers)
    assert r.status_code == 200
    assert r.json()["message"] == "User deleted"

    r_check = client.patch(f"{settings.API_V1_STR}/users/{user_id}", headers=superuser_token_headers, json={"is_active": False})
    assert r_check.status_code == 404


def test_delete_user_not_found(client: TestClient, superuser_token_headers: dict[str,str]) -> None:
    r = client.delete(f"{settings.API_V1_STR}/users/{uuid.uuid4()}", headers=superuser_token_headers)
    assert r.status_code == 404


def test_delete_own_account_forbidden(client: TestClient, superuser_token_headers: dict[str,str]) -> None:
    r_me = client.post(f"{settings.API_V1_STR}/login/test-token", headers=superuser_token_headers)
    own_id = r_me.json()["id"]

    r = client.delete(f"{settings.API_V1_STR}/users/{own_id}", headers=superuser_token_headers)
    assert r.status_code == 400


def test_delete_user_forbidden_for_non_superuser(client: TestClient, normal_user_token_headers: dict[str,str]) -> None:
    r = client.delete(f"{settings.API_V1_STR}/users/{uuid.uuid4()}", headers=normal_user_token_headers)
    assert r.status_code == 403