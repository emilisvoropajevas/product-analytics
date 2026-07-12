from fastapi.testclient import TestClient
from datetime import datetime
from sqlmodel import Session

from app.core.config import settings
from app.schemas import OrdersPublic
from app.models import Orders

def test_orders_default_empty_fields(client: TestClient, superuser_token_headers: dict[str,str]) -> list[OrdersPublic]:
    required_columns = ["id", "order_id", "order_date", "product_sku", "product_name", "price", "qty_ordered", "model_range"]
    r = client.get(f"{settings.API_V1_STR}/orders", headers=superuser_token_headers)
    results = r.json()

    assert r.status_code == 200
    for column in required_columns:
        assert column in results[0] 
    
def test_orders_no_startdate(client: TestClient, superuser_token_headers: dict[str,str]) -> list[OrdersPublic]:
    r = client.get(f"{settings.API_V1_STR}/orders", headers=superuser_token_headers, params={"start_date": datetime(2026, 5, 10, 18, 59)})
    assert r.status_code == 400

def test_orders_no_enddate(client: TestClient, superuser_token_headers: dict[str,str]) -> list[OrdersPublic]:
    r = client.get(f"{settings.API_V1_STR}/orders", headers=superuser_token_headers, params={"end_date": datetime(2026, 5, 15, 8, 21)})
    assert r.status_code == 400

def test_orders_date_range(client: TestClient, superuser_token_headers: dict[str,str])-> list[OrdersPublic]:
    r = client.get(f"{settings.API_V1_STR}/orders", headers=superuser_token_headers, params={"start_date": datetime(2026, 5, 15, 1, 12), "end_date": datetime(2026, 5, 20, 16, 19)})
    assert r.status_code == 200
    results = r.json()
    #from seed data, this should only show 5 records
    assert len(results) == 5

def test_orders_out_of_bounds_date(client: TestClient, superuser_token_headers: dict[str,str]) -> list[OrdersPublic]:
    r = client.get(f"{settings.API_V1_STR}/orders", headers=superuser_token_headers, params={"start_date": datetime(2026, 6, 20, 16, 19), "end_date": datetime(2026, 7, 20, 16, 19)})
    assert r.status_code == 200
    results = r.json()
    assert results == []

def test_orders_sku_range(client: TestClient, superuser_token_headers: dict[str,str]) -> list[OrdersPublic]:
    r = client.get(f"{settings.API_V1_STR}/orders", headers=superuser_token_headers, params={"sku": "DWP/1935/01"})
    assert r.status_code == 200
    results = r.json()
    for sku in results:
        assert sku["product_sku"] == "DWP/1935/01"

def test_orders_sku_model_range(client: TestClient, superuser_token_headers: dict[str,str]) -> list[OrdersPublic]:
    r = client.get(f"{settings.API_V1_STR}/orders", headers=superuser_token_headers, params={"model_range": "DWP/1935"})
    assert r.status_code == 200
    results = r.json()
    for model in results:
        assert model["model_range"] == "DWP/1935"

def test_orders_bad_sku(client: TestClient, superuser_token_headers: dict[str,str]) -> list[OrdersPublic]:
    r = client.get(f"{settings.API_V1_STR}/orders", headers=superuser_token_headers, params={"sku": "DWP/19345/01"})
    assert r.status_code == 200
    results = r.json()
    assert results == []

def test_orders_bad_model_range(client: TestClient, superuser_token_headers: dict[str,str]) -> list[OrdersPublic]:
    r = client.get(f"{settings.API_V1_STR}/orders", headers=superuser_token_headers, params={"model_range": "DWP/19"})
    assert r.status_code == 200
    results = r.json()
    assert results == []

def test_delete_orders_single(client: TestClient, superuser_token_headers: dict[str,str], db: Session) -> None:
    extra_order = Orders(
        order_id=900002,
        order_date=datetime(2026, 5, 12, 12, 0),
        product_sku="ZZZ/9999/02",
        product_name="Test Product",
        price=1.0,
        qty_ordered=1,
        model_range="ZZZ/9999",
    )
    db.add(extra_order)
    db.commit()
    db.refresh(extra_order)

    r = client.request("DELETE", f"{settings.API_V1_STR}/orders", headers=superuser_token_headers, json={"ids": [extra_order.id]})
    assert r.status_code == 200
    assert r.json()["deleted"] == 1

    r_check = client.get(f"{settings.API_V1_STR}/orders", headers=superuser_token_headers, params={"sku": "ZZZ/9999/02"})
    assert r_check.json() == []


def test_delete_orders_multiple(client: TestClient, superuser_token_headers: dict[str,str], db: Session) -> None:
    extra_orders = [
        Orders(
            order_id=900010 + i,
            order_date=datetime(2026, 5, 12, 12, 0),
            product_sku=f"ZZZ/9999/1{i}",
            product_name="Test Product",
            price=1.0,
            qty_ordered=1,
            model_range="ZZZ/9998",
        )
        for i in range(3)
    ]
    db.add_all(extra_orders)
    db.commit()
    for o in extra_orders:
        db.refresh(o)
    ids = [o.id for o in extra_orders]

    r = client.request("DELETE", f"{settings.API_V1_STR}/orders", headers=superuser_token_headers, json={"ids": ids})
    assert r.status_code == 200
    assert r.json()["deleted"] == 3

    r_check = client.get(f"{settings.API_V1_STR}/orders", headers=superuser_token_headers, params={"model_range": "ZZZ/9998"})
    assert r_check.json() == []


def test_delete_orders_empty_ids(client: TestClient, superuser_token_headers: dict[str,str]) -> None:
    r = client.request("DELETE", f"{settings.API_V1_STR}/orders", headers=superuser_token_headers, json={"ids": []})
    assert r.status_code == 400


def test_delete_orders_nonexistent_id(client: TestClient, superuser_token_headers: dict[str,str]) -> None:
    r = client.request("DELETE", f"{settings.API_V1_STR}/orders", headers=superuser_token_headers, json={"ids": [999999999]})
    assert r.status_code == 404


def test_delete_orders_forbidden_for_non_superuser(client: TestClient, normal_user_token_headers: dict[str,str]) -> None:
    r = client.request("DELETE", f"{settings.API_V1_STR}/orders", headers=normal_user_token_headers, json={"ids": [1]})
    assert r.status_code == 403