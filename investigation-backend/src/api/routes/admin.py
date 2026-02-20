from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status as http_status
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.deps import require_admin
from src.core.database import get_db
from src.models.audit_log import AuditLog
from src.models.moderation import ModerationItem
from src.models.system_setting import SystemSetting
from src.models.task import Task
from src.models.user import User
from src.schemas.admin import (
    AdminSummary,
    AuditLogOut,
    ModerationItemCreate,
    ModerationItemOut,
    ModerationItemUpdate,
    SystemSettingOut,
    SystemSettingUpdate,
    UserAdminOut,
    UserAdminUpdate,
)

router = APIRouter()


def _add_audit_log(
    db: AsyncSession,
    actor_id: UUID | None,
    action: str,
    resource_type: str,
    resource_id: str | None = None,
    detail: dict | None = None,
) -> None:
    db.add(
        AuditLog(
            actor_id=actor_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            detail=detail,
        )
    )


@router.get("/summary", response_model=AdminSummary)
async def admin_summary(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> AdminSummary:
    users_total = (await db.execute(select(func.count(User.id)))).scalar_one()
    users_active = (
        await db.execute(select(func.count(User.id)).where(User.status == "active"))
    ).scalar_one()
    users_banned = (
        await db.execute(select(func.count(User.id)).where(User.status == "banned"))
    ).scalar_one()
    tasks_total = (await db.execute(select(func.count(Task.id)))).scalar_one()
    tasks_completed = (
        await db.execute(select(func.count(Task.id)).where(Task.completed_at.is_not(None)))
    ).scalar_one()
    moderation_pending = (
        await db.execute(select(func.count(ModerationItem.id)).where(ModerationItem.status == "pending"))
    ).scalar_one()
    settings_count = (await db.execute(select(func.count(SystemSetting.id)))).scalar_one()

    return AdminSummary(
        users_total=users_total,
        users_active=users_active,
        users_banned=users_banned,
        tasks_total=tasks_total,
        tasks_completed=tasks_completed,
        moderation_pending=moderation_pending,
        settings_count=settings_count,
    )


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
                User.username.ilike(like_query),
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

    _add_audit_log(
        db,
        current_user.id,
        action="user.update",
        resource_type="user",
        resource_id=str(user.id),
        detail=update_data,
    )
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
    _add_audit_log(
        db,
        current_user.id,
        action="moderation.create",
        resource_type="moderation_item",
        resource_id=str(new_item.id),
        detail={"content_type": payload.content_type, "content_id": payload.content_id},
    )
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

    _add_audit_log(
        db,
        current_user.id,
        action="moderation.update",
        resource_type="moderation_item",
        resource_id=str(item.id),
        detail=update_data,
    )
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

    _add_audit_log(
        db,
        current_user.id,
        action="settings.upsert",
        resource_type="system_setting",
        resource_id=key,
        detail={"value": payload.value, "description": payload.description},
    )
    await db.commit()
    await db.refresh(setting)
    return setting


@router.get("/logs", response_model=list[AuditLogOut])
async def list_audit_logs(
    action: str | None = None,
    resource_type: str | None = None,
    actor_id: UUID | None = None,
    q: str | None = None,
    limit: int = 100,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> list[AuditLog]:
    stmt = select(AuditLog)
    if action:
        stmt = stmt.where(AuditLog.action == action)
    if resource_type:
        stmt = stmt.where(AuditLog.resource_type == resource_type)
    if actor_id:
        stmt = stmt.where(AuditLog.actor_id == actor_id)
    if q:
        like_query = f"%{q}%"
        stmt = stmt.where(AuditLog.resource_id.ilike(like_query))
    stmt = stmt.order_by(AuditLog.created_at.desc()).limit(limit).offset(offset)
    result = await db.execute(stmt)
    return result.scalars().all()
