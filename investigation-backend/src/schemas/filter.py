from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class FilterCriteria(BaseModel):
    model_config = ConfigDict(extra="allow")

    list_id: UUID | None = None
    status: str | None = None
    priority: int | None = None
    tag: str | None = None
    tags: list[str] | None = None
    due_date_from: date | None = None
    due_date_to: date | None = None
    query: str | None = None
    is_important: bool | None = None
    eisenhower_quadrant: str | None = None
    has_due_date: bool | None = None


class FilterBase(BaseModel):
    name: str
    icon: str | None = None
    color: str | None = None
    sort_order: int | None = None
    criteria: FilterCriteria | None = None


class FilterCreate(FilterBase):
    pass


class FilterUpdate(BaseModel):
    name: str | None = None
    icon: str | None = None
    color: str | None = None
    sort_order: int | None = None
    criteria: FilterCriteria | None = None


class FilterOut(FilterBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    criteria: FilterCriteria
    created_at: datetime
    updated_at: datetime
