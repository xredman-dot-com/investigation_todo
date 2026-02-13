from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, model_validator


class SnoozeRequest(BaseModel):
    minutes: int | None = Field(default=None, ge=1, le=10080)
    remind_at: datetime | None = None

    @model_validator(mode="after")
    def validate_choice(self) -> "SnoozeRequest":
        if self.minutes is None and self.remind_at is None:
            raise ValueError("Either minutes or remind_at must be provided")
        if self.minutes is not None and self.remind_at is not None:
            raise ValueError("Only one of minutes or remind_at is allowed")
        return self


class SubscriptionMessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    task_id: UUID | None = None
    reminder_id: UUID | None = None
    template_id: str | None = None
    payload: dict | None = None
    status: str
    error_message: str | None = None
    sent_at: datetime | None = None
    created_at: datetime
