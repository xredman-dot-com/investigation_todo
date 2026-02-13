from datetime import datetime, timedelta
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.deps import get_current_user
from src.core.database import get_db
from src.models.reminder import Reminder
from src.models.task import Task
from src.models.user import User
from src.schemas.reminder import ReminderBatchCreate, ReminderOffsetsCreate, ReminderOut

router = APIRouter(prefix="/tasks/{task_id}/reminders")


def _require_due_datetime(task: Task) -> datetime:
    if task.due_date is None or task.due_time is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Task due_date and due_time are required",
        )
    return datetime.combine(task.due_date, task.due_time)


async def _get_task(task_id: UUID, db: AsyncSession, current_user: User) -> Task:
    result = await db.execute(
        select(Task).where(Task.id == task_id, Task.user_id == current_user.id)
    )
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return task


@router.get("/", response_model=list[ReminderOut])
async def list_reminders(
    task_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[Reminder]:
    await _get_task(task_id, db, current_user)
    result = await db.execute(
        select(Reminder)
        .where(Reminder.task_id == task_id)
        .order_by(Reminder.remind_at.asc())
    )
    return result.scalars().all()


@router.post("/", response_model=list[ReminderOut], status_code=status.HTTP_201_CREATED)
async def create_reminders(
    task_id: UUID,
    payload: ReminderBatchCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[Reminder]:
    await _get_task(task_id, db, current_user)
    remind_times = sorted({value for value in payload.remind_at})
    if not remind_times:
        return []

    reminders: list[Reminder] = []
    for remind_at in remind_times:
        reminder = Reminder(
            task_id=task_id,
            remind_at=remind_at,
            template_id=payload.template_id,
        )
        db.add(reminder)
        reminders.append(reminder)

    await db.commit()
    for reminder in reminders:
        await db.refresh(reminder)
    return reminders


@router.post("/from-offsets", response_model=list[ReminderOut], status_code=status.HTTP_201_CREATED)
async def create_reminders_from_offsets(
    task_id: UUID,
    payload: ReminderOffsetsCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[Reminder]:
    task = await _get_task(task_id, db, current_user)
    due_at = _require_due_datetime(task)

    offsets = sorted({offset for offset in payload.offset_minutes})
    if not offsets:
        return []

    remind_times = sorted({due_at - timedelta(minutes=offset) for offset in offsets})
    reminders: list[Reminder] = []
    for remind_at in remind_times:
        reminder = Reminder(
            task_id=task_id,
            remind_at=remind_at,
            template_id=payload.template_id,
        )
        db.add(reminder)
        reminders.append(reminder)

    await db.commit()
    for reminder in reminders:
        await db.refresh(reminder)
    return reminders


@router.delete("/{reminder_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_reminder(
    task_id: UUID,
    reminder_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    await _get_task(task_id, db, current_user)
    result = await db.execute(
        select(Reminder).where(Reminder.id == reminder_id, Reminder.task_id == task_id)
    )
    reminder = result.scalar_one_or_none()
    if not reminder:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reminder not found")

    await db.delete(reminder)
    await db.commit()
    return None
