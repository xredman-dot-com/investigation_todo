from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy import cast, distinct, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql.sqltypes import Date

from src.api.deps import get_current_user
from src.core.database import get_db
from src.models.habit import Habit
from src.models.habit_log import HabitLog
from src.models.pomodoro import PomodoroSession
from src.models.task import Task
from src.models.user import User
from src.schemas.widget import WidgetSummary

router = APIRouter(prefix="/widgets")


@router.get("/summary", response_model=WidgetSummary)
async def widget_summary(
    limit: int = Query(5, ge=0, le=20),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> WidgetSummary:
    today = date.today()

    base_tasks = select(Task).where(Task.user_id == current_user.id, Task.status != "done")
    due_today_stmt = (
        base_tasks.where(Task.due_date == today)
        .order_by(Task.due_time.nulls_last(), Task.created_at.asc())
        .limit(limit)
    )
    overdue_stmt = (
        base_tasks.where(Task.due_date < today)
        .order_by(Task.due_date.asc(), Task.due_time.nulls_last(), Task.created_at.asc())
        .limit(limit)
    )

    due_today_count_stmt = select(func.count(Task.id)).where(
        Task.user_id == current_user.id,
        Task.status != "done",
        Task.due_date == today,
    )
    overdue_count_stmt = select(func.count(Task.id)).where(
        Task.user_id == current_user.id,
        Task.status != "done",
        Task.due_date.is_not(None),
        Task.due_date < today,
    )
    active_count_stmt = select(func.count(Task.id)).where(
        Task.user_id == current_user.id,
        Task.status != "done",
    )

    habits_total_stmt = select(func.count(Habit.id)).where(Habit.user_id == current_user.id)
    habits_completed_stmt = select(func.count(distinct(HabitLog.habit_id))).where(
        HabitLog.user_id == current_user.id,
        HabitLog.completed_at == today,
    )

    pomodoro_stmt = select(func.count(PomodoroSession.id), func.sum(PomodoroSession.duration)).where(
        PomodoroSession.user_id == current_user.id,
        PomodoroSession.type == "focus",
        cast(PomodoroSession.started_at, Date) == today,
    )

    due_today = (await db.execute(due_today_stmt)).scalars().all()
    overdue = (await db.execute(overdue_stmt)).scalars().all()

    due_today_count = (await db.execute(due_today_count_stmt)).scalar_one()
    overdue_count = (await db.execute(overdue_count_stmt)).scalar_one()
    active_count = (await db.execute(active_count_stmt)).scalar_one()
    habits_total = (await db.execute(habits_total_stmt)).scalar_one()
    habits_completed = (await db.execute(habits_completed_stmt)).scalar_one()

    pomodoro_row = (await db.execute(pomodoro_stmt)).one()
    pomodoro_count = int(pomodoro_row[0] or 0)
    focus_minutes = int(pomodoro_row[1] or 0)

    return WidgetSummary(
        date=today,
        tasks_due_today=due_today,
        tasks_overdue=overdue,
        tasks_due_today_count=due_today_count,
        tasks_overdue_count=overdue_count,
        active_tasks_count=active_count,
        habits_total=habits_total,
        habits_completed=habits_completed,
        pomodoro_count=pomodoro_count,
        focus_minutes=focus_minutes,
    )
