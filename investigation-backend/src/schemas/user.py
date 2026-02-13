from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class UserPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    openid: str
    nickname: str | None = None
    avatar_url: str | None = None
    role: str
    status: str
    created_at: datetime
    updated_at: datetime
