import uuid
from datetime import datetime
from sqlmodel import SQLModel
from typing import Annotated
from pydantic import AfterValidator, BaseModel
from enum import StrEnum

def is_empty(value: str):
    if value is None:
        return value
    if not value.strip():
        raise ValueError(f"Cannot be empty")
    return value.strip().upper()

def empty_name(value: str):
    if value is None:
        return value
    if not value.strip():
        raise ValueError(f"Cannot be empty")
    return value.strip()

class Status(StrEnum):
    success = "Success"
    failed = "Failed" 

class UploadStatus(BaseModel):
    chunk: int
    status: Status
    inserted_rows: int
    reason: str | None = None
    row_start: int
    row_end: int

class UploadStatusResponse(BaseModel):
    total_successful: int
    total_failed: int
    data: list[UploadStatus]

class OrdersPublic(SQLModel):
    id : int
    order_id: int
    order_date: datetime
    product_sku: str
    product_name: str
    price: float
    qty_ordered: float
    model_range : str

class DeleteOrdersRequest(SQLModel):
    ids: list[int]

class DeleteOrdersResponse(SQLModel):
    deleted: int

class CreateReport(SQLModel):
    name: Annotated[str, AfterValidator(empty_name)]
    date_range_start: datetime
    date_range_end: datetime
    sku: Annotated[str | None, AfterValidator(is_empty)] = None
    model_range: Annotated[str, AfterValidator(is_empty)]

class ReportPublic(SQLModel):
    id: int
    name: str
    created_at: datetime
    date_range_start: datetime
    date_range_end: datetime
    sku: str | None = None
    model_range: str

class ReportPublicWithData(ReportPublic):
    data: list[OrdersPublic]

class UserCreate(SQLModel):
    username: str
    password: str

class UserUpdate(SQLModel):
    username: Annotated[str | None, AfterValidator(empty_name)] = None
    password: str | None = None
    is_active: bool | None = None
    is_superuser: bool | None = None

class UserPublic(SQLModel):
    id: uuid.UUID
    username: str
    is_active: bool
    is_superuser: bool

class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"

class TokenPayload(SQLModel):
    sub: str | None = None