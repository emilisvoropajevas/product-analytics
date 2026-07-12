from collections.abc import Generator

import uuid
import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, delete

from app.core.db import engine, init_db
from app.crud import create_user
from app.main import app
from app.models import Orders, Reports
from app.schemas import UserCreate
from tests.utils.utils import get_superuser_token_headers, get_user_token_headers, generate_random_password
from tests.utils.seed_order_data import raw_test_data

@pytest.fixture(scope="session", autouse=True)
def db() -> Generator[Session, None, None]:
    with Session(engine) as session:
        init_db(session)
        yield session

@pytest.fixture(scope="session", autouse=True)
def seed_order(db: Session) -> Generator[None, None, None]:
    seed_data = [dict(zip(raw_test_data.keys(), values)) for values in zip(*raw_test_data.values())]
    #Unpack dictionary of dict values for seed orders
    orders = [Orders(**row) for row in seed_data]
    db.add_all(orders)
    db.commit()
    yield
    statement = delete(Orders)
    db.exec(statement)
    statement = delete(Reports)
    db.exec(statement)
    db.commit()
    
@pytest.fixture(scope="module")
def client() -> Generator[TestClient, None, None]:
    with TestClient(app) as c:
        yield c

@pytest.fixture(scope="module")
def superuser_token_headers(client: TestClient) -> dict[str,str]:
    return get_superuser_token_headers(client)

@pytest.fixture(scope="module")
def normal_user_token_headers(client: TestClient, db: Session) -> Generator[dict[str,str], None, None]:
    username = f"normal_user_{uuid.uuid4().hex[:8]}"
    password = generate_random_password()
    user = create_user(session=db, user_create=UserCreate(username=username, password=password))
    yield get_user_token_headers(client, username, password)
    db.delete(user)
    db.commit()