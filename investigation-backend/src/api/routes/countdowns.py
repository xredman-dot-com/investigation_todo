from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.deps import get_current_user
from src.core.database import get_db
from src.models.countdown import Countdown
from src.models.user import User
from src.schemas.countdown import CountdownCreate, CountdownOut, CountdownUpdate

router = APIRouter(prefix="/countdowns")


@router.get("/", response_model=list[CountdownOut])
async def list_countdowns(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[Countdown]:
    result = await db.execute(
        select(Countdown)
        .where(Countdown.user_id == current_user.id)
        .order_by(Countdown.target_date.asc(), Countdown.created_at.desc())
    )
    return result.scalars().all()


@router.post("/", response_model=CountdownOut, status_code=status.HTTP_201_CREATED)
async def create_countdown(
    payload: CountdownCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Countdown:
    countdown = Countdown(
        user_id=current_user.id,
        title=payload.title,
        target_date=payload.target_date,
        type=payload.type or "countdown",
        calendar_type=payload.calendar_type or "solar",
        lunar_month=payload.lunar_month,
        lunar_day=payload.lunar_day,
    )
    db.add(countdown)
    await db.commit()
    await db.refresh(countdown)
    return countdown


@router.get("/{countdown_id}", response_model=CountdownOut)
async def get_countdown(
    countdown_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Countdown:
    result = await db.execute(
        select(Countdown).where(Countdown.id == countdown_id, Countdown.user_id == current_user.id)
    )
    countdown = result.scalar_one_or_none()
    if not countdown:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Countdown not found")
    return countdown


@router.put("/{countdown_id}", response_model=CountdownOut)
async def update_countdown(
    countdown_id: UUID,
    payload: CountdownUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Countdown:
    result = await db.execute(
        select(Countdown).where(Countdown.id == countdown_id, Countdown.user_id == current_user.id)
    )
    countdown = result.scalar_one_or_none()
    if not countdown:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Countdown not found")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(countdown, key, value)

    await db.commit()
    await db.refresh(countdown)
    return countdown


@router.delete("/{countdown_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_countdown(
    countdown_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    result = await db.execute(
        select(Countdown).where(Countdown.id == countdown_id, Countdown.user_id == current_user.id)
    )
    countdown = result.scalar_one_or_none()
    if not countdown:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Countdown not found")

    await db.delete(countdown)
    await db.commit()
    return None
