from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.deps import get_current_user
from src.core.database import get_db
from src.models.subtask import Subtask
from src.models.task import Task
from src.models.user import User
from src.schemas.subtask import SubtaskCreate, SubtaskOut, SubtaskUpdate

router = APIRouter(prefix="/tasks/{task_id}/subtasks")


def _subtask_defaults(payload: SubtaskCreate | SubtaskUpdate) -> tuple[bool | None, int | None]:
    is_completed = (
        payload.is_completed if payload.is_completed is not None else None
    )
    sort_order = payload.sort_order if payload.sort_order is not None else None
    return is_completed, sort_order


async def _ensure_task(
    task_id: UUID, db: AsyncSession, current_user: User
) -> None:
    result = await db.execute(
        select(Task.id).where(Task.id == task_id, Task.user_id == current_user.id)
    )
    if result.scalar_one_or_none() is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")


@router.get("/", response_model=list[SubtaskOut])
async def list_subtasks(
    task_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[Subtask]:
    await _ensure_task(task_id, db, current_user)
    result = await db.execute(
        select(Subtask)
        .where(Subtask.task_id == task_id)
        .order_by(Subtask.sort_order, Subtask.created_at)
    )
    return result.scalars().all()


@router.post("/", response_model=SubtaskOut, status_code=status.HTTP_201_CREATED)
async def create_subtask(
    task_id: UUID,
    payload: SubtaskCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Subtask:
    await _ensure_task(task_id, db, current_user)
    is_completed, sort_order = _subtask_defaults(payload)

    subtask = Subtask(
        task_id=task_id,
        title=payload.title,
        is_completed=is_completed if is_completed is not None else False,
        sort_order=sort_order if sort_order is not None else 0,
    )
    db.add(subtask)
    await db.commit()
    await db.refresh(subtask)
    return subtask


@router.put("/{subtask_id}", response_model=SubtaskOut)
async def update_subtask(
    task_id: UUID,
    subtask_id: UUID,
    payload: SubtaskUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Subtask:
    await _ensure_task(task_id, db, current_user)
    result = await db.execute(
        select(Subtask).where(Subtask.id == subtask_id, Subtask.task_id == task_id)
    )
    subtask = result.scalar_one_or_none()
    if not subtask:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subtask not found")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(subtask, key, value)

    await db.commit()
    await db.refresh(subtask)
    return subtask


@router.delete("/{subtask_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_subtask(
    task_id: UUID,
    subtask_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    await _ensure_task(task_id, db, current_user)
    result = await db.execute(
        select(Subtask).where(Subtask.id == subtask_id, Subtask.task_id == task_id)
    )
    subtask = result.scalar_one_or_none()
    if not subtask:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subtask not found")

    await db.delete(subtask)
    await db.commit()
    return None
