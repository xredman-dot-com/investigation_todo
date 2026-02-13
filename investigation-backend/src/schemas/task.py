from datetime import date, datetime, time
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class TaskBase(BaseModel):
    list_id: UUID
    title: str
    description: str | None = None
    meaning: str | None = None
    priority: int | None = None
    tags: list[str] | None = None
    repeat_rule: dict[str, Any] | None = None
    is_important: bool | None = None
    eisenhower_quadrant: str | None = None
    due_date: date | None = None
    due_time: time | None = None
    status: str | None = None
    position: int | None = None


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    list_id: UUID | None = None
    title: str | None = None
    description: str | None = None
    meaning: str | None = None
    priority: int | None = None
    tags: list[str] | None = None
    repeat_rule: dict[str, Any] | None = None
    is_important: bool | None = None
    eisenhower_quadrant: str | None = None
    due_date: date | None = None
    due_time: time | None = None
    status: str | None = None
    position: int | None = None


class TaskOut(TaskBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    status: str
    completed_at: datetime | None = None
    created_at: datetime
    updated_at: datetime
    title_updated_at: datetime
    schedule_updated_at: datetime
    insights: str | None = None
    completion_quality: int | None = None
    reflection_time: int | None = None
