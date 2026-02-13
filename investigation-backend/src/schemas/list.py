from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class ListBase(BaseModel):
    name: str
    icon: str | None = None
    color: str | None = None
    sort_order: int | None = None


class ListCreate(ListBase):
    pass


class ListUpdate(BaseModel):
    name: str | None = None
    icon: str | None = None
    color: str | None = None
    sort_order: int | None = None


class ListOut(ListBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime
