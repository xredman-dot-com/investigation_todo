from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class CountdownCreate(BaseModel):
    title: str
    target_date: date
    type: str | None = None
    calendar_type: str | None = None
    lunar_month: int | None = None
    lunar_day: int | None = None


class CountdownUpdate(BaseModel):
    title: str | None = None
    target_date: date | None = None
    type: str | None = None
    calendar_type: str | None = None
    lunar_month: int | None = None
    lunar_day: int | None = None


class CountdownOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    title: str
    target_date: date
    type: str
    calendar_type: str
    lunar_month: int | None = None
    lunar_day: int | None = None
    created_at: datetime
    updated_at: datetime
