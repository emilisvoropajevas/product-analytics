from datetime import datetime

from fastapi import APIRouter, HTTPException

from app.crud import read_orders, delete_orders
from app.api.deps import CurrentUser, CurrentSuperuser, SessionDep
from app.schemas import OrdersPublic, DeleteOrdersRequest, DeleteOrdersResponse

router = APIRouter(prefix="/orders", tags=["orders"])

@router.get("/", response_model=list[OrdersPublic], operation_id="getOrders")
def get_orders(session: SessionDep, current_user: CurrentUser, 
               start_date: datetime | None = None, end_date: datetime | None = None, 
               model_range: str | None = None, sku: str | None = None) -> list[OrdersPublic]:
    
    if (start_date and not end_date) or (end_date and not start_date):
        raise HTTPException(status_code=400, detail="Missing start or end date")
    result = read_orders(session=session, start_date=start_date, end_date=end_date, model_range=model_range, sku=sku)
    return result

@router.delete("/", response_model=DeleteOrdersResponse, operation_id="deleteOrders")
def remove_orders(*, session: SessionDep, current_user: CurrentSuperuser, ids_in: DeleteOrdersRequest) -> DeleteOrdersResponse:
    if not ids_in.ids:
        raise HTTPException(status_code=400, detail="No order ids provided")
    deleted = delete_orders(session=session, ids=ids_in.ids)
    if deleted == 0:
        raise HTTPException(status_code=404, detail="No matching orders found")
    return DeleteOrdersResponse(deleted=deleted)