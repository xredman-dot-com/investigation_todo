from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class SubtaskBase(BaseModel):
    title: str
    is_completed: bool | None = None
    sort_order: int | None = None


class SubtaskCreate(SubtaskBase):
    pass


class SubtaskUpdate(BaseModel):
    title: str | None = None
    is_completed: bool | None = None
    sort_order: int | None = None


class SubtaskOut(SubtaskBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    task_id: UUID
    created_at: datetime
    updated_at: datetime
