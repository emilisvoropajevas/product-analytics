import uuid

from fastapi import APIRouter, HTTPException

from app.api.deps import CurrentSuperuser, SessionDep
from app.schemas import UserPublic, UserCreate, UserUpdate
from app.crud import get_users, get_user_by_id, get_user_by_username, create_user, update_user, delete_user

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/", response_model=list[UserPublic], operation_id="getUsers")
def read_users(*, session: SessionDep, current_user: CurrentSuperuser) -> list[UserPublic]:
    return get_users(session=session)

@router.post("/", response_model=UserPublic, operation_id="createUser")
def add_user(*, session: SessionDep, current_user: CurrentSuperuser, user_in: UserCreate) -> UserPublic:
    if get_user_by_username(session=session, username=user_in.username):
        raise HTTPException(status_code=409, detail="Username already exists")
    return create_user(session=session, user_create=user_in)

@router.patch("/{user_id}", response_model=UserPublic, operation_id="updateUser")
def edit_user(*, session: SessionDep, current_user: CurrentSuperuser, user_id: uuid.UUID, user_in: UserUpdate) -> UserPublic:
    db_user = get_user_by_id(session=session, user_id=user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    if user_in.username:
        existing = get_user_by_username(session=session, username=user_in.username)
        if existing and existing.id != user_id:
            raise HTTPException(status_code=409, detail="Username already exists")
    return update_user(session=session, db_user=db_user, user_in=user_in)

@router.delete("/{user_id}", operation_id="deleteUser")
def remove_user(*, session: SessionDep, current_user: CurrentSuperuser, user_id: uuid.UUID) -> dict:
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    if not delete_user(session=session, user_id=user_id):
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted"}