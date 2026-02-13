from datetime import date, timedelta
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.deps import get_current_user
from src.core.database import get_db
from src.models.habit import Habit
from src.models.habit_log import HabitLog
from src.models.user import User
from src.schemas.habit import HabitCreate, HabitOut, HabitUpdate
from src.schemas.habit_log import HabitLogCreate, HabitLogOut, HabitLogUpdate

router = APIRouter(prefix="/habits")


def _recalculate_streak(dates: list[date]) -> int:
    if not dates:
        return 0
    dates_sorted = sorted(dates, reverse=True)
    streak = 1
    for index in range(1, len(dates_sorted)):
        if dates_sorted[index - 1] - dates_sorted[index] == timedelta(days=1):
            streak += 1
        else:
            break
    return streak


async def _refresh_habit_stats(db: AsyncSession, habit: Habit) -> None:
    result = await db.execute(
        select(HabitLog.completed_at, HabitLog.count)
        .where(HabitLog.habit_id == habit.id)
        .order_by(HabitLog.completed_at.desc())
    )
    rows = result.all()
    dates = [row[0] for row in rows]
    total_completed = sum(row[1] for row in rows)

    if habit.frequency == "daily":
        current_streak = _recalculate_streak(dates)
    else:
        current_streak = habit.current_streak

    habit.total_completed = total_completed
    habit.current_streak = current_streak
    habit.longest_streak = max(habit.longest_streak, current_streak)


@router.get("/", response_model=list[HabitOut])
async def list_habits(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[Habit]:
    result = await db.execute(
        select(Habit).where(Habit.user_id == current_user.id).order_by(Habit.created_at.desc())
    )
    return result.scalars().all()


@router.post("/", response_model=HabitOut, status_code=status.HTTP_201_CREATED)
async def create_habit(
    payload: HabitCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Habit:
    habit = Habit(
        user_id=current_user.id,
        name=payload.name,
        icon=payload.icon,
        color=payload.color,
        frequency=payload.frequency or "daily",
        target_count=payload.target_count or 1,
        reminder_enabled=payload.reminder_enabled or False,
        reminder_time=payload.reminder_time,
        is_positive=True if payload.is_positive is None else payload.is_positive,
    )
    db.add(habit)
    await db.commit()
    await db.refresh(habit)
    return habit


@router.get("/{habit_id}", response_model=HabitOut)
async def get_habit(
    habit_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Habit:
    result = await db.execute(
        select(Habit).where(Habit.id == habit_id, Habit.user_id == current_user.id)
    )
    habit = result.scalar_one_or_none()
    if not habit:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Habit not found")
    return habit


@router.put("/{habit_id}", response_model=HabitOut)
async def update_habit(
    habit_id: UUID,
    payload: HabitUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Habit:
    result = await db.execute(
        select(Habit).where(Habit.id == habit_id, Habit.user_id == current_user.id)
    )
    habit = result.scalar_one_or_none()
    if not habit:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Habit not found")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(habit, key, value)

    await db.commit()
    await db.refresh(habit)
    return habit


@router.delete("/{habit_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_habit(
    habit_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    result = await db.execute(
        select(Habit).where(Habit.id == habit_id, Habit.user_id == current_user.id)
    )
    habit = result.scalar_one_or_none()
    if not habit:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Habit not found")

    await db.delete(habit)
    await db.commit()
    return None


@router.get("/{habit_id}/logs", response_model=list[HabitLogOut])
async def list_logs(
    habit_id: UUID,
    start_date: date | None = None,
    end_date: date | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[HabitLog]:
    result = await db.execute(
        select(Habit.id).where(Habit.id == habit_id, Habit.user_id == current_user.id)
    )
    if result.scalar_one_or_none() is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Habit not found")

    stmt = select(HabitLog).where(
        HabitLog.habit_id == habit_id, HabitLog.user_id == current_user.id
    )
    if start_date:
        stmt = stmt.where(HabitLog.completed_at >= start_date)
    if end_date:
        stmt = stmt.where(HabitLog.completed_at <= end_date)
    stmt = stmt.order_by(HabitLog.completed_at.desc())

    result = await db.execute(stmt)
    return result.scalars().all()


@router.post("/{habit_id}/logs", response_model=HabitLogOut, status_code=status.HTTP_201_CREATED)
async def create_log(
    habit_id: UUID,
    payload: HabitLogCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> HabitLog:
    result = await db.execute(
        select(Habit).where(Habit.id == habit_id, Habit.user_id == current_user.id)
    )
    habit = result.scalar_one_or_none()
    if not habit:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Habit not found")

    result = await db.execute(
        select(HabitLog).where(
            HabitLog.habit_id == habit_id,
            HabitLog.user_id == current_user.id,
            HabitLog.completed_at == payload.completed_at,
        )
    )
    existing_log = result.scalar_one_or_none()

    if existing_log:
        if payload.count is not None:
            existing_log.count = payload.count
        if payload.note is not None:
            existing_log.note = payload.note
        await _refresh_habit_stats(db, habit)
        await db.commit()
        await db.refresh(existing_log)
        return existing_log

    log = HabitLog(
        habit_id=habit_id,
        user_id=current_user.id,
        completed_at=payload.completed_at,
        count=payload.count or 1,
        note=payload.note,
    )
    db.add(log)
    await _refresh_habit_stats(db, habit)
    await db.commit()
    await db.refresh(log)
    return log


@router.put("/{habit_id}/logs/{log_id}", response_model=HabitLogOut)
async def update_log(
    habit_id: UUID,
    log_id: UUID,
    payload: HabitLogUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> HabitLog:
    result = await db.execute(
        select(Habit).where(Habit.id == habit_id, Habit.user_id == current_user.id)
    )
    habit = result.scalar_one_or_none()
    if not habit:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Habit not found")

    result = await db.execute(
        select(HabitLog).where(
            HabitLog.id == log_id,
            HabitLog.habit_id == habit_id,
            HabitLog.user_id == current_user.id,
        )
    )
    log = result.scalar_one_or_none()
    if not log:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Habit log not found")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(log, key, value)

    await _refresh_habit_stats(db, habit)
    await db.commit()
    await db.refresh(log)
    return log


@router.delete("/{habit_id}/logs/{log_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_log(
    habit_id: UUID,
    log_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    result = await db.execute(
        select(Habit).where(Habit.id == habit_id, Habit.user_id == current_user.id)
    )
    habit = result.scalar_one_or_none()
    if not habit:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Habit not found")

    result = await db.execute(
        select(HabitLog).where(
            HabitLog.id == log_id,
            HabitLog.habit_id == habit_id,
            HabitLog.user_id == current_user.id,
        )
    )
    log = result.scalar_one_or_none()
    if not log:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Habit log not found")

    await db.delete(log)
    await _refresh_habit_stats(db, habit)
    await db.commit()
    return None
