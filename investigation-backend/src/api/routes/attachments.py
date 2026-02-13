from uuid import UUID

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.deps import get_current_user
from src.core.database import get_db
from src.models.attachment import Attachment
from src.models.task import Task
from src.models.user import User
from src.schemas.attachment import AttachmentCreate, AttachmentOut
from src.services.storage import StorageError, get_storage

router = APIRouter(prefix="/tasks/{task_id}/attachments")


async def _ensure_task(
    task_id: UUID, db: AsyncSession, current_user: User
) -> None:
    result = await db.execute(
        select(Task.id).where(Task.id == task_id, Task.user_id == current_user.id)
    )
    if result.scalar_one_or_none() is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")


@router.get("/", response_model=list[AttachmentOut])
async def list_attachments(
    task_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[Attachment]:
    await _ensure_task(task_id, db, current_user)
    result = await db.execute(
        select(Attachment)
        .where(Attachment.task_id == task_id, Attachment.user_id == current_user.id)
        .order_by(Attachment.created_at.desc())
    )
    return result.scalars().all()


@router.post("/", response_model=AttachmentOut, status_code=status.HTTP_201_CREATED)
async def create_attachment(
    task_id: UUID,
    payload: AttachmentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Attachment:
    await _ensure_task(task_id, db, current_user)

    attachment = Attachment(
        task_id=task_id,
        user_id=current_user.id,
        file_name=payload.file_name,
        file_type=payload.file_type,
        file_size=payload.file_size,
        cos_url=payload.cos_url,
        cos_key=payload.cos_key,
        thumbnail_url=payload.thumbnail_url,
    )
    db.add(attachment)
    await db.commit()
    await db.refresh(attachment)
    return attachment


@router.post("/upload", response_model=AttachmentOut, status_code=status.HTTP_201_CREATED)
async def upload_attachment(
    task_id: UUID,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Attachment:
    await _ensure_task(task_id, db, current_user)
    storage = get_storage()

    try:
        stored = await storage.save_upload(file, current_user.id, task_id)
    except StorageError as exc:
        raise HTTPException(status_code=exc.status_code, detail=str(exc)) from exc

    attachment = Attachment(
        task_id=task_id,
        user_id=current_user.id,
        file_name=stored.file_name,
        file_type=stored.content_type,
        file_size=stored.size,
        cos_url=stored.url,
        cos_key=stored.key,
        thumbnail_url=None,
    )
    db.add(attachment)
    await db.commit()
    await db.refresh(attachment)
    return attachment


@router.delete("/{attachment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_attachment(
    task_id: UUID,
    attachment_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    await _ensure_task(task_id, db, current_user)
    result = await db.execute(
        select(Attachment).where(
            Attachment.id == attachment_id,
            Attachment.task_id == task_id,
            Attachment.user_id == current_user.id,
        )
    )
    attachment = result.scalar_one_or_none()
    if not attachment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attachment not found")

    await db.delete(attachment)
    await db.commit()
    return None
