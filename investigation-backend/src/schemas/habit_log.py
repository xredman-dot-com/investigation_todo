from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class HabitLogCreate(BaseModel):
    completed_at: date
    count: int | None = None
    note: str | None = None


class HabitLogUpdate(BaseModel):
    count: int | None = None
    note: str | None = None


class HabitLogOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    habit_id: UUID
    user_id: UUID
    completed_at: date
    count: int
    note: str | None = None
    created_at: datetime
