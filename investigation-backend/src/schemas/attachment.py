from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class AttachmentCreate(BaseModel):
    file_name: str
    file_type: str
    file_size: int
    cos_url: str
    cos_key: str
    thumbnail_url: str | None = None


class AttachmentOut(AttachmentCreate):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    task_id: UUID
    user_id: UUID
    created_at: datetime
