from datetime import date, datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import cast, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql.sqltypes import Date

from src.api.deps import get_current_user
from src.core.database import get_db
from src.models.habit_log import HabitLog
from src.models.pomodoro import PomodoroSession
from src.models.task import Task
from src.models.user import User
from src.schemas.statistics import DailyStat

router = APIRouter(prefix="/statistics")


def _date_range(start_date: date, end_date: date) -> list[date]:
    days = (end_date - start_date).days
    return [start_date + timedelta(days=offset) for offset in range(days + 1)]


@router.get("/daily", response_model=list[DailyStat])
async def daily_stats(
    start_date: date | None = None,
    end_date: date | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[DailyStat]:
    today = date.today()
    start_date = start_date or today
    end_date = end_date or today
    if end_date < start_date:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid date range")

    # Tasks created/completed grouped by date.
    tasks_created_stmt = (
        select(cast(Task.created_at, Date).label("day"), func.count(Task.id))
        .where(Task.user_id == current_user.id)
        .group_by("day")
    )
    tasks_completed_stmt = (
        select(cast(Task.completed_at, Date).label("day"), func.count(Task.id))
        .where(Task.user_id == current_user.id, Task.completed_at.is_not(None))
        .group_by("day")
    )

    created_rows = (await db.execute(tasks_created_stmt)).all()
    completed_rows = (await db.execute(tasks_completed_stmt)).all()

    created_map = {row[0]: row[1] for row in created_rows if row[0] is not None}
    completed_map = {row[0]: row[1] for row in completed_rows if row[0] is not None}

    # Pomodoro focus minutes by date.
    pomodoro_stmt = (
        select(cast(PomodoroSession.started_at, Date).label("day"), func.count(), func.sum(PomodoroSession.duration))
        .where(
            PomodoroSession.user_id == current_user.id,
            PomodoroSession.type == "focus",
        )
        .group_by("day")
    )
    pomodoro_rows = (await db.execute(pomodoro_stmt)).all()
    pomodoro_map = {row[0]: (row[1], int(row[2] or 0)) for row in pomodoro_rows if row[0] is not None}

    # Habit logs by date.
    habit_stmt = (
        select(HabitLog.completed_at.label("day"), func.sum(HabitLog.count))
        .where(HabitLog.user_id == current_user.id)
        .group_by("day")
    )
    habit_rows = (await db.execute(habit_stmt)).all()
    habit_map = {row[0]: int(row[1] or 0) for row in habit_rows if row[0] is not None}

    stats: list[DailyStat] = []
    for day in _date_range(start_date, end_date):
        overdue_stmt = select(func.count(Task.id)).where(
            Task.user_id == current_user.id,
            Task.status != "done",
            Task.due_date.is_not(None),
            Task.due_date < day,
        )
        active_stmt = select(func.count(Task.id)).where(
            Task.user_id == current_user.id,
            Task.status != "done",
        )
        overdue_count = (await db.execute(overdue_stmt)).scalar_one()
        active_count = (await db.execute(active_stmt)).scalar_one()

        pomodoro_count, focus_minutes = pomodoro_map.get(day, (0, 0))
        habits_completed = habit_map.get(day, 0)

        stats.append(
            DailyStat(
                stat_date=day,
                tasks_created=created_map.get(day, 0),
                tasks_completed=completed_map.get(day, 0),
                tasks_overdue=overdue_count,
                pomodoro_count=pomodoro_count,
                focus_minutes=focus_minutes,
                habits_completed=habits_completed,
                active_tasks=active_count,
                generated_at=datetime.utcnow(),
            )
        )

    return stats
