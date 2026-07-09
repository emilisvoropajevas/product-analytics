from fastapi import UploadFile, APIRouter, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError

from app.api.services.clean_data import clean_and_format_csv
from app.crud import upload_orders
from app.api.deps import SessionDep, CurrentUser
from app.schemas import UploadStatus, UploadStatusResponse, Status

router = APIRouter(prefix="/upload", tags=["upload"])

@router.post("/", operation_id="uploadOrders")
async def upload_to_db(file: UploadFile, session: SessionDep, current_user: CurrentUser) -> UploadStatusResponse:
    MAX_FILE_SIZE = 5 * 1024 * 1024
    if file.size > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail=f"Filesize too large, must be below {MAX_FILE_SIZE/(1024*1024)}Mb")
    if file.content_type != "text/csv":
        raise HTTPException(status_code=415, detail="File must be CSV")
    contents = await file.read()
    try:
        chunks = clean_and_format_csv(contents)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    
    success = 0
    failed = 0
    chunk_status = []
    try :
        for i, chunk in enumerate(chunks):
            row_start = i + 1
            row_end = i + len(chunk)
            try:
                upload_chunk = upload_orders(session=session, orders_in=chunk)
                success += 1
                status = UploadStatus(chunk=row_start, status=Status.success, inserted_rows=upload_chunk["inserted_rows"], reason=None, row_start=row_start, row_end=row_end)
                chunk_status.append(status)
            except SQLAlchemyError as e:
                failed += 1
                status = UploadStatus(chunk=row_start, status=Status.failed, inserted_rows=0, reason= str(e), row_start=row_start, row_end=row_end)
                chunk_status.append(status)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    if success > 0 and failed > 0:
        return JSONResponse(status_code=207, content=UploadStatusResponse(total_successful=success, total_failed=failed, data=chunk_status).model_dump())
    elif failed > 0 and success == 0:
        raise HTTPException(status_code=500)
    return UploadStatusResponse(
        total_successful=success,
        total_failed=failed,
        data=chunk_status,
    )