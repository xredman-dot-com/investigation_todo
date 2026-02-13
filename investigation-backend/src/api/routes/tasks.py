from datetime import date, datetime
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status as http_status
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.deps import get_current_user
from src.core.database import get_db
from src.models.list import List
from src.models.task import Task
from src.models.user import User
from src.schemas.task import TaskCreate, TaskOut, TaskUpdate
from src.services.repeat import next_due_date

router = APIRouter()


@router.get("/", response_model=list[TaskOut])
async def list_tasks(
    list_id: UUID | None = None,
    status: str | None = None,
    query: str | None = None,
    priority: int | None = None,
    tag: str | None = None,
    tags: str | None = None,
    due_date_from: date | None = None,
    due_date_to: date | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[Task]:
    stmt = select(Task).where(Task.user_id == current_user.id)
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
    if due_date_from:
        stmt = stmt.where(Task.due_date >= due_date_from)
    if due_date_to:
        stmt = stmt.where(Task.due_date <= due_date_to)
    if query:
        like_query = f"%{query}%"
        stmt = stmt.where(
            or_(Task.title.ilike(like_query), Task.description.ilike(like_query))
        )
    stmt = stmt.order_by(Task.created_at.desc())
    result = await db.execute(stmt)
    return result.scalars().all()


@router.post("/", response_model=TaskOut, status_code=http_status.HTTP_201_CREATED)
async def create_task(
    payload: TaskCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Task:
    result = await db.execute(
        select(List.id).where(List.id == payload.list_id, List.user_id == current_user.id)
    )
    if result.scalar_one_or_none() is None:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="List not found")

    new_task = Task(
        user_id=current_user.id,
        list_id=payload.list_id,
        title=payload.title,
        description=payload.description,
        meaning=payload.meaning,
        priority=payload.priority if payload.priority is not None else 0,
        tags=payload.tags,
        repeat_rule=payload.repeat_rule,
        is_important=payload.is_important if payload.is_important is not None else False,
        eisenhower_quadrant=payload.eisenhower_quadrant,
        due_date=payload.due_date,
        due_time=payload.due_time,
        status=payload.status or "todo",
        position=payload.position,
    )
    if new_task.status == "done":
        new_task.completed_at = datetime.utcnow()

    db.add(new_task)
    await db.commit()
    await db.refresh(new_task)
    return new_task


@router.get("/{task_id}", response_model=TaskOut)
async def get_task(
    task_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Task:
    result = await db.execute(
        select(Task).where(Task.id == task_id, Task.user_id == current_user.id)
    )
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Task not found")
    return task


@router.put("/{task_id}", response_model=TaskOut)
async def update_task(
    task_id: UUID,
    payload: TaskUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Task:
    result = await db.execute(
        select(Task).where(Task.id == task_id, Task.user_id == current_user.id)
    )
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Task not found")

    was_done = task.status == "done"
    update_data = payload.model_dump(exclude_unset=True)
    title_changed = "title" in update_data and update_data["title"] != task.title
    schedule_changed = (
        ("due_date" in update_data and update_data["due_date"] != task.due_date)
        or ("due_time" in update_data and update_data["due_time"] != task.due_time)
    )
    if "list_id" in update_data:
        list_result = await db.execute(
            select(List.id).where(List.id == update_data["list_id"], List.user_id == current_user.id)
        )
        if list_result.scalar_one_or_none() is None:
            raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="List not found")

    for key, value in update_data.items():
        setattr(task, key, value)

    if title_changed or schedule_changed:
        now = datetime.utcnow()
        if title_changed:
            task.title_updated_at = now
        if schedule_changed:
            task.schedule_updated_at = now

    if "status" in update_data:
        if update_data["status"] == "done":
            task.completed_at = datetime.utcnow()
        else:
            task.completed_at = None

    if (not was_done) and task.status == "done" and task.repeat_rule and task.due_date:
        next_date = next_due_date(task.repeat_rule, task.due_date)
        if next_date:
            db.add(
                Task(
                    user_id=task.user_id,
                    list_id=task.list_id,
                    title=task.title,
                    description=task.description,
                    meaning=task.meaning,
                    priority=task.priority,
                    tags=task.tags,
                    repeat_rule=task.repeat_rule,
                    is_important=task.is_important,
                    eisenhower_quadrant=task.eisenhower_quadrant,
                    due_date=next_date,
                    due_time=task.due_time,
                    status="todo",
                )
            )

    await db.commit()
    await db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=http_status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    result = await db.execute(
        select(Task).where(Task.id == task_id, Task.user_id == current_user.id)
    )
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="Task not found")

    await db.delete(task)
    await db.commit()
    return None
