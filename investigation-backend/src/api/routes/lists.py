from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.deps import get_current_user
from src.core.database import get_db
from src.models.list import List
from src.models.user import User
from src.schemas.list import ListCreate, ListOut, ListUpdate

router = APIRouter()


@router.get("/", response_model=list[ListOut])
async def list_lists(
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
) -> list[List]:
    result = await db.execute(
        select(List).where(List.user_id == current_user.id).order_by(List.sort_order, List.created_at)
    )
    return result.scalars().all()


@router.post("/", response_model=ListOut, status_code=status.HTTP_201_CREATED)
async def create_list(
    payload: ListCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List:
    new_list = List(
        user_id=current_user.id,
        name=payload.name,
        icon=payload.icon,
        color=payload.color,
        sort_order=payload.sort_order or 0,
    )
    db.add(new_list)
    await db.commit()
    await db.refresh(new_list)
    return new_list


@router.get("/{list_id}", response_model=ListOut)
async def get_list(
    list_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List:
    result = await db.execute(
        select(List).where(List.id == list_id, List.user_id == current_user.id)
    )
    list_item = result.scalar_one_or_none()
    if not list_item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="List not found")
    return list_item


@router.put("/{list_id}", response_model=ListOut)
async def update_list(
    list_id: UUID,
    payload: ListUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List:
    result = await db.execute(
        select(List).where(List.id == list_id, List.user_id == current_user.id)
    )
    list_item = result.scalar_one_or_none()
    if not list_item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="List not found")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(list_item, key, value)

    await db.commit()
    await db.refresh(list_item)
    return list_item


@router.delete("/{list_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_list(
    list_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    result = await db.execute(
        select(List).where(List.id == list_id, List.user_id == current_user.id)
    )
    list_item = result.scalar_one_or_none()
    if not list_item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="List not found")

    await db.delete(list_item)
    await db.commit()
    return None
