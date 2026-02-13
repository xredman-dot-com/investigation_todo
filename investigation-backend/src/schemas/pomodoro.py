from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class PomodoroCreate(BaseModel):
    task_id: UUID | None = None
    duration: int
    break_duration: int | None = None
    type: str | None = None
    status: str | None = None
    started_at: datetime | None = None


class PomodoroUpdate(BaseModel):
    duration: int | None = None
    break_duration: int | None = None
    type: str | None = None
    status: str | None = None
    started_at: datetime | None = None
    completed_at: datetime | None = None
    actual_duration: int | None = None


class PomodoroOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    task_id: UUID | None = None
    duration: int
    break_duration: int
    type: str
    status: str
    started_at: datetime
    completed_at: datetime | None = None
    actual_duration: int | None = None
    created_at: datetime
