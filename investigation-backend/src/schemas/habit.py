from datetime import datetime, time
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class HabitBase(BaseModel):
    name: str
    icon: str | None = None
    color: str | None = None
    frequency: str | None = None
    target_count: int | None = None
    reminder_enabled: bool | None = None
    reminder_time: time | None = None
    is_positive: bool | None = None


class HabitCreate(HabitBase):
    pass


class HabitUpdate(BaseModel):
    name: str | None = None
    icon: str | None = None
    color: str | None = None
    frequency: str | None = None
    target_count: int | None = None
    reminder_enabled: bool | None = None
    reminder_time: time | None = None
    is_positive: bool | None = None


class HabitOut(HabitBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    frequency: str
    target_count: int
    current_streak: int
    longest_streak: int
    total_completed: int
    reminder_enabled: bool
    created_at: datetime
    updated_at: datetime
