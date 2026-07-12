import uuid
from datetime import datetime
from sqlmodel import Session, select
from sqlalchemy import delete, func
from sqlalchemy.dialects.postgresql import insert

from app.core.security import get_password_hash, verify_password
from app.models import User, Reports, Orders
from app.schemas import CreateReport, UserCreate, UserUpdate

def create_user(*, session: Session, user_create: UserCreate) -> User:
    db_obj = User.model_validate(
        user_create, update={"hashed_password": get_password_hash(user_create.password)}
    )
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj

def get_user_by_username(*, session: Session, username: str) -> User | None:
    statement = select(User).where(User.username == username)
    session_user = session.exec(statement).first()
    return session_user

def get_users(*, session: Session) -> list[User]:
    statement = select(User)
    return session.exec(statement).all()

def get_user_by_id(*, session: Session, user_id: uuid.UUID) -> User | None:
    return session.get(User, user_id)

def update_user(*, session: Session, db_user: User, user_in: UserUpdate) -> User:
    user_data = user_in.model_dump(exclude_unset=True)
    if "password" in user_data:
        password = user_data.pop("password")
        user_data["hashed_password"] = get_password_hash(password)
    db_user.sqlmodel_update(user_data)
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user

def delete_user(*, session: Session, user_id: uuid.UUID) -> bool:
    user = session.get(User, user_id)
    if not user:
        return False
    session.delete(user)
    session.commit()
    return True

# Dummy hash to use for timing attack prevention when user is not found
# This is an Argon2 hash of a random password, used to ensure constant-time comparison
DUMMY_HASH = "$argon2id$v=19$m=65536,t=3,p=4$MjQyZWE1MzBjYjJlZTI0Yw$YTU4NGM5ZTZmYjE2NzZlZjY0ZWY3ZGRkY2U2OWFjNjk"

def authenticate(*, session: Session, username: str, password: str) -> User | None:
    db_user = get_user_by_username(session=session, username=username)
    if not db_user:
        # Prevent timing attacks by running password verification even when user doesn't exist
        # This ensures the response time is similar whether or not the email exists
        verify_password(password, DUMMY_HASH)
        return None
    verified, updated_password_hash = verify_password(password, db_user.hashed_password)
    if not verified:
        return None
    if updated_password_hash:
        db_user.hashed_password = updated_password_hash
        session.add(db_user)
        session.commit()
        session.refresh(db_user)
    return db_user

#Order Interaction and Uploads
def upload_orders(*, session: Session, orders_in: list[dict]) -> dict:
    statement = insert(Orders).values(orders_in)
    statement = statement.on_conflict_do_nothing()
    result = session.exec(statement)
    session.commit()
    return {"inserted_rows": result.rowcount}

def read_orders(*, session: Session, model_range: str | None = None, sku: str | None = None, start_date: datetime | None = None, end_date: datetime | None = None) -> list[Orders]:
    statement = select(Orders)

    if model_range:
        statement = statement.where(Orders.model_range == model_range)
    if sku:
        statement = statement.where(Orders.product_sku.ilike(f"%{sku}%"))
    if start_date and end_date:
        statement = statement.where(
            Orders.order_date >= start_date,
            Orders.order_date <= end_date,
        )
    statement = statement.order_by(Orders.order_date.asc())
    return session.exec(statement).all()

def delete_orders(*, session: Session, ids: list[int]) -> int:
    statement = delete(Orders).where(Orders.id.in_(ids))
    result = session.exec(statement)
    session.commit()
    return result.rowcount

#Report interactions
def create_report(*, session: Session, report_in: CreateReport) -> Reports:
    db_report = Reports.model_validate(report_in)
    session.add(db_report)
    session.commit()
    session.refresh(db_report)
    return db_report

def get_reports(*, session: Session) -> list[Reports]:
    statement = select(Reports)
    return session.exec(statement).all()

def get_report_by_id(*, session: Session, report_id: int) -> Reports | None:
    statement = select(Reports).where(Reports.id == report_id)
    return session.exec(statement).first()

def delete_report(*, session: Session, report_id: int) -> bool:
    statement = select(Reports).where(Reports.id == report_id)
    report = session.exec(statement).first()
    if not report:
        return False
    session.delete(report)
    session.commit()
    return True