from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database import get_db
from src.core.security import create_access_token, verify_password
from src.models.list import List
from src.models.user import User
from src.schemas.auth import AdminLoginRequest, TokenResponse, WeChatLoginRequest
from src.services.wechat import WeChatAPIError, exchange_code_for_session

router = APIRouter()


@router.post("/wechat", response_model=TokenResponse)
async def login_wechat(payload: WeChatLoginRequest, db: AsyncSession = Depends(get_db)) -> TokenResponse:
    try:
        session = await exchange_code_for_session(payload.code)
    except WeChatAPIError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    result = await db.execute(select(User).where(User.openid == session.openid))
    user = result.scalar_one_or_none()

    if not user:
        user = User(
            openid=session.openid,
            unionid=session.unionid,
            nickname=payload.nickname,
            avatar_url=payload.avatar_url,
            last_login_at=datetime.utcnow(),
        )
        db.add(user)
        await db.flush()
        db.add(List(user_id=user.id, name="Inbox", sort_order=0))
    else:
        user.last_login_at = datetime.utcnow()
        if payload.nickname:
            user.nickname = payload.nickname
        if payload.avatar_url:
            user.avatar_url = payload.avatar_url
        if session.unionid:
            user.unionid = session.unionid
        result = await db.execute(select(List.id).where(List.user_id == user.id).limit(1))
        if result.scalar_one_or_none() is None:
            db.add(List(user_id=user.id, name="Inbox", sort_order=0))

    await db.commit()
    await db.refresh(user)

    token = create_access_token(str(user.id))
    return TokenResponse(access_token=token)


@router.post("/admin", response_model=TokenResponse)
async def login_admin(payload: AdminLoginRequest, db: AsyncSession = Depends(get_db)) -> TokenResponse:
    result = await db.execute(select(User).where(User.username == payload.username))
    user = result.scalar_one_or_none()
    if not user or not user.password_hash:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    if not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    if user.status != "active":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User is not active")
    if user.role not in {"admin", "owner"}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")

    user.last_login_at = datetime.utcnow()
    await db.commit()
    await db.refresh(user)
    token = create_access_token(str(user.id))
    return TokenResponse(access_token=token)
