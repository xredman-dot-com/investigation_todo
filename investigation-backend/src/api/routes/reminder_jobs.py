from datetime import datetime, timedelta
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.deps import get_current_user
from src.core.database import get_db
from src.models.reminder import Reminder
from src.models.subscription_message import SubscriptionMessage
from src.models.task import Task
from src.models.user import User
from src.schemas.notification import SnoozeRequest, SubscriptionMessageOut
from src.schemas.reminder import ReminderOut

router = APIRouter(prefix="/reminders")


def _build_payload(reminder: Reminder, task: Task) -> dict:
    return {
        "reminder_id": str(reminder.id),
        "task_id": str(task.id),
        "title": task.title,
        "due_date": task.due_date.isoformat() if task.due_date else None,
        "due_time": task.due_time.isoformat() if task.due_time else None,
        "remind_at": reminder.remind_at.isoformat(),
    }


async def _get_reminder_for_user(
    reminder_id: UUID, db: AsyncSession, current_user: User
) -> tuple[Reminder, Task]:
    result = await db.execute(
        select(Reminder, Task)
        .join(Task, Reminder.task_id == Task.id)
        .where(Reminder.id == reminder_id, Task.user_id == current_user.id)
    )
    row = result.first()
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reminder not found")
    return row[0], row[1]


@router.patch("/{reminder_id}/snooze", response_model=ReminderOut)
async def snooze_reminder(
    reminder_id: UUID,
    payload: SnoozeRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Reminder:
    reminder, _task = await _get_reminder_for_user(reminder_id, db, current_user)

    if payload.remind_at is not None:
        reminder.remind_at = payload.remind_at
    else:
        reminder.remind_at = datetime.utcnow() + timedelta(minutes=payload.minutes or 0)

    reminder.is_sent = False
    await db.commit()
    await db.refresh(reminder)
    return reminder


@router.post("/dispatch", response_model=list[SubscriptionMessageOut])
async def dispatch_due_reminders(
    as_of: datetime | None = None,
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[SubscriptionMessage]:
    now = as_of or datetime.utcnow()
    result = await db.execute(
        select(Reminder, Task)
        .join(Task, Reminder.task_id == Task.id)
        .where(
            Task.user_id == current_user.id,
            Reminder.is_sent.is_(False),
            Reminder.remind_at <= now,
        )
        .order_by(Reminder.remind_at.asc())
        .limit(limit)
    )
    rows = result.all()
    if not rows:
        return []

    logs: list[SubscriptionMessage] = []
    for reminder, task in rows:
        payload = _build_payload(reminder, task)
        log = SubscriptionMessage(
            user_id=current_user.id,
            task_id=task.id,
            reminder_id=reminder.id,
            template_id=reminder.template_id,
            payload=payload,
            status="sent",
            sent_at=datetime.utcnow(),
        )
        reminder.is_sent = True
        db.add(log)
        logs.append(log)

    await db.commit()
    for log in logs:
        await db.refresh(log)

    return logs


@router.get("/logs", response_model=list[SubscriptionMessageOut])
async def list_reminder_logs(
    reminder_id: UUID | None = None,
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[SubscriptionMessage]:
    stmt = select(SubscriptionMessage).where(SubscriptionMessage.user_id == current_user.id)
    if reminder_id:
        stmt = stmt.where(SubscriptionMessage.reminder_id == reminder_id)
    stmt = stmt.order_by(SubscriptionMessage.created_at.desc()).limit(limit)

    result = await db.execute(stmt)
    return result.scalars().all()
