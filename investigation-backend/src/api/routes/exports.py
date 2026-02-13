from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.deps import get_current_user
from src.core.database import get_db
from src.models.attachment import Attachment
from src.models.habit import Habit
from src.models.habit_log import HabitLog
from src.models.list import List
from src.models.pomodoro import PomodoroSession
from src.models.reminder import Reminder
from src.models.subtask import Subtask
from src.models.task import Task
from src.models.user import User
from src.schemas.export import ExportPayload

router = APIRouter(prefix="/exports")


@router.get("/full", response_model=ExportPayload)
async def export_full(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ExportPayload:
    lists = (
        await db.execute(
            select(List).where(List.user_id == current_user.id).order_by(List.created_at.asc())
        )
    ).scalars().all()
    tasks = (
        await db.execute(
            select(Task).where(Task.user_id == current_user.id).order_by(Task.created_at.asc())
        )
    ).scalars().all()
    subtasks = (
        await db.execute(
            select(Subtask)
            .join(Task, Subtask.task_id == Task.id)
            .where(Task.user_id == current_user.id)
            .order_by(Subtask.created_at.asc())
        )
    ).scalars().all()
    attachments = (
        await db.execute(
            select(Attachment)
            .where(Attachment.user_id == current_user.id)
            .order_by(Attachment.created_at.asc())
        )
    ).scalars().all()
    reminders = (
        await db.execute(
            select(Reminder)
            .join(Task, Reminder.task_id == Task.id)
            .where(Task.user_id == current_user.id)
            .order_by(Reminder.created_at.asc())
        )
    ).scalars().all()
    habits = (
        await db.execute(
            select(Habit).where(Habit.user_id == current_user.id).order_by(Habit.created_at.asc())
        )
    ).scalars().all()
    habit_logs = (
        await db.execute(
            select(HabitLog)
            .where(HabitLog.user_id == current_user.id)
            .order_by(HabitLog.created_at.asc())
        )
    ).scalars().all()
    pomodoro_sessions = (
        await db.execute(
            select(PomodoroSession)
            .where(PomodoroSession.user_id == current_user.id)
            .order_by(PomodoroSession.created_at.asc())
        )
    ).scalars().all()

    return ExportPayload(
        generated_at=datetime.utcnow(),
        user_id=current_user.id,
        lists=lists,
        tasks=tasks,
        subtasks=subtasks,
        attachments=attachments,
        reminders=reminders,
        habits=habits,
        habit_logs=habit_logs,
        pomodoro_sessions=pomodoro_sessions,
    )
