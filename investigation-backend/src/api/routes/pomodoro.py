from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.deps import get_current_user
from src.core.database import get_db
from src.models.pomodoro import PomodoroSession
from src.models.task import Task
from src.models.user import User
from src.schemas.pomodoro import PomodoroCreate, PomodoroOut, PomodoroUpdate

router = APIRouter(prefix="/pomodoro/sessions")


async def _ensure_task(task_id: UUID, db: AsyncSession, current_user: User) -> None:
    result = await db.execute(
        select(Task.id).where(Task.id == task_id, Task.user_id == current_user.id)
    )
    if result.scalar_one_or_none() is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")


@router.get("/", response_model=list[PomodoroOut])
async def list_sessions(
    start_at: datetime | None = None,
    end_at: datetime | None = None,
    status_filter: str | None = None,
    task_id: UUID | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[PomodoroSession]:
    stmt = select(PomodoroSession).where(PomodoroSession.user_id == current_user.id)
    if task_id:
        stmt = stmt.where(PomodoroSession.task_id == task_id)
    if status_filter:
        stmt = stmt.where(PomodoroSession.status == status_filter)
    if start_at:
        stmt = stmt.where(PomodoroSession.started_at >= start_at)
    if end_at:
        stmt = stmt.where(PomodoroSession.started_at <= end_at)
    stmt = stmt.order_by(PomodoroSession.started_at.desc())

    result = await db.execute(stmt)
    return result.scalars().all()


@router.post("/", response_model=PomodoroOut, status_code=status.HTTP_201_CREATED)
async def create_session(
    payload: PomodoroCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PomodoroSession:
    if payload.task_id:
        await _ensure_task(payload.task_id, db, current_user)

    session = PomodoroSession(
        user_id=current_user.id,
        task_id=payload.task_id,
        duration=payload.duration,
        break_duration=payload.break_duration or 5,
        type=payload.type or "focus",
        status=payload.status or "running",
        started_at=payload.started_at or datetime.utcnow(),
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return session


@router.put("/{session_id}", response_model=PomodoroOut)
async def update_session(
    session_id: UUID,
    payload: PomodoroUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PomodoroSession:
    result = await db.execute(
        select(PomodoroSession).where(
            PomodoroSession.id == session_id, PomodoroSession.user_id == current_user.id
        )
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(session, key, value)

    await db.commit()
    await db.refresh(session)
    return session


@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_session(
    session_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    result = await db.execute(
        select(PomodoroSession).where(
            PomodoroSession.id == session_id, PomodoroSession.user_id == current_user.id
        )
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    await db.delete(session)
    await db.commit()
    return None
