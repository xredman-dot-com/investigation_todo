from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status as http_status
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.deps import require_admin
from src.core.database import get_db
from src.models.moderation import ModerationItem
from src.models.system_setting import SystemSetting
from src.models.user import User
from src.schemas.admin import (
    ModerationItemCreate,
    ModerationItemOut,
    ModerationItemUpdate,
    SystemSettingOut,
    SystemSettingUpdate,
    UserAdminOut,
    UserAdminUpdate,
)

router = APIRouter()


@router.get("/users", response_model=list[UserAdminOut])
async def list_users(
    q: str | None = None,
    status: str | None = None,
    role: str | None = None,
    limit: int = 100,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> list[User]:
    stmt = select(User)
    if status:
        stmt = stmt.where(User.status == status)
    if role:
        stmt = stmt.where(User.role == role)
    if q:
        like_query = f"%{q}%"
        stmt = stmt.where(
            or_(
                User.openid.ilike(like_query),
                User.nickname.ilike(like_query),
                User.unionid.ilike(like_query),
            )
        )
    stmt = stmt.order_by(User.created_at.desc()).limit(limit).offset(offset)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/users/{user_id}", response_model=UserAdminOut)
async def get_user(
    user_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> User:
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.patch("/users/{user_id}", response_model=UserAdminOut)
async def update_user(
    user_id: UUID,
    payload: UserAdminUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> User:
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail="User not found")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(user, key, value)

    await db.commit()
    await db.refresh(user)
    return user


@router.get("/moderation", response_model=list[ModerationItemOut])
async def list_moderation_items(
    status: str | None = None,
    content_type: str | None = None,
    q: str | None = None,
    limit: int = 100,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> list[ModerationItem]:
    stmt = select(ModerationItem)
    if status:
        stmt = stmt.where(ModerationItem.status == status)
    if content_type:
        stmt = stmt.where(ModerationItem.content_type == content_type)
    if q:
        like_query = f"%{q}%"
        stmt = stmt.where(
            or_(
                ModerationItem.content_id.ilike(like_query),
                ModerationItem.content_text.ilike(like_query),
            )
        )
    stmt = stmt.order_by(ModerationItem.created_at.desc()).limit(limit).offset(offset)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.post("/moderation", response_model=ModerationItemOut, status_code=http_status.HTTP_201_CREATED)
async def create_moderation_item(
    payload: ModerationItemCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> ModerationItem:
    new_item = ModerationItem(
        content_type=payload.content_type,
        content_id=payload.content_id,
        content=payload.content,
        content_text=payload.content_text,
        reason=payload.reason,
        status="pending",
        created_by=current_user.id,
    )
    db.add(new_item)
    await db.commit()
    await db.refresh(new_item)
    return new_item


@router.patch("/moderation/{item_id}", response_model=ModerationItemOut)
async def update_moderation_item(
    item_id: UUID,
    payload: ModerationItemUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> ModerationItem:
    result = await db.execute(select(ModerationItem).where(ModerationItem.id == item_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND, detail="Moderation item not found"
        )

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(item, key, value)

    if "status" in update_data:
        if item.status in {"approved", "rejected"}:
            item.reviewed_by = current_user.id
            item.reviewed_at = datetime.utcnow()
        else:
            item.reviewed_by = None
            item.reviewed_at = None

    await db.commit()
    await db.refresh(item)
    return item


@router.get("/settings", response_model=list[SystemSettingOut])
async def list_settings(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> list[SystemSetting]:
    result = await db.execute(select(SystemSetting).order_by(SystemSetting.key.asc()))
    return result.scalars().all()


@router.get("/settings/{key}", response_model=SystemSettingOut)
async def get_setting(
    key: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> SystemSetting:
    result = await db.execute(select(SystemSetting).where(SystemSetting.key == key))
    setting = result.scalar_one_or_none()
    if not setting:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND, detail="Setting not found"
        )
    return setting


@router.put("/settings/{key}", response_model=SystemSettingOut)
async def upsert_setting(
    key: str,
    payload: SystemSettingUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> SystemSetting:
    result = await db.execute(select(SystemSetting).where(SystemSetting.key == key))
    setting = result.scalar_one_or_none()
    if setting is None:
        setting = SystemSetting(
            key=key,
            value=payload.value,
            description=payload.description,
            updated_by=current_user.id,
        )
        db.add(setting)
    else:
        setting.value = payload.value
        setting.description = payload.description
        setting.updated_by = current_user.id

    await db.commit()
    await db.refresh(setting)
    return setting
