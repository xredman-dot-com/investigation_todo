from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator

ALLOWED_REMINDER_OFFSETS = {5, 15, 60, 1440}


class ReminderBatchCreate(BaseModel):
    remind_at: list[datetime] = Field(default_factory=list)
    template_id: str | None = None


class ReminderOffsetsCreate(BaseModel):
    offset_minutes: list[int] = Field(default_factory=list)
    template_id: str | None = None

    @field_validator("offset_minutes")
    @classmethod
    def validate_offsets(cls, value: list[int]) -> list[int]:
        invalid = sorted({offset for offset in value if offset not in ALLOWED_REMINDER_OFFSETS})
        if invalid:
            allowed = ", ".join(str(offset) for offset in sorted(ALLOWED_REMINDER_OFFSETS))
            invalid_str = ", ".join(str(offset) for offset in invalid)
            raise ValueError(f"Unsupported offsets: {invalid_str}. Allowed: {allowed}")
        return value


class ReminderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    task_id: UUID
    remind_at: datetime
    is_sent: bool
    template_id: str | None = None
    created_at: datetime
