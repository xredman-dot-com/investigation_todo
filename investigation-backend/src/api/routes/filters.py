from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.deps import get_current_user
from src.core.database import get_db
from src.models.filter import Filter
from src.models.list import List
from src.models.task import Task
from src.models.user import User
from src.schemas.filter import FilterCreate, FilterCriteria, FilterOut, FilterUpdate
from src.schemas.task import TaskOut

router = APIRouter(prefix="/filters")


def _apply_criteria(stmt, criteria: FilterCriteria):
    if criteria.list_id:
        stmt = stmt.where(Task.list_id == criteria.list_id)
    if criteria.status:
        stmt = stmt.where(Task.status == criteria.status)
    if criteria.priority is not None:
        stmt = stmt.where(Task.priority == criteria.priority)
    if criteria.tag:
        stmt = stmt.where(Task.tags.contains([criteria.tag]))
    if criteria.tags:
        tags_list = [value.strip() for value in criteria.tags if value.strip()]
        if tags_list:
            stmt = stmt.where(Task.tags.overlap(tags_list))
    if criteria.due_date_from:
        stmt = stmt.where(Task.due_date >= criteria.due_date_from)
    if criteria.due_date_to:
        stmt = stmt.where(Task.due_date <= criteria.due_date_to)
    if criteria.query:
        like_query = f"%{criteria.query}%"
        stmt = stmt.where(
            or_(Task.title.ilike(like_query), Task.description.ilike(like_query))
        )
    if criteria.is_important is not None:
        stmt = stmt.where(Task.is_important == criteria.is_important)
    if criteria.eisenhower_quadrant:
        stmt = stmt.where(Task.eisenhower_quadrant == criteria.eisenhower_quadrant)
    if criteria.has_due_date is True:
        stmt = stmt.where(Task.due_date.is_not(None))
    if criteria.has_due_date is False:
        stmt = stmt.where(Task.due_date.is_(None))
    return stmt


async def _get_filter(
    filter_id: UUID, db: AsyncSession, current_user: User
) -> Filter:
    result = await db.execute(
        select(Filter).where(Filter.id == filter_id, Filter.user_id == current_user.id)
    )
    filter_item = result.scalar_one_or_none()
    if not filter_item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Filter not found")
    return filter_item


async def _validate_list_id(
    criteria: FilterCriteria | None, db: AsyncSession, current_user: User
) -> None:
    if criteria and criteria.list_id:
        result = await db.execute(
            select(List.id).where(List.id == criteria.list_id, List.user_id == current_user.id)
        )
        if result.scalar_one_or_none() is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="List not found")


@router.get("/", response_model=list[FilterOut])
async def list_filters(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[Filter]:
    result = await db.execute(
        select(Filter)
        .where(Filter.user_id == current_user.id)
        .order_by(Filter.sort_order.asc(), Filter.created_at.asc())
    )
    return result.scalars().all()


@router.post("/", response_model=FilterOut, status_code=status.HTTP_201_CREATED)
async def create_filter(
    payload: FilterCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Filter:
    await _validate_list_id(payload.criteria, db, current_user)

    criteria = payload.criteria.model_dump(exclude_none=True) if payload.criteria else {}
    new_filter = Filter(
        user_id=current_user.id,
        name=payload.name,
        icon=payload.icon,
        color=payload.color,
        sort_order=payload.sort_order or 0,
        criteria=criteria,
    )
    db.add(new_filter)
    await db.commit()
    await db.refresh(new_filter)
    return new_filter


@router.get("/{filter_id}", response_model=FilterOut)
async def get_filter(
    filter_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Filter:
    return await _get_filter(filter_id, db, current_user)


@router.put("/{filter_id}", response_model=FilterOut)
async def update_filter(
    filter_id: UUID,
    payload: FilterUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Filter:
    filter_item = await _get_filter(filter_id, db, current_user)

    if payload.criteria is not None:
        await _validate_list_id(payload.criteria, db, current_user)

    update_data = payload.model_dump(exclude_unset=True)
    if "criteria" in update_data:
        if payload.criteria is None:
            update_data["criteria"] = {}
        else:
            update_data["criteria"] = payload.criteria.model_dump(exclude_none=True)

    for key, value in update_data.items():
        setattr(filter_item, key, value)

    await db.commit()
    await db.refresh(filter_item)
    return filter_item


@router.delete("/{filter_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_filter(
    filter_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    filter_item = await _get_filter(filter_id, db, current_user)
    await db.delete(filter_item)
    await db.commit()
    return None


@router.get("/{filter_id}/tasks", response_model=list[TaskOut])
async def filter_tasks(
    filter_id: UUID,
    limit: int | None = Query(None, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[Task]:
    filter_item = await _get_filter(filter_id, db, current_user)
    criteria = FilterCriteria.model_validate(filter_item.criteria or {})

    stmt = select(Task).where(Task.user_id == current_user.id)
    stmt = _apply_criteria(stmt, criteria)
    stmt = stmt.order_by(Task.created_at.desc())
    if limit:
        stmt = stmt.limit(limit)

    result = await db.execute(stmt)
    return result.scalars().all()
