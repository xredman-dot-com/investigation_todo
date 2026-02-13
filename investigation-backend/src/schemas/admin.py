from datetime import datetime
from typing import Any, Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class UserAdminOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    openid: str
    unionid: str | None = None
    nickname: str | None = None
    avatar_url: str | None = None
    role: str
    status: str
    last_login_at: datetime | None = None
    admin_remark: str | None = None
    created_at: datetime
    updated_at: datetime


class UserAdminUpdate(BaseModel):
    status: Literal["active", "banned"] | None = None
    role: Literal["user", "admin", "owner"] | None = None
    admin_remark: str | None = None


class ModerationItemCreate(BaseModel):
    content_type: str
    content_id: str | None = None
    content: dict[str, Any] | list[Any] | None = None
    content_text: str | None = None
    reason: str | None = None


class ModerationItemUpdate(BaseModel):
    status: Literal["pending", "approved", "rejected"] | None = None
    review_note: str | None = None


class ModerationItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    content_type: str
    content_id: str | None = None
    content: dict[str, Any] | list[Any] | None = None
    content_text: str | None = None
    status: str
    reason: str | None = None
    review_note: str | None = None
    created_by: UUID | None = None
    reviewed_by: UUID | None = None
    reviewed_at: datetime | None = None
    created_at: datetime
    updated_at: datetime


class SystemSettingUpdate(BaseModel):
    value: Any
    description: str | None = None


class SystemSettingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    key: str
    value: Any
    description: str | None = None
    updated_by: UUID | None = None
    created_at: datetime
    updated_at: datetime
