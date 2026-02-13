from datetime import date, timedelta
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.deps import get_current_user
from src.core.database import get_db
from src.models.list import List
from src.models.task import Task
from src.models.user import User
from src.schemas.task import TaskOut
from src.schemas.view import EisenhowerView, TimelineBucket

router = APIRouter(prefix="/views")


def _apply_filters(
    stmt,
    list_id: UUID | None = None,
    status: str | None = None,
    priority: int | None = None,
    tag: str | None = None,
    tags: str | None = None,
) -> any:
    if list_id:
        stmt = stmt.where(Task.list_id == list_id)
    if status:
        stmt = stmt.where(Task.status == status)
    if priority is not None:
        stmt = stmt.where(Task.priority == priority)
    if tag:
        stmt = stmt.where(Task.tags.contains([tag]))
    if tags:
        tags_list = [value.strip() for value in tags.split(",") if value.strip()]
        if tags_list:
            stmt = stmt.where(Task.tags.overlap(tags_list))
    return stmt


@router.get("/timeline", response_model=list[TimelineBucket])
async def timeline_view(
    start_date: date | None = None,
    end_date: date | None = None,
    list_id: UUID | None = None,
    status: str | None = None,
    priority: int | None = None,
    tag: str | None = None,
    tags: str | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[TimelineBucket]:
    stmt = select(Task).where(Task.user_id == current_user.id, Task.due_date.is_not(None))
    stmt = _apply_filters(stmt, list_id, status, priority, tag, tags)
    if start_date:
        stmt = stmt.where(Task.due_date >= start_date)
    if end_date:
        stmt = stmt.where(Task.due_date <= end_date)
    stmt = stmt.order_by(Task.due_date.asc(), Task.due_time.nulls_last(), Task.created_at.asc())

    result = await db.execute(stmt)
    tasks = result.scalars().all()

    buckets: dict[date, list[TaskOut]] = {}
    for task in tasks:
        if task.due_date is None:
            continue
        buckets.setdefault(task.due_date, []).append(task)

    return [TimelineBucket(date=day, tasks=buckets[day]) for day in sorted(buckets)]


@router.get("/smart/{name}", response_model=list[TaskOut])
async def smart_list(
    name: str,
    list_id: UUID | None = None,
    status: str | None = None,
    priority: int | None = None,
    tag: str | None = None,
    tags: str | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[Task]:
    today = date.today()
    stmt = select(Task).where(Task.user_id == current_user.id)

    if status is None:
        status = "todo"
    stmt = _apply_filters(stmt, list_id, status, priority, tag, tags)

    if name == "today":
        stmt = stmt.where(Task.due_date == today)
    elif name == "tomorrow":
        stmt = stmt.where(Task.due_date == today + timedelta(days=1))
    elif name == "next7":
        stmt = stmt.where(
            Task.due_date >= today + timedelta(days=1),
            Task.due_date <= today + timedelta(days=7),
        )
    elif name == "overdue":
        stmt = stmt.where(Task.due_date < today)
    elif name == "nodate":
        stmt = stmt.where(Task.due_date.is_(None))
    elif name == "inbox":
        if list_id is None:
            result = await db.execute(
                select(List.id).where(List.user_id == current_user.id, List.name == "Inbox")
            )
            inbox_id = result.scalar_one_or_none()
            if inbox_id is None:
                return []
            stmt = stmt.where(Task.list_id == inbox_id)
    else:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Smart list not found")

    stmt = stmt.order_by(Task.created_at.desc())
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/eisenhower", response_model=EisenhowerView)
async def eisenhower_view(
    list_id: UUID | None = None,
    status: str | None = None,
    priority: int | None = None,
    tag: str | None = None,
    tags: str | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> EisenhowerView:
    today = date.today()
    stmt = select(Task).where(Task.user_id == current_user.id)
    if status is None:
        status = "todo"
    stmt = _apply_filters(stmt, list_id, status, priority, tag, tags)
    stmt = stmt.order_by(Task.due_date.asc(), Task.due_time.nulls_last(), Task.created_at.asc())

    result = await db.execute(stmt)
    tasks = result.scalars().all()

    buckets = {"Q1": [], "Q2": [], "Q3": [], "Q4": []}
    for task in tasks:
        if task.eisenhower_quadrant in buckets:
            buckets[task.eisenhower_quadrant].append(task)
            continue
        important = bool(task.is_important) or (task.priority >= 3)
        urgent = task.due_date is not None and task.due_date <= today

        if important and urgent:
            buckets["Q1"].append(task)
        elif important and not urgent:
            buckets["Q2"].append(task)
        elif (not important) and urgent:
            buckets["Q3"].append(task)
        else:
            buckets["Q4"].append(task)

    return EisenhowerView(q1=buckets["Q1"], q2=buckets["Q2"], q3=buckets["Q3"], q4=buckets["Q4"])
